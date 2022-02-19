import c from '../../config.json'
export const GSI_NAME = c.gsis[0].name
export const TABLE_NAME = c.table_name
export const QUEUE_URL = c.queue_url
export const NUM_OF_ITEMS = 100_000

export const getShardSize = () => 50
