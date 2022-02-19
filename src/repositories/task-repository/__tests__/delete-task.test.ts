import { ScheduledTask, Status } from '@domain/entities/task'
import { toUTCDateString } from '@utils/date'
import { createTaskRepository } from '..'

const actualRepository = createTaskRepository()
describe('deleteTask', () => {
  describe('#Integration', () => {
    test('deletes task', async () => {
      const taskId = {
        userId: 'deleteTask test',
        requestId: '1',
      }

      const data: ScheduledTask = {
        ...taskId,
        data: {},
        status: Status.SCHEDULED,
        dueDate: toUTCDateString('2000-09-01'),
      }

      await actualRepository.saveScheduledTasks([data])

      const saved = await actualRepository.findTask(taskId)

      expect(saved).toEqual(data)

      await actualRepository.deleteTask(taskId)

      const scheduled = await actualRepository.findTask(taskId)

      expect(scheduled).toBeFalsy()
    })
  })
})
