import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SERVICE_NAME = 'ifkpass-api';
const REGION = 'us-east-1';

export class IfkpassApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Role para a Lambda
    const lambdaRole = new iam.Role(this, 'ProxyLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Lambda execution role for IFKPass Proxy',
      roleName: `${SERVICE_NAME}-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        )
      ]
    });

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'stepfunctions:*',
          'logs:*',
          's3:*',
          'rekognition:*',
          'bedrock:*',
          'dynamodb:*',
          'textract:*',
          'sqs:*',
          'events:*',
          'states:*',
          'cognito-idp:*'
        ],
        resources: ['*']
      })
    );

    const logGroup = new logs.LogGroup(this, 'ProxyLambdaLogGroup', {
      logGroupName: `/aws/lambda/${SERVICE_NAME}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const environment: Record<string, string> = {
      STAGE: SERVICE_NAME,
      SERVICE: SERVICE_NAME,
      VERSION: '1.0.0',
      NODE_ENV: process.env.NODE_ENV || 'dev',
      PORT: process.env.PORT || '3333',
      REGION: process.env.REGION || REGION,
      ACCOUNT_ID: process.env.ACCOUNT_ID || '',
      // Database
      DATABASE_URL: process.env.DATABASE_URL || '',
      // JWT (legacy + RSA keys)
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
      JWT_SECRET: process.env.JWT_SECRET || '',
      TOKEN_PREFIX: process.env.TOKEN_PREFIX || 'Bearer ',
      JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
      JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || '',
      JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || '',
      // Email
      RESEND_API_KEY: process.env.RESEND_API_KEY || '',
      RESEND_FROM_EMAIL:
        process.env.RESEND_FROM_EMAIL || 'IFK Pass <onboarding@resend.dev>',
      // S3
      PROFILE_BUCKET_NAME: process.env.PROFILE_BUCKET_NAME || '',
      // Mercado Pago
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
      MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
      MERCADO_PAGO_WEBHOOK_URL: process.env.MERCADO_PAGO_WEBHOOK_URL || '',
      MERCADO_PAGO_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET || ''
    };

    const proxyFunction = new lambda.Function(this, 'ProxyFunction', {
      functionName: SERVICE_NAME,
      code: lambda.Code.fromAsset(
        join(dirname(fileURLToPath(import.meta.url)), '../../dist')
      ),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: cdk.Duration.seconds(900),
      memorySize: 1024,
      logGroup,
      role: lambdaRole,
      environment,
      description: 'IFKPass Proxy Function',
      retryAttempts: 0,
      architecture: lambda.Architecture.X86_64
    });

    const api = new apigateway.LambdaRestApi(this, 'ProxyApi', {
      restApiName: SERVICE_NAME,
      handler: proxyFunction,
      proxy: true,
      deployOptions: {
        stageName: SERVICE_NAME
      }
    });

    new cdk.CfnOutput(this, 'ProxyFunctionName', {
      value: proxyFunction.functionName,
      description: 'Nome da função Lambda Proxy',
      exportName: `${SERVICE_NAME}-ProxyFunctionName`
    });

    new cdk.CfnOutput(this, 'ProxyFunctionArn', {
      value: proxyFunction.functionArn,
      description: 'ARN da função Lambda Proxy',
      exportName: `${SERVICE_NAME}-ProxyFunctionArn`
    });

    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: lambdaRole.roleArn,
      description: 'ARN da role de execução da Lambda',
      exportName: `${SERVICE_NAME}-LambdaRoleArn`
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'Endpoint público do API Gateway (Lambda proxy)',
      exportName: `${SERVICE_NAME}-ApiGatewayUrl`
    });
  }
}
