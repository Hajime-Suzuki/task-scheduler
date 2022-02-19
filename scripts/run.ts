import Lambda from 'aws-sdk/clients/lambda'
import { NUM_OF_ITEMS, QUEUE_URL } from '../src/utils/constants'
import { sleep } from '../src/utils/misc'
import { sqs } from '../src/utils/sqs'

const lambda = new Lambda()

const isAllScheduleProcessed = async (): Promise<boolean> => {
  let count = 0
  while (count < 150) {
    const { Attributes: attributes } = await sqs
      .getQueueAttributes({ QueueUrl: QUEUE_URL, AttributeNames: ['ApproximateNumberOfMessages'] })
      .promise()

    console.log(attributes)

    if (attributes?.ApproximateNumberOfMessages === NUM_OF_ITEMS.toString()) {
      return true
    }

    await sleep(500)
    count++
  }
  return false
}
export const main = async () => {
  // purge queue
  try {
    await sqs.purgeQueue({ QueueUrl: QUEUE_URL }).promise()
    console.log('queue is purged')
  } catch (error) {
    console.error('purge error!', error.message)
    throw error
  }

  // simulate scheduler
  const res = await lambda
    .invoke({
      FunctionName: 'scheduler-poc-start-scheduled-tasks',
      Payload: JSON.stringify({ time: '2022-02-01' }),
    })
    .promise()

  console.log(res)

  // check number of messages in the queue
  console.time('sqs')
  const r = await isAllScheduleProcessed()
  console.timeEnd('sqs')

  return r
}
