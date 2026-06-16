import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ssm from 'aws-cdk-lib/aws-ssm';

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
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Core Data
    this.table = new dynamodb.Table(this, 'PrajnaPrimaryTableFinal', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    this.auditTable = new dynamodb.Table(this, 'PrajnaAuditStoreFinal', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.attendanceTable = new dynamodb.Table(this, 'PrajnaAttendanceStoreFinal', {
      partitionKey: { name: 'facultyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. Storage
    this.bucket = new s3.Bucket(this, 'PrajnaVaultFinal', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 3. Event-Driven
    this.eventBus = new events.EventBus(this, 'PrajnaMessagingBusFinal', {
      eventBusName: 'PrajnaBusFinal',
    });

    this.notificationTopic = new sns.Topic(this, 'PrajnaSnsTopicFinal', {
      topicName: 'PrajnaNotificationsFinal',
    });

    // 4. Analytics Layer (RDS)
    this.vpc = new ec2.Vpc(this, 'PrajnaNetworkVpcFinal', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED }
      ],
    });

    this.database = new rds.DatabaseInstance(this, 'PrajnaAnalyticsRdsFinal', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      databaseName: 'prajna_analytics',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.database.connections.allowFrom(ec2.Peer.ipv4(this.vpc.vpcCidrBlock), ec2.Port.tcp(5432));

    // 5. Auth
    this.userPool = new cognito.UserPool(this, 'PrajnaAuthPoolFinal', {
      userPoolName: 'prajna-users-final',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      customAttributes: {
        department: new cognito.StringAttribute({ mutable: true }),
        campus: new cognito.StringAttribute({ mutable: true }),
        empId: new cognito.StringAttribute({ mutable: true }),
      },
      userVerification: {
        emailSubject: 'Verify your PRAJNA Identity | GITAM University',
        emailBody: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background-color: #007366; padding: 40px; text-align: center;">
              <img src="https://tkwazltvxdztaunerksd.supabase.co/storage/v1/object/public/assets/gitam-Logo-new.png" alt="GITAM University" style="width: 100px; height: auto; margin-bottom: 20px; border-radius: 12px; background: white; padding: 10px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; font-style: italic;">PRAJNA</h1>
              <p style="color: rgba(255,255,255,0.7); margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase;">Deep Intelligence for GITAM Faculty</p>
            </div>
            <div style="padding: 40px; color: #1a202c; line-height: 1.6;">
              <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Hello Faculty Member,</h2>
              <p style="font-size: 16px; color: #4a5568;">Welcome to PRAJNA. To securely access your academic dashboard or reset your credentials, please use the verification code below:</p>
              
              <div style="background-color: #f7fafc; border: 2px dashed #007366; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
                <span style="font-family: monospace; font-size: 42px; font-weight: 900; color: #007366; letter-spacing: 12px; margin-left: 12px;">{####}</span>
              </div>
              
              <p style="font-size: 14px; color: #718096; margin-bottom: 0;">This code will expire shortly. If you did not request this, please contact the CATS Service Desk immediately.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} GITAM University. All rights reserved.</p>
              <p style="font-size: 11px; color: #cbd5e1; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Confidential Academic Asset</p>
            </div>
          </div>
        `,
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      userInvitation: {
        emailSubject: 'Welcome to PRAJNA | Access Your Academic Dashboard',
        emailBody: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background-color: #007366; padding: 40px; text-align: center;">
              <img src="https://tkwazltvxdztaunerksd.supabase.co/storage/v1/object/public/assets/gitam-Logo-new.png" alt="GITAM University" style="width: 100px; height: auto; margin-bottom: 20px; border-radius: 12px; background: white; padding: 10px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; font-style: italic;">PRAJNA</h1>
              <p style="color: rgba(255,255,255,0.7); margin-top: 5px; font-size: 10px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase;">Deep Intelligence for GITAM Faculty</p>
            </div>
            <div style="padding: 40px; color: #1a202c; line-height: 1.6;">
              <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Account Provisioned!</h2>
              <p style="font-size: 16px; color: #4a5568;">Your Professional AI Companion account is ready. Use the credentials below to access your dashboard at <strong>prajna.hemanthreddykoduru.dev</strong>:</p>
              
              <div style="background-color: #f7fafc; border: 2px solid #edf2f7; border-radius: 16px; padding: 25px; margin: 30px 0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Username / Email</p>
                <p style="margin: 5px 0 15px; font-size: 18px; font-weight: 700; color: #1a202c;">{username}</p>
                
                <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Temporary Password</p>
                <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; color: #007366; font-family: monospace; letter-spacing: 2px;">{####}</p>
              </div>
              
              <p style="font-size: 14px; color: #e53e3e; font-weight: 700;">SECURITY NOTICE: This temporary password is valid for only 24 hours. You will be required to set a permanent password upon your first login.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://prajna.hemanthreddykoduru.dev/login" style="background-color: #007366; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">Login to Dashboard</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} GITAM University. All rights reserved.</p>
            </div>
          </div>
        `
      },
      passwordPolicy: {
        tempPasswordValidity: cdk.Duration.days(1), // AWS minimum is 1 day
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = this.userPool.addClient('PrajnaAppClientFinal', {
      authFlows: {
        userSrp: true,
        custom: true,
        userPassword: true,
      },
    });

    // --- SSM PARAMETERS (Production Decoupling) ---
    new ssm.StringParameter(this, 'PrajnaTableNameParam', {
      parameterName: '/prajna/table-name',
      stringValue: this.table.tableName,
    });
    new ssm.StringParameter(this, 'PrajnaEventBusNameParam', {
      parameterName: '/prajna/event-bus-name',
      stringValue: this.eventBus.eventBusName,
    });
    new ssm.StringParameter(this, 'PrajnaUserPoolIdParam', {
      parameterName: '/prajna/user-pool-id',
      stringValue: this.userPool.userPoolId,
    });
    new ssm.StringParameter(this, 'PrajnaUserPoolClientIdParam', {
      parameterName: '/prajna/user-pool-client-id',
      stringValue: this.userPoolClient.userPoolClientId,
    });
  }
}
