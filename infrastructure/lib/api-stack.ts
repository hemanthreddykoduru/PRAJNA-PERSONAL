import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lam from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
  eventBus: events.EventBus;
  bucket: s3.Bucket;
  auditTable: dynamodb.Table;
  attendanceTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // 1. API Gateway
    const api = new apigateway.RestApi(this, 'PrajnaApi', {
      restApiName: 'PRAJNA Main API',
    });

    // 2. Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'PrajnaAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    const authOptions = { authorizer };

    // --- LAMBDA HANDLERS ---

    // 3. Profile Handler
    const profileHandler = new lambda.NodejsFunction(this, 'ProfileHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/profile/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // 4. Research Handler
    const researchHandler = new lambda.NodejsFunction(this, 'ResearchHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/research/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // 5. Research Lookup Handler (CrossRef)
    const researchLookupHandler = new lambda.NodejsFunction(this, 'ResearchLookupHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/research/lookup.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
    });

    // 6. Document Upload Handler
    const documentUploadHandler = new lambda.NodejsFunction(this, 'DocumentUploadHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/documents/get-presigned-url.ts'),
      handler: 'handler',
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
        TABLE_NAME: props.table.tableName,
      },
    });

    // 7. Admin Handler
    const adminHandler = new lambda.NodejsFunction(this, 'AdminHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/admin/handler.ts'),
      handler: 'handler',
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        AUDIT_TABLE_NAME: props.auditTable.tableName,
      },
      timeout: cdk.Duration.seconds(15),
    });

    // 8. Attendance Handler
    const attendanceHandler = new lambda.NodejsFunction(this, 'AttendanceHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/attendance/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.attendanceTable.tableName,
      },
    });

    // 9. Approvals Handler
    const approvalsHandler = new lambda.NodejsFunction(this, 'ApprovalsHandler', {
      runtime: lam.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/approvals/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // --- PERMISSIONS ---
    props.table.grantReadWriteData(profileHandler);
    props.table.grantReadWriteData(researchHandler);
    props.table.grantReadWriteData(approvalsHandler);
    props.attendanceTable.grantReadWriteData(attendanceHandler);
    props.auditTable.grantReadWriteData(adminHandler);
    props.bucket.grantWrite(documentUploadHandler);

    // Keep EventBus export reference to prevent rollback errors
    props.eventBus.grantPutEventsTo(researchHandler);

    // Cognito permissions for Admin
    adminHandler.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['cognito-idp:ListUsers', 'cognito-idp:AdminUpdateUserAttributes', 'cognito-idp:AdminCreateUser'],
      resources: [props.userPool.userPoolArn],
    }));

    // --- API ROUTES ---

    // /faculty
    const faculty = api.root.addResource('faculty');
    const profile = faculty.addResource('profile');
    profile.addMethod('GET', new apigateway.LambdaIntegration(profileHandler), authOptions);
    profile.addMethod('PUT', new apigateway.LambdaIntegration(profileHandler), authOptions);

    // /research
    const research = api.root.addResource('research');
    research.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    research.addMethod('GET', new apigateway.LambdaIntegration(researchHandler), authOptions);
    research.addMethod('POST', new apigateway.LambdaIntegration(researchHandler), authOptions);
    
    const lookup = research.addResource('lookup');
    lookup.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
    });
    lookup.addMethod('GET', new apigateway.LambdaIntegration(researchLookupHandler)); // Public DOI Lookup

    // /attendance
    const attendance = api.root.addResource('attendance');
    attendance.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    attendance.addMethod('GET', new apigateway.LambdaIntegration(attendanceHandler), authOptions);
    attendance.addMethod('POST', new apigateway.LambdaIntegration(attendanceHandler), authOptions);

    // /approvals
    const approvals = api.root.addResource('approvals');
    approvals.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    approvals.addMethod('GET', new apigateway.LambdaIntegration(approvalsHandler), authOptions);
    
    const approvalId = approvals.addResource('{id}');
    const approvalAction = approvalId.addResource('action');
    approvalAction.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    approvalAction.addMethod('POST', new apigateway.LambdaIntegration(approvalsHandler), authOptions);

    // /admin
    const admin = api.root.addResource('admin');
    admin.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    admin.addMethod('GET', new apigateway.LambdaIntegration(adminHandler), authOptions);
    admin.addMethod('POST', new apigateway.LambdaIntegration(adminHandler), authOptions);

    // /documents
    const documents = api.root.addResource('documents');
    documents.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    documents.addMethod('GET', new apigateway.LambdaIntegration(documentUploadHandler), authOptions);

    const uploadUrl = documents.addResource('upload-url');
    uploadUrl.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });
    uploadUrl.addMethod('POST', new apigateway.LambdaIntegration(documentUploadHandler), authOptions);

    // Permissions
    props.table.grantReadWriteData(documentUploadHandler);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
