import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class PrajnaChatBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB Table for Chat History
    const chatTable = new dynamodb.Table(this, 'PrajnaChatHistoryV2', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev, change to RETAIN for prod
    });

    // 2. Lambda Handler
    const chatHandler = new nodejs.NodejsFunction(this, 'ChatHistoryHandlerV3', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/chat/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: chatTable.tableName,
        USER_TABLE_NAME: 'PrajnaFoundationStack-PrajnaMainTableV26CEEDB9C-ZXT10QOV6MBE',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // Grant Lambda permissions to read/write DynamoDB
    chatTable.grantReadWriteData(chatHandler);

    // Grant access to the main User Table
    const userTable = dynamodb.Table.fromTableName(this, 'ImportedUserTable', 'PrajnaFoundationStack-PrajnaMainTableV26CEEDB9C-ZXT10QOV6MBE');
    userTable.grantReadData(chatHandler);

    // 3. Grant Bedrock Permissions
    chatHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:*',
        'aws-marketplace:*'
      ],
      resources: ['*'],
    }));

    // 3. API Gateway
    const api = new apigateway.RestApi(this, 'PrajnaChatAPI', {
      restApiName: 'PrajnaChatAPI',
    });

    // 4. Authorizer
    const userPool = cdk.aws_cognito.UserPool.fromUserPoolId(this, 'ImportedUserPool', 'us-east-1_lxxysDfi1');
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ChatAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const history = api.root.addResource('history');
    
    // Add CORS Preflight to 'history' explicitly
    history.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });

    const authOptions = { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO };

    history.addMethod('GET', new apigateway.LambdaIntegration(chatHandler), authOptions);
    history.addMethod('POST', new apigateway.LambdaIntegration(chatHandler), authOptions);

    const userHistory = history.addResource('{userId}');
    
    // Add CORS Preflight to '{userId}' explicitly
    userHistory.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
    });

    userHistory.addMethod('GET', new apigateway.LambdaIntegration(chatHandler), authOptions);
  }
}
