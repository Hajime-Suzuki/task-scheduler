import Dynamo from 'aws-sdk/clients/dynamodb'

export const dynamoClient = new Dynamo.DocumentClient()
