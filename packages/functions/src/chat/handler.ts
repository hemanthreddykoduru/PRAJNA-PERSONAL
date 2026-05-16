import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// DoubleWord Config
const DOUBLEWORD_API_KEY = process.env.DOUBLEWORD_API_KEY || 'sk-YLMHC1W5OJ5dXZ3GT8Y_plH6f5Ciw5vXz95I-7zAN_o';
const DOUBLEWORD_URL = "https://api.doubleword.ai/v1/chat/completions";

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

      // 2. Fetch Context
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
      const contextFacts = `
        FACULTY: ${profileData.name || 'GITAM Faculty'}
        DEPT: ${profileData.department || 'N/A'}
        SCORE: ${profileData.prajnaScore || 0}
        TIER: ${profileData.tier || 'BRONZE'}
      `;

      // 3. Build Messages
      const chatMessages = (historyRes.Items || []).reverse().map(m => ({
        role: m.role,
        content: m.content
      }));
      
      if (chatMessages.length === 0) chatMessages.push({ role: 'user', content });

      // 4. Call DoubleWord API
      const response = await fetch(DOUBLEWORD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DOUBLEWORD_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // DoubleWord supports standard model names
          messages: [
            { role: "system", content: `You are PRAJNA, the official AI Companion for GITAM University. Context: ${contextFacts}` },
            ...chatMessages
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const aiContent = data.choices[0].message.content;
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
