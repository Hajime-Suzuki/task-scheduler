import { getPathParams, required } from '@utils/api-gateway/path-params'

export const getTaskId = getPathParams({
  userId: required(),
  requestId: required(),
})

export const getUserId = getPathParams({
  userId: required(),
})
