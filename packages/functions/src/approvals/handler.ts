import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE = process.env.TABLE_NAME!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const path = event.path;

  try {
    // ── GET /approvals ── list all pending items
    if (method === 'GET') {
      const result = await db.send(
        new ScanCommand({
          TableName: TABLE,
          FilterExpression: '#s = :status',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':status': 'PENDING' },
        })
      );

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify(result.Items ?? []),
      };
    }

    // ── POST /approvals/{id}/action ── approve/reject
    if (method === 'POST') {
      const body = JSON.parse(event.body ?? '{}');
      const { pk, sk, action } = body; // action: 'APPROVED' or 'REJECTED'

      if (!pk || !sk || !action) {
        return { statusCode: 400, headers: CORS, body: 'pk, sk, and action are required' };
      }

      await db.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { PK: pk, SK: sk },
          UpdateExpression: 'SET #s = :status, processedAt = :ts',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: {
            ':status': action,
            ':ts': new Date().toISOString(),
          },
        })
      );

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ message: `Item ${action} successfully` }),
      };
    }

    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  } catch (e: any) {
    console.error('ApprovalsHandler error:', e);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
