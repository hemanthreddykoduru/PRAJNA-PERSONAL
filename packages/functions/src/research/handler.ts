import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const eventBridge = new EventBridgeClient({});
const TABLE = process.env.TABLE_NAME!;
const EVENT_BUS = process.env.EVENT_BUS_NAME || 'PrajnaBus';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const ok = (body: unknown, status = 200): APIGatewayProxyResult => ({
  statusCode: status,
  headers: CORS,
  body: JSON.stringify(body),
});

const err = (msg: string, status = 500): APIGatewayProxyResult => ({
  statusCode: status,
  headers: CORS,
  body: JSON.stringify({ error: msg }),
});

/** Compute H-Index from a list of citation counts */
function computeHIndex(citations: number[]): number {
  const sorted = [...citations].sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) h = i + 1;
    else break;
  }
  return h;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const facultyId =
    (event.requestContext as any)?.authorizer?.claims?.sub || 'anonymous';
  const method = event.httpMethod;

  try {
    // ── GET /research ── list my publications + metrics
    if (method === 'GET') {
      const result = await db.send(
        new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: {
            ':pk': `FACULTY#${facultyId}`,
            ':prefix': 'PUB#',
          },
        })
      );

      const publications = result.Items ?? [];
      const citations = publications.map((p) => Number(p.citations ?? 0));
      const totalCitations = citations.reduce((a, b) => a + b, 0);
      const hIndex = computeHIndex(citations);

      return ok({
        publications,
        metrics: {
          hIndex,
          totalCitations,
          totalPublications: publications.length,
        },
      });
    }

    // ── POST /research ── save a new publication
    if (method === 'POST') {
      const body = JSON.parse(event.body ?? '{}');
      const { title, journal, year, authors, doi, indexing, citations = 0 } = body;

      if (!title || !doi) return err('title and doi are required', 400);

      const pubId = `PUB#${doi.replace(/\//g, '_')}`;

      const item = {
        PK: `FACULTY#${facultyId}`,
        SK: pubId,
        pubId,
        facultyId,
        title,
        journal: journal ?? '',
        year: Number(year) || new Date().getFullYear(),
        authors: authors ?? [],
        doi,
        indexing: indexing ?? 'Other',
        citations: Number(citations),
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };

      await db.send(new PutCommand({ TableName: TABLE, Item: item }));

      // --- EMIT EVENT ---
      try {
        await eventBridge.send(new PutEventsCommand({
          Entries: [{
            Source: 'prajna.research',
            DetailType: 'RESEARCH_SUBMITTED',
            Detail: JSON.stringify({
              userId: facultyId,
              title: item.title,
              doi: item.doi,
              authors: item.authors
            }),
            EventBusName: EVENT_BUS
          }]
        }));
      } catch (eventError) {
        console.error('Failed to emit research event:', eventError);
      }

      return ok({ message: 'Publication submitted for approval', publication: item }, 201);
    }

    return err('Method not allowed', 405);
  } catch (e: any) {
    console.error('ResearchHandler error:', e);
    return err(e.message ?? 'Internal error');
  }
};
