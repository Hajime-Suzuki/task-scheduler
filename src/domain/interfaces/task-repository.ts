import { ScheduledTask, Task, TaskId } from '@domain/entities/task'
import { UTCDateString } from '@utils/date'
import { Maybe } from '@utils/types'

export type FindScheduledTasksByDateArg = { date: UTCDateString }
export type FindScheduledTasksByDate = (
  data: FindScheduledTasksByDateArg,
  options?: Maybe<{ maxItem?: number }>,
) => Promise<ScheduledTask[]>

export type SaveScheduledTasks = (
  data: Task[],
  options?: SaveScheduledTasksOptions,
) => Promise<void>

export type SaveScheduledTasksOptions = {
  maxRetry: number
  parallelSize: number
  chunkSize: number
}

export type FindTask = (taskId: TaskId) => Promise<Maybe<Task>>
export type FindTasksByUserId = (userId: string) => Promise<Task[]>

export type DeleteTask = (taskId: TaskId) => Promise<void>

export interface TaskRepository {
  findScheduledTasksByDate: FindScheduledTasksByDate
  saveScheduledTasks: SaveScheduledTasks
  findTask: FindTask
  findTasksByUserId: FindTasksByUserId
  deleteTask: DeleteTask
}
