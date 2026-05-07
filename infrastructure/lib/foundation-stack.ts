import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as cognito from 'aws-cdk-lib/aws-cognito';

import * as sns from 'aws-cdk-lib/aws-sns';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

export class FoundationStack extends cdk.Stack {
  public readonly table: dynamodb.Table;
  public readonly bucket: s3.Bucket;
  public readonly eventBus: events.EventBus;
  public readonly userPool: cognito.UserPool;
  public readonly auditTable: dynamodb.Table;
  public readonly attendanceTable: dynamodb.Table;
  public readonly notificationTopic: sns.Topic;
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseInstance;

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

    // 6. SNS - Notification Layer
    this.notificationTopic = new sns.Topic(this, 'PrajnaNotifications', {
      topicName: 'PrajnaSystemNotifications',
    });

    // 7. VPC & Aurora Analytics Layer (Using RDS Instance for Credit Safety)
    this.vpc = new ec2.Vpc(this, 'PrajnaVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ],
    });

    this.database = new rds.DatabaseInstance(this, 'PrajnaAnalyticsDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      databaseName: 'prajna_analytics',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publiclyAccessible: false,
    });

    // 8. SES - Email Identity
    new ses.EmailIdentity(this, 'PrajnaEmailIdentity', {
      identity: ses.Identity.email('hemanth.reddyk@gmail.com'),
    });
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
