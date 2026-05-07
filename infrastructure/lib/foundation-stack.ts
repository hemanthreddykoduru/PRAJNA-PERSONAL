import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class FoundationStack extends cdk.Stack {
  public readonly table: dynamodb.Table;
  public readonly bucket: s3.Bucket;
  public readonly eventBus: events.EventBus;
  public readonly userPool: cognito.UserPool;
  public readonly auditTable: dynamodb.Table;
  public readonly attendanceTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB - Single Table Design
    this.table = new dynamodb.Table(this, 'PrajnaMainTableV2', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // 1.1 Audit Logs Table
    this.auditTable = new dynamodb.Table(this, 'PrajnaAuditLogs', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 5. Attendance Table
    this.attendanceTable = new dynamodb.Table(this, 'PrajnaAttendance', {
      partitionKey: { name: 'facultyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    // 2. S3 - Document Vault
    this.bucket = new s3.Bucket(this, 'PrajnaDocVault', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'], // Tighten for production
        allowedHeaders: ['*'],
      }],
    });

    // 3. EventBridge - System Bus
    this.eventBus = new events.EventBus(this, 'PrajnaEventBus', {
      eventBusName: 'PrajnaBus',
    });

    // 4. Cognito - User Management
    this.userPool = new cognito.UserPool(this, 'PrajnaUserPool', {
      userPoolName: 'prajna-users',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
      },
      customAttributes: {
        'role': new cognito.StringAttribute({ mutable: true }),
        'campus': new cognito.StringAttribute({ mutable: true }),
        'department': new cognito.StringAttribute({ mutable: true }),
        'empId': new cognito.StringAttribute({ mutable: true }),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Groups (Roles)
    const roles = ['Faculty', 'HoD', 'Director', 'ProVC', 'IQAC', 'Admin'];
    roles.forEach(role => {
      new cognito.CfnUserPoolGroup(this, `${role}Group`, {
        userPoolId: this.userPool.userPoolId,
        groupName: role,
        description: `PRAJNA ${role} role`,
      });
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    
    const client = this.userPool.addClient('PrajnaAppClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: client.userPoolClientId });
  }
}
