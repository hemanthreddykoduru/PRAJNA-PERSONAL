import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event: any) => {
  const facultyId = event.requestContext?.authorizer?.claims?.sub || 'anonymous';
  const method = event.httpMethod;

  try {
    if (method === 'POST') {
      const { subject, room, duration, date, department } = JSON.parse(event.body || '{}');
      
      const session = {
        facultyId,
        date, // Format: YYYY-MM-DD#TIMESTAMP
        subject,
        room,
        duration: Number(duration),
        department,
        loggedAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: session
      }));

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        },
        body: JSON.stringify({ message: "Attendance logged successfully", session })
      };
    }

    if (method === 'GET') {
      const data = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "facultyId = :id",
        ExpressionAttributeValues: {
          ":id": facultyId
        },
        ScanIndexForward: false, // Latest first
        Limit: 50
      }));

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        },
        body: JSON.stringify(data.Items)
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  } catch (error: any) {
    console.error("Attendance error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify({ message: error.message })
    };
  }
};
