import { describe, it, expect, vi } from 'vitest'
import NuxtStorage from './storage'

const makeSession = () => ({
  save: vi.fn(),
  destroy: vi.fn(),
})

describe('NextStorage', () => {
  describe('Basic functions', () => {
    it('should set and get item', async () => {
      const session = makeSession()
      const storage = new NuxtStorage(session)
      await storage.setItem('idToken', 'value')
      await expect(storage.getItem('idToken')).resolves.toBe('value')
    })

    it('should remove item', async () => {
      const session = makeSession()
      const storage = new NuxtStorage(session)
      await storage.setItem('idToken', 'value')
      await storage.removeItem('idToken')
      await expect(storage.getItem('idToken')).resolves.toBeNull()
    })

    it('should set and get item (signInSession)', async () => {
      const session = makeSession()
      const storage = new NuxtStorage(session)
      await storage.setItem('signInSession', 'value')
      await expect(storage.getItem('signInSession')).resolves.toBe('value')
    })

    it('should remove item (signInSession)', async () => {
      const session = makeSession()
      const storage = new NuxtStorage(session)
      await storage.setItem('signInSession', 'value')
      await storage.removeItem('signInSession')
      await expect(storage.getItem('signInSession')).resolves.toBeNull()
    })
  })
})
