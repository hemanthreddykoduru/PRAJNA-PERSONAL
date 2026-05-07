import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  ListUsersCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { logAction } from '../audit/logger';

const cognito = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.USER_POOL_ID!;

export const handler: APIGatewayProxyHandler = async (event: any) => {
  const adminId = event.requestContext?.authorizer?.claims?.sub || 'system-admin';
  const action = event.queryStringParameters?.action;

  try {
    switch (action) {
      case 'list':
        const listData = await cognito.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID }));
        return {
          statusCode: 200,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
          },
          body: JSON.stringify(listData.Users)
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
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
          },
          body: JSON.stringify({ message: "User created successfully" })
        };

      case 'updateRole':
        const { userId, newRole } = JSON.parse(event.body || '{}');
        await cognito.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: userId,
          UserAttributes: [{ Name: 'custom:role', Value: newRole }]
        }));

        await logAction(adminId, 'UPDATE_ROLE', { targetUser: userId, newRole }, event.requestContext.identity.sourceIp);

        return {
          statusCode: 200,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
          },
          body: JSON.stringify({ message: "Role updated successfully" })
        };

      default:
        return {
          statusCode: 400,
          headers: { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
          },
          body: JSON.stringify({ message: "Invalid action" })
        };
    }
  } catch (error: any) {
    console.error("Admin error:", error);
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
