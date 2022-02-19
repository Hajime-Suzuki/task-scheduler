import { createQueueRepository } from '@repo/queue-repository'

export const createDependencies = () => ({ queueRepository: createQueueRepository() })
