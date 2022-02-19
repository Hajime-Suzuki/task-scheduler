import { SendMessages } from '@domain/interfaces'
import { QUEUE_URL } from '@utils/constants'
import { withChunkedItems } from '@utils/misc'
import SQS from 'aws-sdk/clients/sqs'
import { v4 as uuid } from 'uuid'

type Client = Pick<SQS, 'sendMessageBatch'>

const _sendMessageBatch = (client: Client) => async (data: any[]) => {
  //! `data` is already chunked
  const { Failed } = await client
    .sendMessageBatch({
      QueueUrl: QUEUE_URL,
      Entries: data.map(v => ({
        Id: uuid(),
        MessageBody: JSON.stringify(v),
      })),
    })
    .promise()

  if (Failed.length) {
    console.error('FAILED ITEMS', Failed)
  }
}
export const sendMessages = (client: Client): SendMessages => {
  const process = _sendMessageBatch(client)
  return withChunkedItems({ chunkSize: 10, parallelSize: 1 })(process)
}
