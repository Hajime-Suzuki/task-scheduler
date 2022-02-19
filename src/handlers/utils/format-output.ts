import { isStarted, Task } from '@domain/entities/task'

export const createTaskOutput = (s: Task) => {
  return {
    userId: s.userId,
    requestId: s.requestId,
    data: s.data,
    dueDate: s.dueDate.value,
    status: s.status,
    ...(isStarted(s) && { executedAt: s.executedAt }),
  }
}
