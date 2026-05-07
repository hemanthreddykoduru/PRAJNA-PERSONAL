#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FoundationStack } from '../lib/foundation-stack';
import { ApiStack } from '../lib/api-stack';
import { WebsiteStack } from '../lib/website-stack';
import { PrajnaChatBackendStack } from '../lib/chat-backend-stack';

const app = new cdk.App();

const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
};

// 1. Foundation
const foundation = new FoundationStack(app, 'PrajnaFoundationStack', { env });

// 2. API & Lambdas
new ApiStack(app, 'PrajnaApiStack', {
  env,
  table: foundation.table,
  userPool: foundation.userPool,
  eventBus: foundation.eventBus,
  bucket: foundation.bucket,
  auditTable: foundation.auditTable,
  attendanceTable: foundation.attendanceTable,
  notificationTopic: foundation.notificationTopic,
  vpc: foundation.vpc,
  database: foundation.database,
});

// 3. Website Hosting
new WebsiteStack(app, 'PrajnaWebsiteStack', { env });

// 4. Chat Backend
new PrajnaChatBackendStack(app, 'PrajnaChatBackendStack', { env });

cdk.Tags.of(app).add('Project', 'PRAJNA');
cdk.Tags.of(app).add('Environment', 'Dev');
