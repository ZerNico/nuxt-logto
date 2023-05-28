import { useRuntimeConfig } from '#imports'
import type { LogtoNuxtConfig } from './types'

export const useConfig = () => {
  const config = useRuntimeConfig().logto
  const publicConfig = useRuntimeConfig().public.logto

  let resources = config.resources
  if (resources && typeof resources === 'string') {
    try {
      resources = JSON.parse(config.resources)
    } catch (e) {
      console.warn('Failed to parse resources string')
    }
  }

  let scopes = config.scopes
  if (scopes && typeof scopes === 'string') {
    try {
      scopes = JSON.parse(config.scopes)
    } catch (e) {
      console.warn('Failed to parse scopes string')
    }
  }

  return { ...config, ...publicConfig, scopes, resources } as unknown as LogtoNuxtConfig
}
