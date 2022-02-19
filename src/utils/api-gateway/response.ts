type StatusCode = 200 | 201 | 404

const toApiGatewayResponse = (statusCode: StatusCode) => (body: unknown) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}

export const toCreatedResponse = toApiGatewayResponse(201)
export const toSuccessResponse = toApiGatewayResponse(200)
export const toNotFoundResponse = toApiGatewayResponse(404)
