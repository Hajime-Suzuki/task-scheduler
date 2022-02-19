import { assertTaskIsRevokable, TaskId } from '@domain/entities/task'
import { TaskRepository } from '@domain/interfaces'

export const removeTask = (deps: { taskRepository: TaskRepository }) => async (taskId: TaskId) => {
  const task = await deps.taskRepository.findTask(taskId)

  assertTaskIsRevokable(task)

  await deps.taskRepository.deleteTask(taskId)
}
