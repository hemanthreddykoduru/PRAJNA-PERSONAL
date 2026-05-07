import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const authPayload = event.requestContext.authorizer?.claims;
  const userId = authPayload?.sub;

  if (!userId) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  console.log(`Profile Engine: ${method} for user ${userId}`);

  try {
    // 1. GET /faculty/profile
    if (method === 'GET') {
      const response = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `FACULTY#${userId}`, SK: 'PROFILE' }
      }));

      if (!response.Item) {
        // Return a default profile if none exists
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({
            prajnaScore: 0,
            tier: 'BRONZE',
            publications: 0,
            citations: 0,
            hIndex: 0,
            lastUpdated: new Date().toISOString()
          })
        };
      }

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(response.Item)
      };
    }

    // 2. PUT /faculty/profile
    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      
      const newProfile = {
        PK: `FACULTY#${userId}`,
        SK: 'PROFILE',
        ...body,
        updatedAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newProfile
      }));

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Profile updated successfully' })
      };
    }

    return { statusCode: 404, body: 'Not Found' };
  } catch (err: any) {
    console.error('Profile Error:', err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
