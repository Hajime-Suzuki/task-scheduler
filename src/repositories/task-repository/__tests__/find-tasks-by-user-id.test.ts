// import  from '@utils/constants'
import { Status } from '@domain/entities/task'
import { toUTCDateString } from '@utils/date'
import { createTaskRepository } from '..'

const actualRepository = createTaskRepository()

//! Since this repository is for POC (proof of concept), all tests are weak.

const userId = 'findTasksByUserId test'
const requestIds = [...Array(30)].map((_, i) => 'test' + i)
const data = requestIds.map((v, i) => ({
  userId,
  requestId: v,
  data: { test: 'test' },
  dueDate: toUTCDateString('2000-01-05'),
  status: i % 2 === 0 ? Status.SCHEDULED : Status.STARTED,
}))

describe('findTasksByUserId', () => {
  describe('#Integration', () => {
    afterEach(async () => {
      await Promise.all(requestIds.map(v => actualRepository.deleteTask({ userId, requestId: v })))
    })

    test('finds all tasks by user id', async () => {
      const tasks = await actualRepository.findTasksByUserId(userId)

      expect(tasks).toHaveLength(0)

      await actualRepository.saveScheduledTasks(data as any)

      const tasks2 = await actualRepository.findTasksByUserId(userId)

      expect(tasks2).toHaveLength(30)
    })
  })
})
