import chunk from 'lodash.chunk'

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type ChunkProcessor<A> = (chunkedData: A[]) => Promise<void>
export const withChunkedItems =
  <A>(options: { chunkSize: number; parallelSize: number }) =>
  (f: ChunkProcessor<A>) =>
  async (data: A[]) => {
    const chunkedItems = chunk(data, options.chunkSize)

    while (chunkedItems.length) {
      console.log(`remaining: ${chunkedItems.length} chunks`)
      const itemsToProcess: A[][] = []
      ;[...Array(options.parallelSize)].forEach(() => {
        if (!chunkedItems.length) return

        const popped = chunkedItems.pop()
        if (popped) {
          itemsToProcess.push(popped)
        }
      })

      await Promise.all(itemsToProcess.map(f))
    }
  }
