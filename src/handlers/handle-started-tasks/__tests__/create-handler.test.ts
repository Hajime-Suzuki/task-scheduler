import { sleep } from '@utils/misc'
import { QUEUE_URL } from '@utils/constants'
import { sqs } from '@utils/sqs'
import { v4 as uuid } from 'uuid'
import { createHandler } from '../create-handler'

beforeAll(async () => {
  try {
    await sqs.purgeQueue({ QueueUrl: QUEUE_URL }).promise()
  } catch (error) {
    console.log(error.message)
  }
})

test('run program', async () => {
  const id = uuid()
  const event = {
    Records: [
      {
        eventID: '1f799c96448033925f75b2f8385d2a13',
        eventName: 'MODIFY',
        eventVersion: '1.1',
        eventSource: 'aws:dynamodb',
        awsRegion: 'eu-central-1',
        dynamodb: {
          ApproximateCreationDateTime: 1643750992,
          Keys: {
            userId: {
              S: id,
            },
          },
          NewImage: {
            processed: {
              BOOL: true,
            },
            data: {
              M: {
                name: {
                  S: 'test',
                },
              },
            },
            dueDate: {
              S: '2022-02-01#1',
            },
            userId: {
              S: id,
            },
          },
          SequenceNumber: '4561500000000024610028947',
          SizeBytes: 57,
          StreamViewType: 'NEW_IMAGE',
        },
      },
    ],
  }

  await createHandler()(event as any)
  //TODO: update withUnprocessed and use generic version here.
  await sleep(1000)

  const { Messages } = await sqs
    .receiveMessage({ QueueUrl: QUEUE_URL, MaxNumberOfMessages: 10 })
    .promise()

  const matched = Messages?.map(v => JSON.parse(v.Body || '{}')).find(v => v.userId === id)

  expect(matched).toBeDefined()
})
