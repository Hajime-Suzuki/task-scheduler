export type UTCDateString = {
  __type__: 'UTCDate' // YYYY-MM-DD
  value: string
}

export const toUTCDateString = (s: string): UTCDateString => {
  const d = new Date(s)
  if (d.getTime() !== d.getTime()) {
    throw new Error(`invalid date: ${s}`)
  }

  return {
    __type__: 'UTCDate',
    value: new Date(s).toISOString().split('T')[0],
  }
}
