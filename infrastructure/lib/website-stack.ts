import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = 'prajna.hemanthreddykoduru.dev';

    // 1. Static Website Bucket
    const websiteBucket = new s3.Bucket(this, 'PrajnaWebsiteBucketFinalV3', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // 2. Request SSL Certificate (Must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, 'PrajnaCertificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(), // Verification via DNS
    });

    // 3. Origin Access Control (OAC)
    const oac = new cloudfront.CfnOriginAccessControl(this, 'PrajnaWebsiteOACFinalV3', {
      originAccessControlConfig: {
        name: 'Prajna Website OAC Final V3',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    // 4. CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'PrajnaWebsiteDistributionFinalV3', {
      domainNames: [domainName],
      certificate: certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(1),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(1),
        }
      ],
    });

    // 5. Overwrite L2 OAI with L1 OAC
    const cfnDist = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDist.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');
    cfnDist.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.attrId);

    // 6. Bucket Policy for OAC
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowCloudFrontServicePrincipal',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        },
      },
    }));

    // 7. SSM PARAMETERS
    new ssm.StringParameter(this, 'PrajnaBucketNameParamV3', {
      parameterName: '/prajna/v3/bucket-name',
      stringValue: websiteBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'WebsiteURL', { value: domainName });
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'CertificateArn', { value: certificate.certificateArn });
  }
}
