import { Maybe } from '@utils/types'
import { APIGatewayEvent } from 'aws-lambda'

type Params<K extends string> = Record<K, 'required' | 'optional'>

type FromPathParams<P extends Params<string>> = {
  [K in keyof P]: P[K] extends 'required' ? string : Maybe<string>
}

export const required = () => 'required' as const
export const optional = () => 'optional' as const

export const getPathParams =
  <P extends Params<string>>(path: P) =>
  (event: APIGatewayEvent): FromPathParams<P> => {
    const params = Object.entries(path).map(([name, type]) => {
      const param = event.pathParameters?.[name]

      if (!param && type === required()) throw new Error(`param ${name} is required`)

      return [name, param]
    })

    return Object.fromEntries(params)
  }
