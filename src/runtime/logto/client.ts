import { GetContextParameters, InteractionMode } from '@logto/node'
import { createLogtoEvent } from './event'
import { H3Event, eventHandler, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { LogtoNuxtConfig } from '../types'

export class LogtoClient {
  protected logtoConfig: LogtoNuxtConfig
  constructor() {
    this.logtoConfig = useRuntimeConfig().logto
  }

  /**
   * Api route handler to handle sign in.
   * @param redirectUri - The uri to redirect to after sign in. Should be pointed to a handleSignInCallback route.
   * @param interactionMode - The interaction mode to use for sign in.
   * - `signIn`: Sign in the user.
   * - `signUp`: Sign up the user.
   * @returns An event handler to handle sign in / sign up.
   */
  handleSignIn = (
    redirectUri = `${this.logtoConfig.baseUrl}/api/logto/sign-in-callback`,
    interactionMode?: InteractionMode
  ) =>
    eventHandler(async (event) => {
      const logtoEvent = await createLogtoEvent(event, this.logtoConfig)
      await logtoEvent.nodeClient.signIn(redirectUri, interactionMode)
      await logtoEvent.storage.save()

      if (logtoEvent.navigateUrl) {
        return sendRedirect(event, logtoEvent.navigateUrl)
      }
    })

  /**
   * Api route handler to handle sign in callback.
   * @param redirectTo - The uri to redirect to after sign in.
   * @returns An event handler to handle sign in callback.
   */
  handleSignInCallback = (redirectTo = this.logtoConfig.baseUrl) =>
    eventHandler(async (event) => {
      const logtoEvent = await createLogtoEvent(event, this.logtoConfig)
      const url = event.node.req.url

      if (url) {
        await logtoEvent.nodeClient.handleSignInCallback(`${this.logtoConfig.baseUrl}${url}`)
        await logtoEvent.storage.save()
        return sendRedirect(event, redirectTo)
      }
    })

  /**
   * Api route handler to handle sign out.
   * @param redirectUri - The uri to redirect to after sign out.
   * @returns An event handler to handle sign out.
   */
  handleSignOut = (redirectUri = this.logtoConfig.baseUrl) =>
    eventHandler(async (event) => {
      const logtoEvent = await createLogtoEvent(event, this.logtoConfig)
      await logtoEvent.nodeClient.signOut(redirectUri)

      logtoEvent.session.destroy()
      await logtoEvent.storage.save()

      if (logtoEvent.navigateUrl) {
        return sendRedirect(event, logtoEvent.navigateUrl)
      }
    })

  /**
   * Api route handler to get the user context.
   * @param config - The config to use for getting the user context.
   * @returns An event handler to get the auth state, claims, user info and access token.
   */
  handleContext = (config?: GetContextParameters) =>
    eventHandler(async (event) => {
      return await this.getContext(event, config)
    })

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

      if (action === 'context') {
        return this.handleContext(config)(event)
      }

      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    })

  /**
   * Get the user context.
   * @param event - The api handler event.
   * @param config - The config to use for getting the user info.
   * @returns The auth state, claims, user info and access token.
   */
  getContext = async (event: H3Event, config?: GetContextParameters) => {
    const logtoEvent = await createLogtoEvent(event, this.logtoConfig)
    const context = await logtoEvent.nodeClient.getContext(config)

    return context
  }
}
