import { H3Event } from 'h3'
import NodeClient from '@logto/node'
import { getIronSession, type IronSession } from 'iron-session'
import NuxtStorage from './storage'
import { LogtoNuxtConfig } from '../types'
import LogtoClient from '@logto/node'

export class LogtoEvent {
  navigateUrl?: string
  nodeClient: LogtoClient
  storage: NuxtStorage
  session: IronSession

  constructor(session: IronSession, moduleConfig: LogtoNuxtConfig) {
    this.storage = new NuxtStorage(session)
    this.session = session
    this.nodeClient = new NodeClient(moduleConfig, {
      storage: this.storage,
      navigate: (url: string) => {
        this.navigateUrl = url
      },
    })
  }
}

export const createLogtoEvent = async (event: H3Event, moduleConfig: LogtoNuxtConfig) => {
  const req = event.node.req
  const res = event.node.res
  const session = await getIronSession(req, res, getIronSessionConfig(moduleConfig))

  return new LogtoEvent(session, moduleConfig)
}

const getIronSessionConfig = (moduleConfig: LogtoNuxtConfig) => {
  return {
    cookieName: `logto:${moduleConfig.appId}`,
    password: moduleConfig.cookieSecret,
    cookieOptions: {
      secure: moduleConfig.cookieSecure,
      maxAge: 14 * 24 * 60 * 60,
    },
  }
}
