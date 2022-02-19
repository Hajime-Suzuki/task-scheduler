import { getShardSize } from '@utils/constants'

export const getShardNumber = () => {
  return Math.floor(Math.random() * getShardSize() + 1).toString()
}
