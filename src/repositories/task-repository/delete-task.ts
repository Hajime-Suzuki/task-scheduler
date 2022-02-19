import { DeleteTask } from '@domain/interfaces'
import { TABLE_NAME } from '@utils/constants'
import DynamoDB from 'aws-sdk/clients/dynamodb'

type Client = Pick<DynamoDB.DocumentClient, 'delete'>

export const deleteTask =
  (client: Client): DeleteTask =>
  async taskId => {
    await client
      .delete({
        TableName: TABLE_NAME,
        Key: taskId,
      })
      .promise()
  }
