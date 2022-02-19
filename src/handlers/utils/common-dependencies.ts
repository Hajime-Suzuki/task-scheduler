import { createTaskRepository } from '@repo/task-repository'

export const createCommonDependencies = () => ({ taskRepository: createTaskRepository() })
