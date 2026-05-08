import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  ListUsersCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
        // Fetch all items from DynamoDB that are PROFILE records
        // For production, this should be a scan or a specific GSI, but for our PK strategy:
        // We'll perform a scan for PK starting with USER# and SK = PROFILE
        const profiles = await docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "begins_with(PK, :pkPrefix)",
          ExpressionAttributeValues: {
            ":pkPrefix": "USER#"
          }
        }));
        
        // Filter for PROFILE records specifically if needed, though SK is PROFILE
        const users = profiles.Items?.filter(item => item.SK === 'PROFILE') || [];

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(users)
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
