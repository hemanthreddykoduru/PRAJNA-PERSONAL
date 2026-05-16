const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = require("/Users/hemanthmacbook/Documents/PRAJNA/packages/functions/node_modules/@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("/Users/hemanthmacbook/Documents/PRAJNA/packages/functions/node_modules/@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("/Users/hemanthmacbook/Documents/PRAJNA/packages/functions/node_modules/@aws-sdk/lib-dynamodb");

const REGION = "us-east-1"; 
const USER_POOL_ID = "us-east-1_BnSDF18kX";
const TABLE_NAME = "PrajnaFoundationStack-PrajnaPrimaryTableFinal602460EA-10JIG7HS2G312";
const TARGET_EMAIL = "hkoduru2@gitam.in";

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

async function purgeUser() {
  console.log(`\n🚀 STARTING EMERGENCY PURGE FOR: ${TARGET_EMAIL}\n`);

  try {
    console.log(`[1/2] Attempting to delete from Cognito...`);
    await cognito.send(new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: TARGET_EMAIL
    }));
    console.log(`✅ SUCCESS: User purged from Cognito.`);
  } catch (err) {
    console.log(`ℹ️ Cognito info: ${err.message}`);
  }

  try {
    console.log(`[2/2] Attempting to delete from DynamoDB...`);
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${TARGET_EMAIL}`, SK: 'PROFILE' }
    }));
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: TARGET_EMAIL, SK: 'PROFILE' }
    }));
    console.log(`✅ SUCCESS: User purged from DynamoDB.`);
  } catch (err) {
    console.error(`❌ DynamoDB error: ${err.message}`);
  }

  console.log(`\n✨ PURGE COMPLETE.\n`);
}

purgeUser();
