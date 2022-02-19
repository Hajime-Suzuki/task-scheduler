import { toUTCDateString } from '@utils/date'

describe('UTCDateString #Unit', () => {
  test('returns UTC date string when YYYY-MM-DD string is passed', () => {
    const d = '2022-01-01'
    const res = toUTCDateString(d)
    expect(res.value).toBe('2022-01-01')
  })

  test('returns UTC date string when UTC date string is passed', () => {
    const d = '2022-01-01T22:00:00Z'
    const res = toUTCDateString(d)
    expect(res.value).toBe('2022-01-01')
  })

  test('throws error when date is invalid', () => {
    const d = 'test'
    const res = () => toUTCDateString(d)
    expect(res).toThrow()
  })
})
