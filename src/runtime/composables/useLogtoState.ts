import type { LogtoContext } from '@logto/node'
import { useState, useRuntimeConfig } from '#imports'

export const useLogtoState = () => {
  const appId = useRuntimeConfig().public.logto.appId
  const data = useState<LogtoContext | undefined>(`logto:${appId}:data`, () => undefined)

  return { data }
}
