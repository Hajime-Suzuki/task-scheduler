import { createScheduledTask, ScheduledTask } from '@domain/entities/task'
import { TaskRepository } from '@domain/interfaces'

export const saveNewTask = async (
  deps: { taskRepository: TaskRepository },
  data: {
    date: string
    userId: string
    payload: { command: string }
  },
): Promise<ScheduledTask> => {
  const scheduledTask = createScheduledTask({
    date: data.date,
    userId: data.userId,
    data: data.payload,
  })

  await deps.taskRepository.saveScheduledTasks([scheduledTask])

  return scheduledTask
}
