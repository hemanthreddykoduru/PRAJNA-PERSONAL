import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const AUDIT_TABLE = process.env.AUDIT_TABLE_NAME || "PrajnaAuditLogs";

export async function logAction(
  userId: string, 
  action: string, 
  details: any, 
  ip: string = "system"
) {
  try {
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: {
        userId,
        timestamp: Date.now(),
        action,
        details,
        ip
      }
    }));
    console.log(`[AUDIT] Action logged: ${action} by ${userId}`);
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to log action:", error);
  }
}
