import { findTasksByUserId } from '@domain/use-cases/find-tasks-by-user-id'
import { createTaskOutput } from '@handlers/utils/format-output'
import { getUserId } from '@handlers/utils/path-params'
import { toSuccessResponse } from '@utils/api-gateway/response'
import { APIGatewayEvent } from 'aws-lambda'
import { createDependencies } from './create-dependencies'

export const createHandler = () => async (event: APIGatewayEvent) => {
  const userId = getUserId(event).userId
  const res = await findTasksByUserId(createDependencies())(userId)

  return toSuccessResponse(res.map(createTaskOutput))
}
