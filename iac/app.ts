#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IfkpassApiStack } from './stacks/ifkpass-api-stack';
import 'dotenv/config';

const app = new cdk.App();

new IfkpassApiStack(app, `ifkpass-api`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
