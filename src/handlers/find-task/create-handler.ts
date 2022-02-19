import { findTask } from '@domain/use-cases/find-task'
import { createTaskOutput } from '@handlers/utils/format-output'
import { getTaskId } from '@handlers/utils/path-params'
import { toNotFoundResponse, toSuccessResponse } from '@utils/api-gateway/response'
import { APIGatewayEvent } from 'aws-lambda'
import { createDependencies } from './create-dependencies'

export const createHandler = () => async (event: APIGatewayEvent) => {
  const res = await findTask(createDependencies())(getTaskId(event))

  if (!res) return toNotFoundResponse({ message: 'task not found' })
  return toSuccessResponse(createTaskOutput(res))
}
