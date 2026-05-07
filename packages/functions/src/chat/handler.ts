import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const TABLE_NAME = process.env.TABLE_NAME || '';
const USER_TABLE = process.env.USER_TABLE_NAME || 'PrajnaFoundationStack-PrajnaMainTableV26CEEDB9C-ZXT10QOV6MBE';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const authPayload = event.requestContext.authorizer?.claims;
  const userId = authPayload?.sub;

  if (!userId) {
    return { statusCode: 401, headers: CORS_HEADERS, body: 'Unauthorized' };
  }

  try {
    // 1. POST /history (Save message & trigger AI)
    if (method === 'POST') {
      const { role, content, timestamp } = JSON.parse(event.body || '{}');

      if (!content) return { statusCode: 400, headers: CORS_HEADERS, body: 'Missing content' };

      // Save the User Message
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { userId, timestamp: timestamp || Date.now(), role: 'user', content },
      }));

      // A. Fetch Chat History
      const historyRes = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        Limit: 10,
        ScanIndexForward: false,
      }));

      // B. Fetch Faculty Context
      const profileRes = await docClient.send(new QueryCommand({
        TableName: USER_TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': `FACULTY#${userId}` },
      }));

      const profileData = profileRes.Items?.find(i => i.SK === 'PROFILE') || {};
      const researchData = profileRes.Items?.filter(i => i.SK.startsWith('PUB#')) || [];

      const contextFacts = `
        FACULTY_PROFILE:
        - Name: ${profileData.name || 'GITAM Faculty'}
        - Department: ${profileData.department || 'N/A'}
        - PRAJNA Score: ${profileData.prajnaScore || 0}
        - Tier: ${profileData.tier || 'BRONZE'}
        - Total Publications: ${researchData.length}
        - Indexed Publications: ${researchData.filter(r => r.indexing !== 'Other').length}
        - Top Journals: ${researchData.slice(0, 5).map(r => r.journal).join(', ')}
        - Last Published: ${researchData[0]?.year || 'N/A'}
      `;

      // C. Build Messages with Role Alternation
      let lastRole = '';
      const messages: any[] = [];
      (historyRes.Items || []).reverse().forEach(m => {
        const r = m.role === 'assistant' ? 'assistant' : 'user';
        if (r !== lastRole) {
          messages.push({ role: r, content: [{ type: 'text', text: m.content }] });
          lastRole = r;
        }
      });

      if (messages.length > 0 && messages[0].role !== 'user') messages.shift();
      if (messages.length === 0) messages.push({ role: 'user', content: [{ type: 'text', text: content }] });

      // D. Invoke Bedrock (Nova Micro)
      const payload = {
        inferenceConfig: { maxNewTokens: 1000, temperature: 0.7 },
        messages: messages,
        system: [{ text: `You are PRAJNA, the official AI Career Companion for faculty at GITAM University. 
                           Your goal is to help faculty improve their research impact, teaching delivery, and overall PRAJNA score.
                           Use the following context to provide DATA-DRIVEN advice:
                           ${contextFacts}
                           
                           Guidelines:
                           1. If a faculty member has low indexed publications, suggest focusing on Scopus/Web of Science journals.
                           2. Reference NAAC and NIRF standards when suggesting improvements.
                           3. Be encouraging, professional, and GITAM-centric.
                           4. If they ask about their score, analyze their Tier and suggest specific steps to reach the next one.` }]
      };

      try {
        const command = new InvokeModelCommand({
          modelId: "amazon.nova-micro-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(payload),
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiContent = responseBody.output.message.content[0].text;
        const aiTimestamp = Date.now();

        // Save AI Response
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: { userId, timestamp: aiTimestamp, role: 'assistant', content: aiContent },
        }));

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ role: 'assistant', content: aiContent, timestamp: aiTimestamp }),
        };
      } catch (aiErr: any) {
        console.error("Bedrock AI Error:", aiErr);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ 
            role: 'assistant', 
            content: `My Bedrock brain is currently processing a large amount of academic data. I'll be ready in a moment! (Error: ${aiErr.message})`, 
            timestamp: Date.now() 
          }),
        };
      }
    }

    // 2. GET /history (Fetch conversation)
    if (method === 'GET') {
      const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        Limit: 50,
        ScanIndexForward: false,
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(response.Items || []),
      };
    }

    return { statusCode: 404, headers: CORS_HEADERS, body: 'Not Found' };
  } catch (err: any) {
    console.error('Chat Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
