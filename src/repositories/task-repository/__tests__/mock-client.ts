export const getMockClient = () => ({
  query: () => ({ promise: () => null }),
  batchWrite: () => ({ promise: () => null }),
})
