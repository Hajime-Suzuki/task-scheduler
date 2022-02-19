import { StatusType } from '@domain/entities/task'

export type TaskModel = {
  userId: string
  requestId: string
  data: any
  dueDate: string
  status: StatusType
  executedAt?: string
}
