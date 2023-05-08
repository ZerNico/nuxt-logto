import { eventHandler, sendRedirect, createError, H3Event } from 'h3'
import LogtoNuxtBaseClient from './client'
import NodeClient, { GetContextParameters, type InteractionMode } from '@logto/node'
import { useRuntimeConfig } from '#imports'

export class LogtoClient extends LogtoNuxtBaseClient {
  constructor() {
    const config = useRuntimeConfig().logto
    super(config, { NodeClient })
  }

  /**
   * Api route handler to handle sign in.
   * @param redirectUri - The uri to redirect to after sign in. Should be pointed to a handleSignInCallback route.
   * @param interactionMode - The interaction mode to use for sign in.
   * - `signIn`: Sign in the user.
   * - `signUp`: Sign up the user.
   */
  handleSignIn = (
    redirectUri = `${this.config.baseUrl}/api/logto/sign-in-callback`,
    interactionMode?: InteractionMode
  ) =>
    eventHandler(async (event) => {
      const session = await this.getIronSession(event.node.req, event.node.res)
      const nodeClient = this.createNodeClient(session)
      await nodeClient.signIn(redirectUri, interactionMode)
      await this.storage?.save()

      if (this.navigateUrl) {
        return sendRedirect(event, this.navigateUrl)
      }
    })

  /**
   * Api route handler to handle sign in callback.
   * @param redirectTo - The uri to redirect to after sign in.
   */
  handleSignInCallback = (redirectTo = this.config.baseUrl) =>
    eventHandler(async (event) => {
      const session = await this.getIronSession(event.node.req, event.node.res)
      const nodeClient = this.createNodeClient(session)

      const url = event.node.req.url

      if (url) {
        await nodeClient.handleSignInCallback(`${this.config.baseUrl}${url}`)
        await this.storage?.save()
        return sendRedirect(event, redirectTo)
      }
    })

  /**
   * Api route handler to handle sign out.
   * @param redirectUri - The uri to redirect to after sign out.
   */
  handleSignOut = (redirectUri = this.config.baseUrl) =>
    eventHandler(async (event) => {
      const session = await this.getIronSession(event.node.req, event.node.res)
      const nodeClient = this.createNodeClient(session)
      await nodeClient.signOut(redirectUri)

      session.destroy()
      await this.storage?.save()

      if (this.navigateUrl) {
        return sendRedirect(event, this.navigateUrl)
      }
    })

  /**
   * Api route handler to get the user info.
   * @param config - The config to use for getting the user info.
   * @returns The auth state, claims, user info and access token.
   */
  handleUser = (config: GetContextParameters = {}) =>
    eventHandler(async (event) => {
      const user = this.getUser(event, config)
      return user
    })

  /**
   * Api route handler to handle all auth routes.
   * @param config - The config to use for getting the user info.
   */
  handleAuthRoutes = (config?: GetContextParameters) =>
    eventHandler(async (event) => {
      const action = event.context.params?.action

      if (action === 'sign-in') {
        return this.handleSignIn()(event)
      }

      if (action === 'sign-up') {
        return this.handleSignIn(undefined, 'signUp')(event)
      }

      if (action === 'sign-in-callback') {
        return this.handleSignInCallback()(event)
      }

      if (action === 'sign-out') {
        return this.handleSignOut()(event)
      }

      if (action === 'user') {
        return this.handleUser(config)(event)
      }

      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    })

  /**
   * Get the user info.
   * @param event - The api handler event.
   * @param config - The config to use for getting the user info.
   * @returns The auth state, claims, user info and access token.
   */
  getUser = async (event: H3Event, config: GetContextParameters = {}) => {
    const session = await this.getIronSession(event.node.req, event.node.res)
    const user = await this.getLogtoUserFromRequest(session, config)
    return user
  }
}
