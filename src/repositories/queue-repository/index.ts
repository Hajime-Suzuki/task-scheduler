import { QueueRepository } from '@domain/interfaces'
import { sqs } from '@utils/sqs'
import SQS from 'aws-sdk/clients/sqs'
import { sendMessages } from './send-messages'

const withActualClient = <G extends (...args: unknown[]) => any>(f: (client: SQS) => G) => f(sqs)

export const createQueueRepository = (): QueueRepository => ({
  sendMessages: withActualClient(sendMessages),
})
