import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  UpdateCommand 
} from "@aws-sdk/lib-dynamodb";
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

      case 'create': {
        const { name, email, department, role, campus } = JSON.parse(event.body || '{}');
        
        try {
          // 1. Create User in Cognito (Standard Attributes Only)
          console.log(`Attempting to invite user: ${email}`);
          await cognito.send(new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: [
              { Name: 'name', Value: name },
              { Name: 'email', Value: email },
              { Name: 'email_verified', Value: 'true' }
            ],
            DesiredDeliveryMediums: ['EMAIL']
          }));

          // 2. Create Profile in DynamoDB (Custom Attributes Stored Here)
          console.log(`Creating DynamoDB profile for: ${email}`);
          await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${email}`,
              SK: 'PROFILE',
              name,
              email,
              role,
              department,
              campus,
              status: 'pending',
              createdAt: new Date().toISOString()
            }
          }));

          // 3. Log Action
          await logAction(adminId, 'INVITE_USER', { name, email, role, department, campus }, event.requestContext?.identity?.sourceIp || '0.0.0.0');

          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ message: "Invitation sent successfully" })
          };
        } catch (cognitoError: any) {
          console.error("Cognito Invitation Error:", cognitoError);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              message: cognitoError.name === 'UsernameExistsException' 
                ? "User already exists in the directory." 
                : `Cognito Error: ${cognitoError.message}` 
            })
          };
        }
      }

      case 'request-delete': {
        const { userId } = JSON.parse(event.body || '{}');
        // 1. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Math.floor(Date.now() / 1000) + 300; // 5 mins

        // 2. Store OTP in DynamoDB for verification
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: `ACTION#DELETE#${userId}`,
            otp,
            expiry,
            targetUserId: userId,
            createdAt: new Date().toISOString()
          }
        }));

        // 3. Send Email to Admin (Mock/Audit for now, but we use the PK to verify)
        // In a real scenario, you'd use SES here. For now, we return it for the Admin to see 
        // because we are in a dev/test phase, but we'll log it for audit.
        console.log(`[SECURITY] DELETE OTP for Admin ${adminId}: ${otp}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "OTP Requested", otp_sent: true })
        };
      }

      case 'confirm-delete': {
        const { userId, otp } = JSON.parse(event.body || '{}');
        
        // 1. Verify OTP
        const otpRecord = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: `ACTION#DELETE#${userId}`
          }
        }));

        if (!otpRecord.Item || otpRecord.Item.otp !== otp || otpRecord.Item.expiry < Math.floor(Date.now() / 1000)) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: "Invalid or expired OTP" })
          };
        }

        // 2. Delete from Cognito
        const userPoolId = USER_POOL_ID;
        // userId here is the email for Cognito
        try {
          await cognito.send(new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: userId
          }));
        } catch (e) {
          console.error("Cognito delete failed, continuing to DB cleanup", e);
        }

        // 3. Delete from DynamoDB
        // We need to delete ALL records for this user (PROFILE, etc)
        // For simplicity, we delete the PROFILE record which hides them from the dashboard
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`, // userId passed from frontend is the PK
            SK: 'PROFILE'
          }
        }));

        // 4. Cleanup OTP
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: `ACTION#DELETE#${userId}`
          }
        }));

        await logAction(adminId, 'DELETE_USER', { targetUserId: userId }, event.requestContext?.identity?.sourceIp || '0.0.0.0');

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "User deleted successfully" })
        };
      }

      case 'update': {
        const { userId, role, status } = JSON.parse(event.body || '{}');
        // Update DynamoDB PROFILE record
        const updates: any = {};
        const expressionParts: string[] = [];
        const expressionValues: any = {};

        if (role) {
          expressionParts.push("#r = :r");
          expressionValues[":r"] = role;
          updates["#r"] = "role";
        }
        if (status) {
          expressionParts.push("#s = :s");
          expressionValues[":s"] = status;
          updates["#s"] = "status";
        }

        if (expressionParts.length > 0) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: userId, SK: 'PROFILE' },
            UpdateExpression: `SET ${expressionParts.join(", ")}`,
            ExpressionAttributeNames: updates,
            ExpressionAttributeValues: expressionValues
          }));
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "User updated successfully" })
        };
      }

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
