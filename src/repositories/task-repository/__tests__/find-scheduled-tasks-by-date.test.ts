// import  from '@utils/constants'
import { Status } from '@domain/entities/task'
import { TABLE_NAME } from '@utils/constants'
import { toUTCDateString } from '@utils/date'
import { dynamoClient } from '@utils/dynamodb'
import { createTaskRepository } from '..'
import { findScheduledTasksByDate } from '../find-scheduled-tasks-by-date'
import { getMockClient } from './mock-client'

const actualRepository = createTaskRepository()

//! Since this repository is for POC (proof of concept), all tests are weak.

const userIds = [...Array(30)].map((_, i) => 'test' + i)
const data = userIds.map(userId => ({
  userId,
  requestId: userId,
  data: { test: 'test' },
  status: Status.SCHEDULED,
  dueDate: toUTCDateString('2000-01-01'),
}))

describe('findScheduledTasksByDate', () => {
  describe('#Integration', () => {
    beforeAll(async () => {
      await Promise.all(
        userIds.map(userId => {
          return dynamoClient
            .delete({ TableName: TABLE_NAME, Key: { userId, requestId: userId } })
            .promise()
        }),
      )
      await actualRepository.saveScheduledTasks(data)
    })

    test('get items with max items', async () => {
      const res = await actualRepository.findScheduledTasksByDate(
        { date: toUTCDateString('2000-01-01') },
        { maxItem: 20 },
      )

      expect(res.length).toBe(20)
      expect(res[0].dueDate.value).toEqual('2000-01-01')
    })

    test('get items without max', async () => {
      const res = await actualRepository.findScheduledTasksByDate({
        date: toUTCDateString('2000-01-01'),
      })

      expect(res).toHaveLength(userIds.length)
      expect(res[0].dueDate.value).toEqual('2000-01-01')
    })
  })

  describe('#Unit', () => {
    test('get items when there is last evaluated key ', async () => {
      const mockQuery = jest
        .fn()
        .mockResolvedValueOnce({
          Items: [
            { id: 1, dueDate: '2020-01-01#1' },
            { id: 2, dueDate: '2020-01-05#3' },
          ],
          LastEvaluatedKey: { userId: '1' },
        })
        .mockResolvedValueOnce({
          Items: [
            { id: 3, dueDate: '2020-01-01#2' },
            { id: 4, dueDate: '2020-01-05#4' },
          ],
          LastEvaluatedKey: undefined,
        })
        .mockResolvedValue({
          Items: [],
          LastEvaluatedKey: undefined,
        })

      const c = getMockClient()
      c.query = () => ({
        promise: mockQuery,
      })

      const res = await findScheduledTasksByDate(c as any)({ date: toUTCDateString('2000-01-01') })

      const expected = [
        { id: 1, dueDate: toUTCDateString('2020-01-01') },
        { id: 2, dueDate: toUTCDateString('2020-01-05') },
        { id: 3, dueDate: toUTCDateString('2020-01-01') },
        { id: 4, dueDate: toUTCDateString('2020-01-05') },
      ]

      expect(res).toEqual(expected)
    })
  })
})
