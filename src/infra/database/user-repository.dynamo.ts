import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { UserMapper } from './mappers/user.mapper';
import { User } from '../../core/domain/entities/User.entity';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { Config } from '../env/get-env';

const config = new Config();
class DynamoUserRepository implements UserRepository {
  private readonly tableName;
  private readonly dynamoClient: DynamoDBClient;

  constructor() {
    this.tableName = `${config.get('PROFILES_TABLE_NAME')}-${config.get('STAGE')}`;
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

    return UserMapper.toDomain(item);
  }

  public async create(user: User): Promise<void> {
    const persistenceProps = UserMapper.toPersistence(user);

    const item = marshall(persistenceProps, {
      removeUndefinedValues: true,
    });

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.dynamoClient.send(command);
  }

  public async updateEmailVerificationStatus(
    userId: string,
    isVerified: boolean,
  ): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        userId: { S: userId },
      },
      UpdateExpression: 'SET isEmailVerified = :isVerified',
      ExpressionAttributeValues: marshall({
        ':isVerified': isVerified,
      }),
      ConditionExpression: 'attribute_exists(userId)',
    });

    await this.dynamoClient.send(command);
  }
}

export { DynamoUserRepository };
