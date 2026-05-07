import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || '';

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
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
    // 1. GET /documents (List all vault items)
    if (method === 'GET') {
      const result = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `FACULTY#${userId}`,
          ':prefix': 'DOC#'
        }
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(result.Items || [])
      };
    }

    // 2. POST /documents/upload-url (Create URL + Metadata)
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { fileName, fileType, module, fileSize } = body; 

      if (!fileName || !fileType) {
        return { statusCode: 400, headers: CORS_HEADERS, body: 'Missing fileName or fileType' };
      }

      const timestamp = Date.now();
      const fileId = `DOC#${timestamp}`;
      const key = `vault/${userId}/${module || 'general'}/${timestamp}-${fileName}`;

      // Save Metadata first (as PENDING)
      await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `FACULTY#${userId}`,
          SK: fileId,
          fileName,
          fileType,
          fileSize: fileSize || 'Unknown',
          module: module || 'vault',
          s3Key: key,
          status: 'VERIFIED', // Auto-verify for now
          createdAt: new Date().toISOString()
        }
      }));

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ uploadUrl, key })
      };
    }

    return { statusCode: 404, headers: CORS_HEADERS, body: 'Not Found' };
  } catch (err: any) {
    console.error('S3/DB Vault Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
