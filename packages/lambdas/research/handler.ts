import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import axios from 'axios';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const eventBridge = new EventBridgeClient({});

const TABLE_NAME = process.env.TABLE_NAME || '';
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;
  const empId = event.requestContext.authorizer?.claims['custom:empId'] || 'TEST_USER';

  try {
    // 1. DOI Metadata Lookup
    if (path.includes('/lookup') && method === 'GET') {
      const doi = event.queryStringParameters?.doi;
      if (!doi) return { statusCode: 400, body: JSON.stringify({ message: 'DOI is required' }) };

      const response = await axios.get(`https://api.crossref.org/works/${doi}`);
      const item = response.data.message;

      const metadata = {
        title: item.title?.[0] || 'Unknown Title',
        journal: item['container-title']?.[0] || 'Unknown Journal',
        year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
        authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
        doi: doi,
        indexing: item.assertion?.some((a: any) => a.name === 'scopus') ? 'Scopus' : 'Other'
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(metadata),
      };
    }

    // 2. Submit Publication
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const pubId = `PUB#${Date.now()}`;
      
      const pubItem = {
        PK: `FACULTY#${empId}`,
        SK: pubId,
        GSI1PK: 'PUB#PENDING',
        GSI1SK: `CAMPUS#${body.campus}#DEPT#${body.department}#${pubId}`,
        type: 'PUBLICATION',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        ...body
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: pubItem,
      }));

      // 3. Emit Event for HoD Notification
      await eventBridge.send(new PutEventsCommand({
        Entries: [{
          Source: 'prajna.research',
          DetailType: 'PublicationSubmitted',
          Detail: JSON.stringify(pubItem),
          EventBusName: EVENT_BUS_NAME
        }]
      }));

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Publication submitted for approval', pubId }),
      };
    }

    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };

  } catch (error: any) {
    console.error(error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ message: 'Error processing research request', error: error.message }),
    };
  }
};
