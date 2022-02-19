import { UTCDateString } from '@utils/date'
import { Status } from '.'

export type TaskId = {
  userId: string
  requestId: string
}

export type Task = ScheduledTask | ProcessedTask

type BaseTask = TaskId & {
  data: any
  dueDate: UTCDateString
}

export type ScheduledTask = BaseTask & {
  status: typeof Status['SCHEDULED']
}

export type ProcessedTask = BaseTask & {
  status: typeof Status['STARTED' | 'COMPLETED']
  executedAt: string
}

export type StatusType = keyof typeof Status
