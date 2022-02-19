import { toUTCDateString } from '@utils/date'
import { Maybe } from '@utils/types'
import { v4 as uuid } from 'uuid'
import { ProcessedTask, ScheduledTask, Task } from './types'

export const Status = {
  SCHEDULED: 'SCHEDULED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
} as const

export const isStarted = (t: Task): t is ProcessedTask => t.status !== 'SCHEDULED'

export const createScheduledTask = (data: {
  date: string
  userId: string
  data: any
}): ScheduledTask => ({
  userId: data.userId,
  requestId: uuid(),
  data: data.data,
  dueDate: toUTCDateString(data.date),
  status: Status.SCHEDULED,
})

export const startProcess = (t: ScheduledTask): ProcessedTask => {
  return {
    ...t,
    status: Status.STARTED,
    executedAt: new Date().toISOString(),
  }
}

export function assertTaskIsRevokable(t: Maybe<Task>): asserts t is ScheduledTask {
  if (!t) throw new Error('task not found')
  if (t.status === Status.SCHEDULED) throw new Error('only scheduled request can be removed')
}
