import { TaskRepository } from '@domain/interfaces'

export const findTasksByUserId = (deps: { taskRepository: TaskRepository }) =>
  deps.taskRepository.findTasksByUserId
