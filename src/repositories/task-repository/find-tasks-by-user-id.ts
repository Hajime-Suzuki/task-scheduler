import { Task } from '@domain/entities/task'
import { FindTasksByUserId } from '@domain/interfaces'
import { TABLE_NAME } from '@utils/constants'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import { toTask } from './utils/adapter'
import { exhaust, WithStartKey } from './utils/dynamo-utils'

type Client = Pick<DynamoDB.DocumentClient, 'query'>

export const findTask =
  (client: Client, userId: string): WithStartKey<Task> =>
  async data => {
    const res = await client
      .query({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ExpressionAttributeNames: {
          '#userId': 'userId',
        },
        ExclusiveStartKey: data.startKey || undefined,
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise()

    return {
      data: res.Items?.map(toTask) || [],
      lastEvaluatedKey: res.LastEvaluatedKey,
    }
  }

export const findTasksByUserId =
  (client: Client): FindTasksByUserId =>
  (userId: string) =>
    exhaust(findTask(client, userId))
