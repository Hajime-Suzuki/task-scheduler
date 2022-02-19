import { markTaskAsProcessed } from '@domain/use-cases/mark-task-as-processed'
import { EventBridgeEvent } from 'aws-lambda'
import { createDependencies } from './create-dependencies'

export const createHandler = () => (event: EventBridgeEvent<'', unknown>) => {
  console.log(JSON.stringify(event, null, 2))
  return markTaskAsProcessed(createDependencies(), { date: event.time })
}
