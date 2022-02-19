import { withChunkedItems } from '@utils/misc'

describe('misc #Unit', () => {
  test('process with chunked items. parallel size = 1', async () => {
    const f = jest.fn()
    const items = [1, 2, 3, 4, 5]
    const g = withChunkedItems({ chunkSize: 2, parallelSize: 1 })(f)

    await g(items)

    expect(f.mock.calls[0][0]).toEqual([5])
    expect(f.mock.calls[1][0]).toEqual([3, 4])
    expect(f.mock.calls[2][0]).toEqual([1, 2])
  })

  test('process with chunked items. parallel size = 2', async () => {
    const promiseAll = jest.spyOn(Promise, 'all')

    const f = jest
      .fn()
      .mockReturnValueOnce('a')
      .mockReturnValueOnce('b')
      .mockReturnValueOnce('c')
      .mockReturnValueOnce('d')

    const items = [1, 2, 3, 4, 5, 6, 7, 8]

    const g = withChunkedItems({ chunkSize: 2, parallelSize: 2 })(f)

    await g(items)

    expect(f.mock.calls[0][0]).toEqual([7, 8]) //returns 'a'
    expect(f.mock.calls[1][0]).toEqual([5, 6]) //returns 'b'
    expect(f.mock.calls[2][0]).toEqual([3, 4]) //returns 'c'
    expect(f.mock.calls[3][0]).toEqual([1, 2]) //returns 'd'

    expect(promiseAll).toHaveBeenCalledTimes(2)
    expect(promiseAll).toHaveBeenNthCalledWith(1, ['a', 'b'])
    expect(promiseAll).toHaveBeenNthCalledWith(2, ['c', 'd'])
  })

  test('do not process when when item is empty', async () => {
    const f = jest.fn()

    const items = [] as any[]

    const g = withChunkedItems({ chunkSize: 2, parallelSize: 2 })(f)

    await g(items)

    expect(f).not.toHaveBeenCalled()
  })

  test('process correctly when num of items < chunkSize ', async () => {
    const f = jest.fn()

    const items = [1, 2, 3]

    const g = withChunkedItems({ chunkSize: 5, parallelSize: 2 })(f)

    await g(items)

    expect(f.mock.calls[0][0]).toEqual([1, 2, 3])
  })
})
