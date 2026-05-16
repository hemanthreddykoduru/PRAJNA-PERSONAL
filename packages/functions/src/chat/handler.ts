import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const TABLE_NAME = process.env.TABLE_NAME || '';
const USER_TABLE = process.env.USER_TABLE_NAME || '';

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
    if (method === 'POST') {
      const { content, timestamp } = JSON.parse(event.body || '{}');
      if (!content) return { statusCode: 400, headers: CORS_HEADERS, body: 'Missing content' };

      // 1. Save User Message
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { userId, timestamp: timestamp || Date.now(), role: 'user', content },
      }));

      // 2. Fetch Context (Last 5 messages + Profile)
      const historyRes = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        Limit: 5,
        ScanIndexForward: false,
      }));

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
        - Publications: ${researchData.length}
      `;

      // 3. Build Claude Messages
      let lastRole = '';
      const chatMessages: any[] = [];
      (historyRes.Items || []).reverse().forEach(m => {
        const r = m.role === 'assistant' ? 'assistant' : 'user';
        if (r !== lastRole) {
          chatMessages.push({ role: r, content: [{ type: 'text', text: m.content }] });
          lastRole = r;
        }
      });

      if (chatMessages.length === 0) chatMessages.push({ role: 'user', content: [{ type: 'text', text: content }] });

      // 4. Invoke Claude 3 Haiku (Higher Quota)
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        system: `You are PRAJNA, the official AI Career Companion for GITAM University. 
                 Use this context: ${contextFacts}`,
        messages: chatMessages
      };

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiContent = responseBody.content[0].text;
      const aiTimestamp = Date.now();

      // 5. Save AI Response
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { userId, timestamp: aiTimestamp, role: 'assistant', content: aiContent },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ role: 'assistant', content: aiContent, timestamp: aiTimestamp }),
      };
    }

    if (method === 'GET') {
      const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        Limit: 50,
        ScanIndexForward: false,
      }));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(response.Items || []) };
    }

    return { statusCode: 404, headers: CORS_HEADERS, body: 'Not Found' };
  } catch (err: any) {
    console.error('Chat Error:', err);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
