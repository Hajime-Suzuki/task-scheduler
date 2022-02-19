import { TaskRepository } from '@domain/interfaces'

export const findTask = (deps: { taskRepository: TaskRepository }) => deps.taskRepository.findTask
