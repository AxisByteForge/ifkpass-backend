import {
  DynamoDBClient,
  ServiceInputTypes,
  ServiceOutputTypes,
} from '@aws-sdk/client-dynamodb';
import { Command } from '@smithy/smithy-client';

import { Config } from '../../lib/env/get-env';

const config = new Config();
const client = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: config.get('REGION'),
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

class DynamoClient {
  async sendCommand<
    Input extends ServiceInputTypes,
    Output extends ServiceOutputTypes,
  >(command: Command<Input, Output, any>): Promise<Output> {
    return client.send(command);
  }
}

export { DynamoClient };
