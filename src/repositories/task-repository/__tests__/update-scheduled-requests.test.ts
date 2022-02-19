import { Status } from '@domain/entities/task'
import { TABLE_NAME } from '@utils/constants'
import { toUTCDateString } from '@utils/date'
import { dynamoClient } from '@utils/dynamodb'
import { sleep } from '@utils/misc'
import orderBy from 'lodash.orderby'
import { createTaskRepository } from '..'
import { _batchWithRetry } from '../save-scheduled-tasks'
import { getMockClient } from './mock-client'

//! Since this repository is for POC (proof of concept), all tests are weak.

describe('BatchWithRetry #Integration', () => {
  const userIds = [...Array(30)].map((_, i) => 'BatchWithRetry' + i)

  // jest.spyOn(global.console, 'log').mockReturnValue(null)

  afterEach(async () => {
    await Promise.all(
      userIds.map(userId => {
        return dynamoClient
          .delete({ TableName: TABLE_NAME, Key: { userId, requestId: userId } })
          .promise()
      }),
    )
  })

  test('write to table', async () => {
    const dueDate = toUTCDateString('2000-01-02')
    const data = userIds.map(userId => ({
      userId,
      requestId: userId,
      data: { test: 'test' },
      status: Status.SCHEDULED,
      dueDate,
    }))

    const repo = createTaskRepository()

    const res1 = await repo.findScheduledTasksByDate({ date: dueDate })

    expect(res1).toEqual([])

    await repo.saveScheduledTasks(data)
    await sleep(100)

    const res = await repo.findScheduledTasksByDate({ date: dueDate })

    expect(res).toHaveLength(30)
    expect(orderBy(res, v => v.userId)).toEqual(orderBy(data, v => v.userId))
  })
})

describe('BatchWithRetry #Unit', () => {
  test('write batch request without retry', async () => {
    const mockBatchWrite = jest.fn().mockReturnValue({
      promise: async () => ({}),
    })

    const c = getMockClient()
    c.batchWrite = mockBatchWrite

    await _batchWithRetry()(c as any)([1, 2, 3])

    expect(mockBatchWrite).toHaveBeenCalled()
    expect(mockBatchWrite).toHaveBeenCalledWith(
      expect.objectContaining({
        RequestItems: {
          [TABLE_NAME]: [
            { PutRequest: { Item: 1 } },
            { PutRequest: { Item: 2 } },
            { PutRequest: { Item: 3 } },
          ],
        },
      }),
    )
  })

  test('write batch request with retry when unprocessed items is returned from dynamo', async () => {
    const mockBatchWrite = jest
      .fn()
      .mockReturnValueOnce({
        promise: async () => ({
          UnprocessedItems: {
            [TABLE_NAME]: [{ PutRequest: { Item: 2 } }],
          },
        }),
      })
      .mockReturnValueOnce({
        promise: async () => ({
          UnprocessedItems: {
            [TABLE_NAME]: [{ PutRequest: { Item: 3 } }],
          },
        }),
      })
      .mockReturnValue({
        promise: async () => ({}),
      })

    const c = getMockClient()
    c.batchWrite = mockBatchWrite

    await _batchWithRetry()(c as any)([1, 2, 3])

    expect(mockBatchWrite).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        RequestItems: {
          [TABLE_NAME]: [
            { PutRequest: { Item: 1 } },
            { PutRequest: { Item: 2 } },
            { PutRequest: { Item: 3 } },
          ],
        },
      }),
    )
    expect(mockBatchWrite).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        RequestItems: {
          [TABLE_NAME]: [{ PutRequest: { Item: 2 } }],
        },
      }),
    )
    expect(mockBatchWrite).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        RequestItems: {
          [TABLE_NAME]: [{ PutRequest: { Item: 3 } }],
        },
      }),
    )
  })

  test('stop retrying when reaching max attempts', async () => {
    const mockBatchWrite = jest.fn().mockReturnValue({
      promise: async () => ({
        UnprocessedItems: {
          [TABLE_NAME]: [{ PutRequest: { Item: 1 } }],
        },
      }),
    })

    const c = getMockClient()
    c.batchWrite = mockBatchWrite

    await _batchWithRetry({ maxRetry: 3 })(c as any)([1, 2, 3])

    expect(mockBatchWrite).toHaveBeenCalledTimes(4)
  })
})
