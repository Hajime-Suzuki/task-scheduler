import { saveNewTask } from '@domain/use-cases/save-new-task'
import { createTaskOutput } from '@handlers/utils/format-output'
import { toCreatedResponse } from '@utils/api-gateway'
import { parseJSON } from '@utils/json'
import { APIGatewayEvent } from 'aws-lambda'
import { createDependencies } from './create-dependencies'

type Body = {
  date: string
  userId: string
  payload: { command: string }
}

export const createHandler = () => async (event: APIGatewayEvent) => {
  //! for simplicity, there is no validation.
  const body = parseJSON<Body>(event.body || '{}')
  const res = await saveNewTask(createDependencies(), body)

  return toCreatedResponse(createTaskOutput(res))
}
