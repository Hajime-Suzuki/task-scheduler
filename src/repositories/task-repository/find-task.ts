import { FindTask } from '@domain/interfaces'
import { TABLE_NAME } from '@utils/constants'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import { TaskModel } from './model'
import { toTask } from './utils/adapter'

type Client = Pick<DynamoDB.DocumentClient, 'get'>

export const findTask =
  (client: Client): FindTask =>
  async taskId => {
    const res = await client
      .get({
        TableName: TABLE_NAME,
        Key: taskId,
      })
      .promise()

    return res.Item ? toTask(res.Item as TaskModel) : null
  }
