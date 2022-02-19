import { isStarted, ScheduledTask } from '@domain/entities/task'
import { QueueRepository } from '@domain/interfaces'

export const handleInitiatedItems = async (
  deps: { queueRepository: QueueRepository },
  data: { streamData: ScheduledTask[] },
) => {
  const itemsToProcess = data.streamData.filter(isStarted)

  if (!itemsToProcess.length) return { skip: true }

  await deps.queueRepository.sendMessages(itemsToProcess)

  return {
    success: true,
  }
}
