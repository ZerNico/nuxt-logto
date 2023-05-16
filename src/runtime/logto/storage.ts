import type { Storage, StorageKey } from '@logto/node'
import { type IronSession } from 'iron-session'

type ExtendedStorageKey = StorageKey | 'redirectTo' 

export default class NuxtStorage implements Storage {
  private sessionChanged = false
  constructor(private readonly session: IronSession) {}

  async setItem(key: ExtendedStorageKey, value: string) {
    this.session[key] = value
    this.sessionChanged = true
  }

  async getItem(key: ExtendedStorageKey) {
    const value = this.session[key]

    if (value === undefined) {
      return null
    }

    return String(value)
  }

  async removeItem(key: ExtendedStorageKey) {
    this.session[key] = undefined
    this.sessionChanged = true
  }

  async save() {
    if (!this.sessionChanged) {
      return
    }

    await this.session.save()
    this.sessionChanged = false
  }
}
