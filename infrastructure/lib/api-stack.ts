import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lam from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  auditTable: dynamodb.Table;
  attendanceTable: dynamodb.Table;
  notificationTopic: sns.Topic;
  vpc: any;
  database: any;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // --- SSM LOOKUPS (Self-Contained) ---
    const tableName = ssm.StringParameter.valueForStringParameter(this, '/prajna/table-name');
    const bucketName = ssm.StringParameter.valueForStringParameter(this, '/prajna/v3/bucket-name');
    const eventBusName = ssm.StringParameter.valueForStringParameter(this, '/prajna/event-bus-name');
    const userPoolId = ssm.StringParameter.valueForStringParameter(this, '/prajna/user-pool-id');

    // --- IMPORTED RESOURCES ---
    const table = dynamodb.Table.fromTableName(this, 'ImportedTable', tableName);
    const bucket = s3.Bucket.fromBucketName(this, 'ImportedBucket', bucketName);
    const eventBus = events.EventBus.fromEventBusName(this, 'ImportedBus', eventBusName);
    const userPool = cognito.UserPool.fromUserPoolId(this, 'ImportedPool', userPoolId);

    // 1. API Gateway
    const api = new apigateway.RestApi(this, 'PrajnaApiResource', {
      restApiName: 'PRAJNA Main API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // 2. Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'PrajnaAuthorizerResource', {
      cognitoUserPools: [userPool],
    });

    api.addGatewayResponse('Default4xxCORS', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
        'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
      },
    });

    api.addGatewayResponse('Default5xxCORS', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      },
    });

    const authOptions = { authorizer };

    // --- LAMBDA CONFIG ---
    const lambdaConfig = {
      runtime: lam.Runtime.NODEJS_20_X,
      architecture: lam.Architecture.ARM_64,
      tracing: lam.Tracing.ACTIVE,
      projectRoot: path.resolve(__dirname, '../../'),
      depsLockFilePath: path.resolve(__dirname, '../../package-lock.json'),
    };

    // 3. Profile Handler
    const profileHandler = new lambda.NodejsFunction(this, 'ProfileHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/profile/handler.ts'),
      handler: 'handler',
      environment: { TABLE_NAME: table.tableName },
    });

    // 4. Research Handler
    const researchHandler = new lambda.NodejsFunction(this, 'ResearchHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/research/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // 5. Research Lookup Handler
    const researchLookupHandler = new lambda.NodejsFunction(this, 'ResearchLookupHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/research/lookup.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
    });

    // 6. Document Upload Handler
    const documentUploadHandler = new lambda.NodejsFunction(this, 'DocumentUploadHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/documents/get-presigned-url.ts'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TABLE_NAME: table.tableName,
      },
    });

    // 7. Admin Handler
    const adminHandler = new lambda.NodejsFunction(this, 'AdminHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/admin/handler.ts'),
      handler: 'handler',
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        TABLE_NAME: table.tableName,
        AUDIT_TABLE_NAME: props.auditTable.tableName,
        DEPLOY_ID: Date.now().toString(),
      },
      timeout: cdk.Duration.seconds(15),
    });

    // 8. Attendance Handler
    const attendanceHandler = new lambda.NodejsFunction(this, 'AttendanceHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/attendance/handler.ts'),
      handler: 'handler',
      environment: { TABLE_NAME: props.attendanceTable.tableName },
    });

    // 9. Approvals Handler
    const approvalsHandler = new lambda.NodejsFunction(this, 'ApprovalsHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/approvals/handler.ts'),
      handler: 'handler',
      environment: { TABLE_NAME: table.tableName },
      timeout: cdk.Duration.seconds(30),
    });

    // 10. Notification Handler
    const notificationHandler = new lambda.NodejsFunction(this, 'NotificationHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/notifications/handler.ts'),
      handler: 'handler',
      environment: { TOPIC_ARN: props.notificationTopic.topicArn },
    });

    // --- EVENTBRIDGE RULES ---
    const notificationRule = new events.Rule(this, 'NotificationRule', {
      eventBus: eventBus,
      eventPattern: {
        detailType: ['RESEARCH_SUBMITTED', 'APPROVAL_REQUIRED'],
      },
    });

    notificationRule.addTarget(new targets.LambdaFunction(notificationHandler));

    // 11. DB Init Handler
    const dbInitHandler = new lambda.NodejsFunction(this, 'DbInitHandler', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../../packages/functions/src/admin/db-init.ts'),
      handler: 'handler',
      vpc: props.vpc,
      environment: {
        DB_HOST: props.database.instanceEndpoint.hostname,
        DB_NAME: 'prajna_analytics',
        DB_USER: 'postgres',
        DB_PASSWORD: props.database.secret?.secretValueFromJson('password').unsafeUnwrap() || '',
      },
      timeout: cdk.Duration.minutes(2),
    });

    // --- PERMISSIONS ---
    table.grantReadWriteData(profileHandler);
    table.grantReadWriteData(researchHandler);
    table.grantReadWriteData(approvalsHandler);
    table.grantReadWriteData(adminHandler);
    props.attendanceTable.grantReadWriteData(attendanceHandler);
    props.auditTable.grantReadWriteData(adminHandler);
    bucket.grantWrite(documentUploadHandler);
    props.notificationTopic.grantPublish(notificationHandler);
    notificationHandler.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    if (props.database.secret) {
      props.database.secret.grantRead(dbInitHandler);
    }

    eventBus.grantPutEventsTo(researchHandler);

    adminHandler.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['cognito-idp:ListUsers', 'cognito-idp:AdminUpdateUserAttributes', 'cognito-idp:AdminCreateUser'],
      resources: [userPool.userPoolArn],
    }));

    // --- API ROUTES ---
    const faculty = api.root.addResource('faculty');
    const profile = faculty.addResource('profile');
    profile.addMethod('GET', new apigateway.LambdaIntegration(profileHandler), authOptions);
    profile.addMethod('PUT', new apigateway.LambdaIntegration(profileHandler), authOptions);

    const research = api.root.addResource('research');
    research.addMethod('GET', new apigateway.LambdaIntegration(researchHandler), authOptions);
    research.addMethod('POST', new apigateway.LambdaIntegration(researchHandler), authOptions);
    
    const lookup = research.addResource('lookup');
    lookup.addMethod('GET', new apigateway.LambdaIntegration(researchLookupHandler));

    const attendance = api.root.addResource('attendance');
    attendance.addMethod('GET', new apigateway.LambdaIntegration(attendanceHandler), authOptions);
    attendance.addMethod('POST', new apigateway.LambdaIntegration(attendanceHandler), authOptions);

    const approvals = api.root.addResource('approvals');
    approvals.addMethod('GET', new apigateway.LambdaIntegration(approvalsHandler), authOptions);
    
    const approvalId = approvals.addResource('{id}');
    const approvalAction = approvalId.addResource('action');
    approvalAction.addMethod('POST', new apigateway.LambdaIntegration(approvalsHandler), authOptions);

    const admin = api.root.addResource('admin');
    admin.addMethod('POST', new apigateway.LambdaIntegration(adminHandler), authOptions);
    
    const dbInit = admin.addResource('db-init');
    dbInit.addMethod('POST', new apigateway.LambdaIntegration(dbInitHandler), authOptions);

    const documents = api.root.addResource('documents');
    documents.addMethod('GET', new apigateway.LambdaIntegration(documentUploadHandler), authOptions);

    const uploadUrl = documents.addResource('upload-url');
    uploadUrl.addMethod('POST', new apigateway.LambdaIntegration(documentUploadHandler), authOptions);

    table.grantReadWriteData(documentUploadHandler);

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
