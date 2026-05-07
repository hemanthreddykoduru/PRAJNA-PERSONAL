import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: EventBridgeEvent<any, any>): Promise<void> => {
  const { facultyId, decision } = event.detail;

  if (decision !== 'APPROVED') return;

  try {
    // 1. Fetch current score
    const response = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FACULTY#${facultyId}`, SK: 'PROFILE' }
    }));

    const currentScore = response.Item?.prajnaScore || 0;
    
    // 2. Add points for a research publication (e.g., +10 points)
    const newScore = currentScore + 10;
    
    // 3. Update score and determine tier
    let tier = 'BRONZE';
    if (newScore >= 80) tier = 'PLATINUM';
    else if (newScore >= 50) tier = 'GOLD';
    else if (newScore >= 25) tier = 'SILVER';

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `FACULTY#${facultyId}`, SK: 'PROFILE' },
      UpdateExpression: 'SET prajnaScore = :s, currentTier = :t, updatedAt = :u',
      ExpressionAttributeValues: {
        ':s': newScore,
        ':t': tier,
        ':u': new Date().toISOString()
      }
    }));

    console.log(`Updated faculty ${facultyId} score to ${newScore} (Tier: ${tier})`);
  } catch (error) {
    console.error('Error updating score:', error);
  }
};
