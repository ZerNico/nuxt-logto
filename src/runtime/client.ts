import type { GetContextParameters } from '@logto/node'
import { getIronSession, type IronSession, IronSessionOptions } from 'iron-session'

import NuxtStorage from './storage'
import type { Adapters, ModuleOptions } from './types'
import { IncomingMessage } from 'http'
import { ServerResponse } from 'http'

export default class LogtoNuxtBaseClient {
  protected navigateUrl?: string
  protected storage?: NuxtStorage
  constructor(protected readonly config: ModuleOptions, protected readonly adapters: Adapters) {}

  protected createNodeClient(session: IronSession) {
    this.storage = new NuxtStorage(session)

    return new this.adapters.NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url
      },
    })
  }

  protected get ironSessionConfig(): IronSessionOptions {
    return {
      cookieName: `logto:${this.config.appId}`,
      password: this.config.cookieSecret,
      cookieOptions: {
        secure: this.config.cookieSecure,
        maxAge: 14 * 24 * 60 * 60,
        httpOnly: this.config.cookieHttpOnly,
      },
    }
  }

  protected async getIronSession(req: IncomingMessage, res: ServerResponse) {
    return await getIronSession(req, res, this.ironSessionConfig)
  }

  protected async getLogtoUserFromRequest(session: IronSession, configs: GetContextParameters) {
    const nodeClient = this.createNodeClient(session)
    return nodeClient.getContext(configs)
  }
}
