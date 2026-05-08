import * as cdk from 'aws-cdk-lib';
import { FoundationStack } from '../lib/foundation-stack';
import { ApiStack } from '../lib/api-stack';
import { WebsiteStack } from '../lib/website-stack';
import { PrajnaChatBackendStack } from '../lib/chat-backend-stack';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as cognito from 'aws-cdk-lib/aws-cognito';

const app = new cdk.App();

const foundation = new FoundationStack(app, 'PrajnaFoundationStack');

// Use SSM Lookups to break stack dependencies for the API
const tableName = ssm.StringParameter.valueForStringParameter(foundation, '/prajna/table-name');
const bucketName = ssm.StringParameter.valueForStringParameter(foundation, '/prajna/bucket-name');
const eventBusName = ssm.StringParameter.valueForStringParameter(foundation, '/prajna/event-bus-name');
const userPoolId = ssm.StringParameter.valueForStringParameter(foundation, '/prajna/user-pool-id');

new ApiStack(app, 'PrajnaApiStack', {
  table: dynamodb.Table.fromTableName(foundation, 'ImportedTable', tableName) as any,
  bucket: s3.Bucket.fromBucketName(foundation, 'ImportedBucket', bucketName),
  eventBus: events.EventBus.fromEventBusName(foundation, 'ImportedBus', eventBusName),
  userPool: cognito.UserPool.fromUserPoolId(foundation, 'ImportedPool', userPoolId) as any,
  auditTable: foundation.auditTable,
  attendanceTable: foundation.attendanceTable,
  notificationTopic: foundation.notificationTopic,
  vpc: foundation.vpc,
  database: foundation.database,
});

new WebsiteStack(app, 'PrajnaWebsiteStack');

new PrajnaChatBackendStack(app, 'PrajnaChatBackendStack');
