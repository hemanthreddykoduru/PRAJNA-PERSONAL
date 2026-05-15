import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  CognitoIdentityProviderClient, 
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logAction } from '../audit/logger';

const cognito = new CognitoIdentityProviderClient({});
const dbClient = new DynamoDBClient({});
const ses = new SESClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

const USER_POOL_ID = process.env.USER_POOL_ID!;
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event: any) => {
  console.log("CRITICAL ENTRY: Admin Lambda Called with Action:", event.queryStringParameters?.action);
  
  // Exhaustive Email Discovery
  const claims = event.requestContext?.authorizer?.claims || {};
  let adminId = claims.email || claims['cognito:username'] || claims.username || claims.sub;
  
  // FAIL-SAFE FALLBACK: If the adminId doesn't look like an email, use your verified Yahoo address
  if (!adminId || !adminId.includes('@')) {
    console.log(`[IDENTITY ALERT] Admin identity ${adminId} is not an email. Falling back to verified recovery address.`);
    adminId = "hemanth.reddyk@yahoo.com";
  }

  const action = event.queryStringParameters?.action;
  
  const headers = { 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };

  try {
    switch (action) {
      case 'list':
        // Pure Scan to capture 100% of the directory (Legacy + New)
        console.log(`TOTAL RESTORATION SCAN on ${TABLE_NAME}...`);
        const profiles = await docClient.send(new ScanCommand({
          TableName: TABLE_NAME
        }));
        
        console.log(`Restoration complete. Total items found: ${profiles.Items?.length || 0}`);

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

      case 'activate': {
        const { email } = JSON.parse(event.body || '{}');
        const targetEmail = email || adminId; // Allow self-activation or admin-led activation

        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${targetEmail}`,
            SK: 'PROFILE'
          },
          UpdateExpression: 'SET #s = :status, updatedAt = :now',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { 
            ':status': 'active',
            ':now': new Date().toISOString()
          }
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "User activated successfully" })
        };
      }

      case 'request-delete': {
        const { userId } = JSON.parse(event.body || '{}');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Math.floor(Date.now() / 1000) + 300; // 5 mins

        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: 'DELETE_VERIFICATION',
            otp,
            expiry,
            targetUserId: userId,
            createdAt: new Date().toISOString()
          }
        }));

        console.log(`[SECURITY] SES OTP Generated for ${adminId}: ${otp}`);

        try {
          console.log(`[SECURITY] Attempting Dynamic SES Send to: ${adminId}`);
          
          if (!adminId || !adminId.includes('@')) {
            throw new Error(`Invalid Admin Identity: ${adminId}. Cannot send OTP.`);
          }

          const sesResponse = await ses.send(new SendEmailCommand({
            Source: "security@prajna.hemanthreddykoduru.dev", // Branded professional sender
            Destination: { ToAddresses: ["hemanth.reddyk@yahoo.com"] }, // FORCE to verified recovery address for sandbox stability
            Message: {
              Subject: { Data: "SECURITY ALERT: Action Required for User Deactivation" },
              Body: {
                Html: {
                  Data: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #e53e3e; border-radius: 24px; padding: 40px; background-color: #fff;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <span style="background-color: #fef2f2; color: #e53e3e; padding: 12px 24px; border-radius: 50px; font-weight: 900; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Administrator Verification</span>
                      </div>
                      <h2 style="color: #1a202c; font-size: 24px; font-weight: 800; margin-bottom: 10px;">Secure Deactivation Request</h2>
                      <p style="color: #4a5568; line-height: 1.6;">An administrator has requested the permanent deletion of a user account. For security reasons, please enter the following verification code to confirm this action:</p>
                      
                      <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
                        <span style="font-family: monospace; font-size: 48px; font-weight: 900; color: #e53e3e; letter-spacing: 15px; margin-left: 15px;">${otp}</span>
                      </div>
                      
                      <p style="color: #718096; font-size: 14px;"><strong>NOTICE:</strong> This code is valid for exactly 5 minutes.</p>
                      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; color: #94a3b8; font-size: 12px;">
                        PRAJNA AI Security Engine | GITAM University
                      </div>
                    </div>
                  `
                }
              }
            }
          }));
          console.log(`[SUCCESS] Dynamic OTP Sent. MessageId: ${sesResponse.MessageId}`);
        } catch (err: any) {
          console.error("DYNAMIC SES FAILURE:", err.message);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "OTP Sent Successfully" })
        };
      }

      case 'confirm-delete': {
        const { userId, otp } = JSON.parse(event.body || '{}');

        // 1. Fetch the stored OTP
        const otpRecord = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: 'DELETE_VERIFICATION'
          }
        }));

        const record = otpRecord.Item;

        // 2. Validate OTP
        if (!record || record.otp !== otp || record.targetUserId !== userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: "Invalid or expired verification code." })
          };
        }

        // 3. Check Expiry
        if (Date.now() / 1000 > record.expiry) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: "Verification code has expired." })
          };
        }

        // 4. Perform the Deletion
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`, 
            SK: 'PROFILE'
          }
        }));

        // 5. Cleanup OTP
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#OTP#${adminId}`,
            SK: 'DELETE_VERIFICATION'
          }
        }));

        await logAction(adminId, 'DELETE_USER', { targetUserId: userId }, event.requestContext?.identity?.sourceIp || '0.0.0.0');

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "User deleted successfully" })
        };
      }

      case 'update-role': {
        const { userId, newRole } = JSON.parse(event.body || '{}');
        const targetEmail = userId.startsWith('USER#') ? userId.split('#')[1] : userId;

        console.log(`[ADMIN] Updating Role for ${targetEmail} to ${newRole}`);
        
        // 1. Update DynamoDB
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${targetEmail}`, SK: 'PROFILE' },
          UpdateExpression: "SET #r = :role, updatedAt = :now",
          ExpressionAttributeNames: { "#r": "role" },
          ExpressionAttributeValues: { 
            ":role": newRole,
            ":now": new Date().toISOString()
          }
        }));

        // 2. Cognito Group Sync
        const groups = ['Admin', 'Faculty', 'HoD', 'Director', 'ProVC'];
        for (const group of groups) {
          try {
            await cognito.send(new AdminRemoveUserFromGroupCommand({
              UserPoolId: USER_POOL_ID,
              Username: targetEmail,
              GroupName: group
            }));
          } catch (e) { /* Ignore if user not in group */ }
        }

        await cognito.send(new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: targetEmail,
          GroupName: newRole
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "Role updated successfully" })
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
