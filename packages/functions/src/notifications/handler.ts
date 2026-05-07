import { EventBridgeEvent, Context } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const snsClient = new SNSClient({});
const sesClient = new SESClient({});

const TOPIC_ARN = process.env.TOPIC_ARN || '';
const FROM_EMAIL = 'hemanth.reddyk@gmail.com';

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
  console.log('Event Received:', JSON.stringify(event, null, 2));

  const { 'detail-type': detailType, detail } = event;

  let message = '';
  let subject = '';

  switch (detailType) {
    case 'RESEARCH_SUBMITTED':
      subject = 'PRAJNA: New Research Publication';
      message = `Faculty ${detail.userId} has submitted a new publication: ${detail.title}. Review required.`;
      break;
    case 'APPROVAL_REQUIRED':
      subject = 'PRAJNA: Action Required';
      message = `New approval request for ${detail.module}. Requested by: ${detail.userId}`;
      break;
    default:
      subject = 'PRAJNA: System Notification';
      message = `Event triggered: ${detailType}`;
  }

  try {
    // 1. Send via SNS (SMS/App)
    await snsClient.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: message,
      Subject: subject
    }));

    // 2. Send via SES (Email)
    await sesClient.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [FROM_EMAIL] }, // In prod, this would be detail.userEmail
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: message } }
      }
    }));

    // 3. WhatsApp API (Placeholder for Meta Business API)
    console.log('--- WHATSAPP NOTIFICATION SIMULATED ---');
    console.log(`To: ${detail.phone || 'Admin'}`);
    console.log(`Message: ${message}`);
    
    console.log('All notifications sent successfully');
  } catch (err) {
    console.error('Notification dispatch failed:', err);
  }
};
