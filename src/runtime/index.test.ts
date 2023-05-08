import { afterEach, describe, vi, it, expect, beforeEach } from 'vitest'
import { LogtoClient } from './index'
import type { ModuleOptions } from './types.js'
import { App, EventHandler, Router, createApp, createRouter, toNodeListener } from 'h3'
import supertest, { SuperTest, Test } from 'supertest'
import { type InteractionMode } from '@logto/node'

const signInUrl = 'http://mock-logto-server.com/sign-in'

const config: ModuleOptions = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
  cookieHttpOnly: true,
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: process.env.NODE_ENV === 'production',
}

const setItem = vi.fn()
const getItem = vi.fn()
const save = vi.fn()
const signIn = vi.fn()
const handleSignInCallback = vi.fn()
const signOut = vi.fn()
const getContext = vi.fn()

vi.mock('./storage', () => ({
  default: class Storage {
    setItem = setItem
    getItem = getItem
    save = save
    removeItem = vi.fn()
  },
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => {
    return {
      logto: config,
    }
  },
}))

type Adapter = {
  navigate: (url: string) => void
}

vi.mock('@logto/node', () => ({
  default: class NodeClient {
    navigate: (url: string) => void
    constructor(_: unknown, { navigate }: Adapter) {
      this.navigate = navigate
    }
    signIn = async (_redirectUri: string, interactionMode?: InteractionMode) => {
      this.navigate(interactionMode ? `${signInUrl}?interactionMode=${interactionMode}` : signInUrl)
      signIn()
    }
    signOut = async () => {
      this.navigate(config.baseUrl)
      signOut()
    }
    handleSignInCallback = handleSignInCallback
    getContext = getContext
  },
}))

describe('Nuxt LogtoClient', () => {
  let app: App
  let request: SuperTest<Test>

  beforeEach(() => {
    app = createApp({ debug: false })
    request = supertest(toNodeListener(app))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates an instance without crash', () => {
    expect(() => new LogtoClient()).not.toThrow()
  })

  describe('handleSignIn', () => {
    it('should redirect to Logto sign in url and save session', async () => {
      const client = new LogtoClient()
      app.use('/api/logto/sign-in', client.handleSignIn())

      const result = await request.get('/api/logto/sign-in')

      expect(result.header.location).toBe(signInUrl)
      expect(save).toHaveBeenCalled()
      expect(signIn).toHaveBeenCalled()
    })

    it('should redirect to Logto sign in url with interactionMode and save session', async () => {
      const client = new LogtoClient()
      app.use('/api/logto/sign-up', client.handleSignIn(undefined, 'signUp'))

      const result = await request.get('/api/logto/sign-up')

      expect(result.header.location).toBe(`${signInUrl}?interactionMode=signUp`)
      expect(save).toHaveBeenCalled()
      expect(signIn).toHaveBeenCalled()
    })
  })

  describe('handleSignInCallback', () => {
    it('should call client.handleSignInCallback and redirect to home', async () => {
      const client = new LogtoClient()
      app.use('/api/logto/sign-in-callback', client.handleSignInCallback())

      const result = await request.get('/api/logto/sign-in-callback')

      expect(result.header.location).toBe(config.baseUrl)
      expect(handleSignInCallback).toHaveBeenCalled()
      expect(save).toHaveBeenCalled()
    })
  })

  describe('handleSignOut', () => {
    it('should redirect to Logto sign out url', async () => {
      const client = new LogtoClient()
      app.use('/api/logto/sign-out', client.handleSignOut())

      const result = await request.get('/api/logto/sign-out')

      expect(result.header.location).toBe(`${config.baseUrl}`)
      expect(save).toHaveBeenCalled()
      expect(signOut).toHaveBeenCalled()
    })
  })

  describe('handleUser', () => {
    it('should call getContext', async () => {
      const client = new LogtoClient()
      app.use('/api/logto/user', client.handleUser())
      await request.get('/api/logto/user')

      expect(getContext).toHaveBeenCalled()
    })
  })

  describe('handleAuthRoutes', () => {
    let router: Router

    beforeEach(() => {
      router = createRouter()
    })

    it('should call signIn', async () => {
      const client = new LogtoClient()

      const mockEventHandler: EventHandler = async () => {
        return 'mock response'
      }
      vi.spyOn(client, 'handleSignIn').mockImplementation(() => mockEventHandler)
      router.get('/api/logto/:action', client.handleAuthRoutes())
      app.use(router)
      await request.get('/api/logto/sign-in')

      expect(client.handleSignIn).toHaveBeenCalled()
    })

    it('should call handleSignInCallback', async () => {
      const client = new LogtoClient()

      const mockEventHandler: EventHandler = async () => {
        return 'mock response'
      }
      vi.spyOn(client, 'handleSignInCallback').mockImplementation(() => mockEventHandler)
      router.get('/api/logto/:action', client.handleAuthRoutes())
      app.use(router)
      await request.get('/api/logto/sign-in-callback')

      expect(client.handleSignInCallback).toHaveBeenCalled()
    })

    it('should call handleSignOut', async () => {
      const client = new LogtoClient()

      const mockEventHandler: EventHandler = async () => {
        return 'mock response'
      }
      vi.spyOn(client, 'handleSignOut').mockImplementation(() => mockEventHandler)
      router.get('/api/logto/:action', client.handleAuthRoutes())
      app.use(router)
      await request.get('/api/logto/sign-out')

      expect(client.handleSignOut).toHaveBeenCalled()
    })

    it('should call handleUser', async () => {
      const client = new LogtoClient()

      const mockEventHandler: EventHandler = async () => {
        return 'mock response'
      }
      vi.spyOn(client, 'handleUser').mockImplementation(() => mockEventHandler)
      router.get('/api/logto/:action', client.handleAuthRoutes())
      app.use(router)
      await request.get('/api/logto/user')

      expect(client.handleUser).toHaveBeenCalled()
    })
  })
})
