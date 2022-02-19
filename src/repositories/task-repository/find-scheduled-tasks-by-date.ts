import { ScheduledTask, Status } from '@domain/entities/task'
import { FindScheduledTasksByDate, FindScheduledTasksByDateArg } from '@domain/interfaces'
import { getShardSize, GSI_NAME, TABLE_NAME } from '@utils/constants'
import { Maybe } from '@utils/types'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import { toPK, toTask } from './utils/adapter'
import { exhaust, WithStartKey } from './utils/dynamo-utils'
import { TaskModel } from './model'

type Client = Pick<DynamoDB.DocumentClient, 'query' | 'batchWrite'>
type Key = DynamoDB.Key

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html

const _findScheduledTasks =
  (client: Client, arg: { date: string }): WithStartKey<TaskModel> =>
  async (data: { startKey?: Maybe<Key> }) => {
    const res = await client
      .query({
        TableName: TABLE_NAME,
        IndexName: GSI_NAME,
        KeyConditionExpression: '#dueDate = :dueDate',
        ExpressionAttributeValues: {
          ':dueDate': arg.date,
          ':status': Status.SCHEDULED,
        },
        ExpressionAttributeNames: {
          '#dueDate': 'dueDate',
          '#status': 'status',
        },
        FilterExpression: '#status = :status',
        ExclusiveStartKey: data.startKey || undefined,
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise()

    console.log('consumed:', res?.ConsumedCapacity)

    return {
      data: (res?.Items as TaskModel[]) || [],
      lastEvaluatedKey: res.LastEvaluatedKey,
    }
  }

export const findScheduledTasksByDate =
  (client: Client): FindScheduledTasksByDate =>
  async (
    data: FindScheduledTasksByDateArg,
    options?: { maxItem?: number },
  ): Promise<ScheduledTask[]> => {
    const SHARD_SIZE = getShardSize()

    const max = options?.maxItem ? Math.ceil(options?.maxItem / SHARD_SIZE) : undefined

    const f = async (shardNumber: number) => {
      const targetDate = toPK(data.date.value, shardNumber.toString())
      const process = _findScheduledTasks(client, { date: targetDate })
      return exhaust(process, { maxItem: max }).then(r => r.map(toTask) as ScheduledTask[])
    }

    const res = await Promise.all([...Array(SHARD_SIZE)].map((_, i) => f(i + 1))).then(r =>
      r.flat(),
    )

    return options?.maxItem && res.length > options.maxItem ? res.slice(0, options.maxItem) : res
  }
