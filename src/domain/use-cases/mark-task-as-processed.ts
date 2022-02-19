import { startProcess } from '@domain/entities/task'
import { TaskRepository } from '@domain/interfaces'
import { toUTCDateString } from '@utils/date'

export const markTaskAsProcessed = async (
  deps: { taskRepository: TaskRepository },
  data: { date: string },
): Promise<void> => {
  const date = toUTCDateString(data.date)

  const scheduledTasks = await deps.taskRepository.findScheduledTasksByDate({
    date,
  })

  console.log('num of scheduled items:', scheduledTasks.length)

  await deps.taskRepository.saveScheduledTasks(scheduledTasks.map(startProcess))
}
