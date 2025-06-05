import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { User } from '../../core/user/domain/entities/User.entity';
import { UserRepository } from '../../core/user/domain/repositories/UserRepository';
import { Config } from '../../infra/env/get-env';

const config = new Config();

class DynamoUserRepository implements UserRepository {
  private readonly tableName;
  private readonly dynamoClient: DynamoDBClient;

  constructor() {
    this.tableName = `${config.get('USERS_TABLE_NAME')}-${config.get('STAGE')}`;
    this.dynamoClient = new DynamoDBClient({
      region: config.get('REGION'),
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email },
      },
    });

    const response = await this.dynamoClient.send(command);
    const item = response.Items?.[0] ? unmarshall(response.Items[0]) : null;

    if (!item) return null;

    return User.create({
      name: item.name,
      lastName: item.name,
      email: item.email,
      password: item.password,
    });
  }

  public async create(admin: User): Promise<void> {
    const item = marshall(admin, {
      convertClassInstanceToMap: true,
      removeUndefinedValues: true,
    });

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.dynamoClient.send(command);
  }
}

export { DynamoUserRepository };
