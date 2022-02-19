import { createTaskRepository } from '@repo/task-repository'
import { toUTCDateString } from '@utils/date'
import { handler } from '..'
import orderBy from 'lodash.orderby'
import { Status } from '@domain/entities/task'

jest.spyOn(global.console, 'log')

const event = {
  version: '0',
  id: 'fe3e5840-f97a-f905-def9-c6550a0f1636',
  'detail-type': 'Scheduled Event',
  source: 'aws.events',
  account: '029720204697',
  time: '2020-01-01T21:52:00Z',
  region: 'eu-central-1',
  resources: ['arn:aws:events:eu-central-1:...'],
  detail: {},
}

describe('#Integration', () => {
  test('get scheduled tasks and mark as processed', async () => {
    //* seed
    const r = createTaskRepository()
    await r.saveScheduledTasks([
      {
        userId: 'a',
        requestId: 'b',
        dueDate: toUTCDateString('2020-01-01'),
        data: {},
        status: Status.SCHEDULED,
      },
      {
        userId: 'b',
        requestId: 'c',
        dueDate: toUTCDateString('2020-01-01'),
        data: {},
        status: Status.SCHEDULED,
      },
    ])

    const res1 = await r.findScheduledTasksByDate({ date: toUTCDateString('2020-01-01') })
    //* seed is in db
    expect(res1).toHaveLength(2)
    expect(orderBy(res1, v => v.userId)).toMatchObject([
      {
        data: {},
        userId: 'a',
        dueDate: toUTCDateString('2020-01-01'),
        requestId: 'b',
        status: Status.SCHEDULED,
      },
      {
        data: {},
        userId: 'b',
        dueDate: toUTCDateString('2020-01-01'),
        requestId: 'c',
        status: Status.SCHEDULED,
      },
    ])

    //* act
    await handler(event as any)

    //* assert
    const res = await r.findScheduledTasksByDate({ date: toUTCDateString('2020-01-01') })
    expect(res).toEqual([])
  })
})
