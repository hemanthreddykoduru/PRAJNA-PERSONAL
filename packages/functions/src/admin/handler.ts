import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { logAction } from '../audit/logger';

const cognito = new CognitoIdentityProviderClient({});
const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);

const USER_POOL_ID = process.env.USER_POOL_ID!;
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event: any) => {
  console.log("Admin Event:", JSON.stringify(event));
  const adminId = event.requestContext?.authorizer?.claims?.sub || 'system-admin';
  const action = event.queryStringParameters?.action;
  
  const headers = { 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };

  try {
    switch (action) {
      case 'list':
        // Use SCAN to find all PROFILE records in the table
        // This is necessary because PKs are unique per user
        const profiles = await docClient.send(new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :skValue",
          ExpressionAttributeValues: {
            ":skValue": "PROFILE"
          }
        }));
        
        console.log("Profiles found in DynamoDB:", profiles.Items?.length);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(profiles.Items || [])
        };

      case 'create':
        const { name, email, department, role, campus } = JSON.parse(event.body || '{}');
        await cognito.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          UserAttributes: [
            { Name: 'name', Value: name },
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'custom:role', Value: role },
            { Name: 'custom:department', Value: department },
            { Name: 'custom:campus', Value: campus || 'Bengaluru' }
          ],
          DesiredDeliveryMediums: ['EMAIL']
        }));

        await logAction(adminId, 'CREATE_USER', { name, email, role }, event.requestContext?.identity?.sourceIp || '0.0.0.0');

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ message: "User created successfully" })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid action" })
        };
    }
  } catch (error: any) {
    console.error("Admin error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};
