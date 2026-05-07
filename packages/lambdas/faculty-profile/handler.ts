import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const empId = event.requestContext.authorizer?.claims['custom:empId'] || 'TEST_USER'; // Fallback for local testing

  try {
    switch (method) {
      case 'GET':
        const getResult = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `FACULTY#${empId}`, SK: 'PROFILE' },
        }));
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(getResult.Item || { message: 'Profile not found' }),
        };

      case 'PUT':
        const body = JSON.parse(event.body || '{}');
        const profileItem = {
          PK: `FACULTY#${empId}`,
          SK: 'PROFILE',
          GSI1PK: `CAMPUS#${body.campus}`,
          GSI1SK: `DEPT#${body.department}#FACULTY#${empId}`,
          ...body,
          updatedAt: new Date().toISOString(),
        };

        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: profileItem,
        }));

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ message: 'Profile updated successfully', item: profileItem }),
        };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: (error as Error).message }),
    };
  }
};
