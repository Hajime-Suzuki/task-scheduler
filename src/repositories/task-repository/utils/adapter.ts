// parse entity to data to dynamo or vise versa. Ideally we don't have these functions, but it's required to distribute GSI...

import { Task } from '@domain/entities/task'
import { toUTCDateString } from '@utils/date'
import { TaskModel } from '../model'
import { getShardNumber } from './shard-calculator'

export const toTaskModel = (s: Task): TaskModel => {
  const { ...rest } = s
  return {
    ...rest,
    dueDate: toPK(rest.dueDate.value, getShardNumber()),
  }
}

export const toTask = (m: TaskModel): Task => {
  const [dueDate] = m.dueDate.split('#')

  return {
    ...m,
    dueDate: toUTCDateString(dueDate),
    ...(m.executedAt && { executedAt: m.executedAt }),
  } as Task
}

export const toPK = (dueDate: string, shardNumber: string) => `${dueDate}#${shardNumber}`
