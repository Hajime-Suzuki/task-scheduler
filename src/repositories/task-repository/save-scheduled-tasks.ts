import { ScheduledTask } from '@domain/entities/task'
import { SaveScheduledTasksOptions, SaveScheduledTasks } from '@domain/interfaces'
import { withChunkedItems } from '@utils/misc'
import { TABLE_NAME } from '@utils/constants'
import { Maybe } from '@utils/types'
import DynamoDB, { DocumentClient, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb'

import { retryUnprocessed } from './utils/dynamo-utils'
import { toTaskModel } from './utils/adapter'
import { TaskModel } from './model'

type Client = Pick<DynamoDB.DocumentClient, 'batchWrite'>
type BatchWriteMap = DocumentClient.BatchWriteItemRequestMap

const _batchWrite =
  (client: Client) =>
  async (reqItems: BatchWriteMap): Promise<{ unprocessed: Maybe<BatchWriteMap> }> => {
    //! data is already chunked (max 25 items)

    const { UnprocessedItems, ConsumedCapacity } = await client
      .batchWrite({
        RequestItems: reqItems,
        ReturnConsumedCapacity: 'TOTAL',
      })
      .promise()

    console.log('ConsumedCapacity:', ConsumedCapacity?.[0]?.CapacityUnits)

    const isEmpty = Object.keys(UnprocessedItems || {}).length === 0

    if (!isEmpty) {
      console.error('there is unprocessed item')
      console.error(JSON.stringify(UnprocessedItems, null, 2))
    }

    return { unprocessed: isEmpty ? null : UnprocessedItems }
  }

export const _batchWithRetry =
  <A>(options?: { maxRetry?: number }) =>
  (client: Client) =>
  async (data: A[]) => {
    //! data is already chunked (max 25 items)

    const requestItems = {
      [TABLE_NAME]: data.map(v => ({
        PutRequest: {
          Item: v as any as PutItemInputAttributeMap,
        },
      })),
    }

    return retryUnprocessed(options)(_batchWrite(client))(requestItems)
  }

export const defaultSaveScheduledTaskOptions: SaveScheduledTasksOptions = {
  maxRetry: 5,
  parallelSize: 5,
  chunkSize: 25,
}

export const saveScheduledTasks =
  (client: Client): SaveScheduledTasks =>
  (data: ScheduledTask[], options: SaveScheduledTasksOptions = defaultSaveScheduledTaskOptions) => {
    const process = _batchWithRetry<TaskModel>({ maxRetry: options.maxRetry })(client)

    const processor = withChunkedItems<TaskModel>({
      chunkSize: 25,
      parallelSize: options.parallelSize,
    })

    return processor(process)(data.map(toTaskModel))
  }
