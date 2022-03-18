import { sleep } from '@utils/misc'
import { Maybe } from '@utils/types'
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb'

type Key = DynamoDB.Key
export type BatchWriteMap = DocumentClient.BatchWriteItemRequestMap

export type WithStartKey<A> = (data: {
  startKey?: Maybe<Key>
}) => Promise<{ data: A[]; lastEvaluatedKey: Maybe<Key> }>

export const exhaust = async <A>(
  f: WithStartKey<A>,
  options?: { maxItem?: number },
): Promise<A[]> => {
  let lastEvaluatedKey = null as Maybe<Key>
  let output: A[] = []

  do {
    const res = await f({ startKey: lastEvaluatedKey || undefined })

    output.push(...res.data)

    if (res.lastEvaluatedKey) {
      console.info('there are more items')
      lastEvaluatedKey = res.lastEvaluatedKey
    } else {
      lastEvaluatedKey = null
    }

    if (options?.maxItem && output.length > options.maxItem) {
      lastEvaluatedKey = null
      // trim excess items
      output = output.splice(0, options?.maxItem)
    }
  } while (lastEvaluatedKey)

  return output
}

export type BatchWriteProcess = (
  data: BatchWriteMap,
) => Promise<{ unprocessed: Maybe<BatchWriteMap> }>

const getDelay = (attepms: number, jitterDelay = 20) => {
  const delay = 2 ** attepms * 10
  const jitter = Math.random() * jitterDelay
  return Math.floor(delay + jitter)
}

//TODO: make it generic
export const retryUnprocessed =
  (options?: { maxRetry?: number }) => (f: BatchWriteProcess) => async (items: BatchWriteMap) => {
    const maxRetry = options?.maxRetry || 5
    let unprocessed = items
    let count = 0

    do {
      const { unprocessed: toRetry } = await f(unprocessed)
      if (!toRetry) break

      if (count < maxRetry) {
        unprocessed = toRetry
        count++

        const delay = getDelay(count, 20)
        console.info(`will retry after ${delay} ms`)

        await sleep(delay)
      } else {
        break
      }
    } while (unprocessed)
  }
