import * as cdk from 'aws-cdk-lib';
import { FoundationStack } from '../lib/foundation-stack';
import { ApiStack } from '../lib/api-stack';
import { WebsiteStack } from '../lib/website-stack';
import { PrajnaChatBackendStack } from '../lib/chat-backend-stack';

const app = new cdk.App();

const foundation = new FoundationStack(app, 'PrajnaFoundationStack');

// ApiStack now handles its own lookups via SSM to break stack dependencies
new ApiStack(app, 'PrajnaApiStack', {
  auditTable: foundation.auditTable,
  attendanceTable: foundation.attendanceTable,
  notificationTopic: foundation.notificationTopic,
  vpc: foundation.vpc,
  database: foundation.database,
});

new WebsiteStack(app, 'PrajnaWebsiteStack');

new PrajnaChatBackendStack(app, 'PrajnaChatBackendStack');
