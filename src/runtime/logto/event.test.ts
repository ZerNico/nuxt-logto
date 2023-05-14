import { describe, vi, it, expect } from 'vitest'
import { LogtoNuxtConfig } from "../types"
import { LogtoEvent } from "./event"
import { IronSession } from "iron-session"
import NodeClient from '@logto/node'
import NuxtStorage from "./storage"

const config: LogtoNuxtConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  origin: 'http://localhost:3000',
  basePath: '/api/logto',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
}

const session: IronSession = {
  destroy: vi.fn(),
  save: vi.fn(),
}

describe('Nuxt LogtoEvent', () => {
  it('should initialize LogtoEvent instance', () => {
    const logtoEvent = new LogtoEvent(session, config)

    expect(logtoEvent.session).toEqual(session)
    expect(logtoEvent.nodeClient).toBeInstanceOf(NodeClient)
    expect(logtoEvent.storage).toBeInstanceOf(NuxtStorage)
  })
})