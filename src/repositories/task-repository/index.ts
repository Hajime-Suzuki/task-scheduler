import { TaskRepository } from '@domain/interfaces'
import { dynamoClient } from '@utils/dynamodb'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import { deleteTask } from './delete-task'
import { findTask } from './find-task'
import { findScheduledTasksByDate } from './find-scheduled-tasks-by-date'
import { saveScheduledTasks } from './save-scheduled-tasks'
import { findTasksByUserId } from './find-tasks-by-user-id'

export { defaultSaveScheduledTaskOptions } from './save-scheduled-tasks'

const withActualClient = <G extends (...args: unknown[]) => any>(
  f: (client: DynamoDB.DocumentClient) => G,
) => f(dynamoClient)

export const createTaskRepository = (): TaskRepository => ({
  findScheduledTasksByDate: withActualClient(findScheduledTasksByDate),
  saveScheduledTasks: withActualClient(saveScheduledTasks),
  findTask: withActualClient(findTask),
  findTasksByUserId: withActualClient(findTasksByUserId),
  deleteTask: withActualClient(deleteTask),
})
