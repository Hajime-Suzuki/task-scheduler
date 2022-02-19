import { toUTCDateString } from '@utils/date'
import { ScheduledTask } from '@domain/entities/task'
import { createTaskRepository } from '../src/repositories/task-repository'
import { defaultSaveScheduledTaskOptions } from '../src/repositories/task-repository/save-scheduled-tasks'
import { NUM_OF_ITEMS } from '../src/utils/constants'

const main = async () => {
  const items: ScheduledTask[] = [...Array(NUM_OF_ITEMS)].map((_, i) => ({
    userId: String(i + 1),
    requestId: String(i + 1),
    data: { test: true },
    status: 'SCHEDULED',
    dueDate: toUTCDateString('2022-02-01'),
  }))

  const repo = createTaskRepository()
  await repo.saveScheduledTasks(items, {
    ...defaultSaveScheduledTaskOptions,
    parallelSize: 5,
  })

  console.log('seeding completed')
}

main()
