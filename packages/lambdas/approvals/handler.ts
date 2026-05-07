import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const eventBridge = new EventBridgeClient({});

const TABLE_NAME = process.env.TABLE_NAME || '';
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const path = event.path;
  
  // Assume user role/campus comes from Cognito claims
  const role = event.requestContext.authorizer?.claims['custom:role'] || 'HOD';
  const campus = event.requestContext.authorizer?.claims['custom:campus'] || 'BENGALURU';

  try {
    // 1. GET /approvals/pending - Fetch items for this HoD's campus
    if (method === 'GET') {
      const response = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': 'PUB#PENDING',
          ':sk': `CAMPUS#${campus}`
        }
      }));

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(response.Items || []),
      };
    }

    // 2. POST /approvals/decide - Approve or Reject
    if (method === 'POST') {
      const { facultyId, pubId, decision, comments } = JSON.parse(event.body || '{}');

      // Update item status in DynamoDB
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `FACULTY#${facultyId}`, SK: pubId },
        UpdateExpression: 'SET #s = :status, approvalComments = :c, updatedAt = :t, GSI1PK = :gpk',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':status': decision, // 'APPROVED' or 'REJECTED'
          ':c': comments,
          ':t': new Date().toISOString(),
          ':gpk': decision === 'APPROVED' ? 'PUB#APPROVED' : 'PUB#REJECTED'
        }
      }));

      // 3. Emit event so Score Engine (Module 14) can recalculate
      await eventBridge.send(new PutEventsCommand({
        Entries: [{
          Source: 'prajna.approvals',
          DetailType: 'ApprovalDecisionMade',
          Detail: JSON.stringify({ facultyId, pubId, decision, role }),
          EventBusName: EVENT_BUS_NAME
        }]
      }));

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: `Publication ${decision.toLowerCase()} successfully` }),
      };
    }

    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
