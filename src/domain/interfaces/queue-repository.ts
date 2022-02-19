export type SendMessages = (data: any[]) => Promise<void>

export interface QueueRepository {
  sendMessages: SendMessages
}
