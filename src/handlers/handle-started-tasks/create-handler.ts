import { ScheduledTask } from '@domain/entities/task'
import { handleInitiatedItems } from '@domain/use-cases/handle-initiated-items'
import { parseDynamoBdRecord } from '@utils/dynamodb'
import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream'
import { createDependencies } from './create-dependencies'

export const createHandler = () => (event: DynamoDBStreamEvent) => {
  console.log(JSON.stringify(event.Records, null, 2))

  const parsed = event.Records.flatMap<ScheduledTask>(parseDynamoBdRecord)

  return handleInitiatedItems(createDependencies(), { streamData: parsed })
}
