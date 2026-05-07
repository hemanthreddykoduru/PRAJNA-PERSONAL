import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const path = event.path;
  const authPayload = event.requestContext.authorizer?.claims;
  const userId = authPayload?.sub;
  const userRole = authPayload?.['cognito:groups']?.[0] || 'Faculty';

  console.log(`Approvals Engine: ${method} ${path} for user ${userId} (${userRole})`);

  try {
    // 1. GET /approvals - List pending requests for HoD/Director
    if (method === 'GET') {
      // HoDs see their department's requests, Directors see their school's requests
      // For now, we query by the specific HoD/Director ID
      const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `APPROVAL#${userId}`,
          ':sk': 'STATUS#PENDING'
        }
      }));

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(response.Items || [])
      };
    }

    // 2. POST /approvals/{id}/action - Approve or Reject
    if (method === 'POST') {
      const approvalId = event.pathParameters?.id;
      const body = JSON.parse(event.body || '{}');
      const { action, comment } = body; // action = 'APPROVED' | 'REJECTED'

      if (!approvalId || !['APPROVED', 'REJECTED'].includes(action)) {
        return { statusCode: 400, body: 'Invalid action or missing ID' };
      }

      // Update the approval record
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { 
          PK: `APPROVAL#${userId}`, 
          SK: `STATUS#PENDING#${approvalId}` 
        },
        UpdateExpression: 'SET #s = :newStatus, #c = :comment, #t = :updatedAt',
        ExpressionAttributeNames: {
          '#s': 'status',
          '#c': 'approverComment',
          '#t': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':newStatus': action,
          ':comment': comment || '',
          ':updatedAt': Date.now()
        }
      }));

      // TODO: Fire EventBridge event for notifications/downstream processing
      
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: `Request ${action.toLowerCase()} successfully` })
      };
    }

    return { statusCode: 404, body: 'Not Found' };
  } catch (err: any) {
    console.error('Approvals Error:', err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
