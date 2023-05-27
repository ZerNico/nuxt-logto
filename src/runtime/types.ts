import type { LogtoConfig } from '@logto/node'
import type NodeClient from '@logto/node'

declare module 'iron-session' {
  // Honor module definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IronSessionData {
    accessToken?: string
    idToken?: string
    signInSession?: string
    refreshToken?: string
    redirectTo?: string
  }
}

export interface LogtoNuxtConfig extends LogtoConfig {
  cookieSecret: string
  cookieSecure: boolean
  origin: string
  basePath: string
}

export type LogtoNuxtModuleConfig = Omit<LogtoNuxtConfig, 'resources' | 'scopes'> & {
  resources: string | string[]
  scopes: string | string[]
}

export type Adapters = {
  NodeClient: typeof NodeClient
}

export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading'
