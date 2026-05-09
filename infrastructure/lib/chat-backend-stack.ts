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

    const chatTable = new dynamodb.Table(this, 'PrajnaChatHistoryV2', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const chatHandler = new nodejs.NodejsFunction(this, 'ChatHistoryHandlerFinal', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../packages/functions/src/chat/handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: chatTable.tableName,
        USER_TABLE_NAME: 'PrajnaFoundationStack-PrajnaMainTableV26CEEDB9C-ZXT10QOV6MBE',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      projectRoot: path.resolve(__dirname, '../../'),
      depsLockFilePath: path.resolve(__dirname, '../../package-lock.json'),
    });

    chatTable.grantReadWriteData(chatHandler);

    const userTable = dynamodb.Table.fromTableName(this, 'ImportedUserTable', 'PrajnaFoundationStack-PrajnaMainTableV26CEEDB9C-ZXT10QOV6MBE');
    userTable.grantReadData(chatHandler);

    chatHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:*', 'aws-marketplace:*'],
      resources: ['*'],
    }));

    const api = new apigateway.RestApi(this, 'PrajnaChatAPI', {
      restApiName: 'PrajnaChatAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    api.addGatewayResponse('Chat4xxCORS', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
        'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
      },
    });

    const userPool = cdk.aws_cognito.UserPool.fromUserPoolId(this, 'ImportedUserPool', 'us-east-1_lxxysDfi1');
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ChatAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const history = api.root.addResource('history');
    const authOptions = { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO };

    history.addMethod('GET', new apigateway.LambdaIntegration(chatHandler), authOptions);
    history.addMethod('POST', new apigateway.LambdaIntegration(chatHandler), authOptions);

    const userHistory = history.addResource('{userId}');
    userHistory.addMethod('GET', new apigateway.LambdaIntegration(chatHandler), authOptions);
  }
}
