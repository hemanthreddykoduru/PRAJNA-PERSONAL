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

    // 1. Core Data
    this.table = new dynamodb.Table(this, 'PrajnaPrimaryTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    this.auditTable = new dynamodb.Table(this, 'PrajnaAuditStore', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.attendanceTable = new dynamodb.Table(this, 'PrajnaAttendanceStore', {
      partitionKey: { name: 'facultyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. Storage
    this.bucket = new s3.Bucket(this, 'PrajnaStorageVault', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 3. Event-Driven
    this.eventBus = new events.EventBus(this, 'PrajnaMessagingBus', {
      eventBusName: 'PrajnaBus',
    });

    this.notificationTopic = new sns.Topic(this, 'PrajnaSnsTopic', {
      topicName: 'PrajnaSystemNotifications',
    });

    new ses.EmailIdentity(this, 'PrajnaEmailId', {
      identity: ses.Identity.email('hemanth.reddyk@yahoo.com'),
    });

    // 4. Analytics Layer (RDS)
    this.vpc = new ec2.Vpc(this, 'PrajnaNetworkVpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED }
      ],
    });

    this.database = new rds.DatabaseInstance(this, 'PrajnaAnalyticsRds', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      databaseName: 'prajna_analytics',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Explicitly allow VPC internal access to RDS to break stack cycles
    this.database.connections.allowFrom(ec2.Peer.ipv4(this.vpc.vpcCidrBlock), ec2.Port.tcp(5432));

    // 5. Auth
    this.userPool = new cognito.UserPool(this, 'PrajnaAuthPool', {
      userPoolName: 'prajna-users',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
