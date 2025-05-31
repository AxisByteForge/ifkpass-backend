import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { Config } from '../../shared/lib/env/get-env';
import { DynamoClient } from '../../shared/modules/database/dynamo-db';
import { UserRepository } from '../core/entity/repositories/UserRepository';
import { User } from '../core/entity/User.entity';

const config = new Config();

class DynamoUserRepository implements UserRepository {
  private readonly tableName;

  constructor(private dynamoClient: DynamoClient) {
    this.tableName = `${config.get('USERS_TABLE_NAME')}-${config.get('STAGE')}`;
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

    const response = await this.dynamoClient.sendCommand(command);
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

    await this.dynamoClient.sendCommand(command);
  }
}

export { DynamoUserRepository };
