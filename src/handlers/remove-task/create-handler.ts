import { removeTask } from '@domain/use-cases/remove-task'
import { getTaskId } from '@handlers/utils/path-params'
import { toSuccessResponse } from '@utils/api-gateway/response'
import { APIGatewayEvent } from 'aws-lambda'
import { createDependencies } from './create-dependencies'

export const createHandler = () => async (event: APIGatewayEvent) => {
  await removeTask(createDependencies())(getTaskId(event))
  return toSuccessResponse({ success: true })
}
