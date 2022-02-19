import { DynamoDBRecord } from 'aws-lambda/trigger/dynamodb-stream'
import { Converter } from 'aws-sdk/clients/dynamodb'

export const parseDynamoBdRecord = <A>(d: DynamoDBRecord) => {
  const data = d.dynamodb?.NewImage
  return data ? [Converter.unmarshall(data) as A] : []
}
