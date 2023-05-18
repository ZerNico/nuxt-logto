import { computed, useRequestHeaders, useRuntimeConfig } from '#imports'
import { LogtoContext } from '@logto/node/lib/types'
import { ComputedRef } from 'nuxt/dist/app/compat/vue-demi'
import { withQuery, joinURL } from 'ufo'
import { useLogtoState } from './useLogtoState'

export interface UseLogtoReturn {
  claims: Readonly<ComputedRef<LogtoContext['claims']>>
  userInfo: Readonly<ComputedRef<LogtoContext['userInfo']>>
  accessToken: Readonly<ComputedRef<LogtoContext['accessToken']>>
  isAuthenticated: Readonly<ComputedRef<boolean>>
  signIn: (redirectTo?: string) => void
  getSigInUrl: (redirectTo?: string) => string
  signUp: (redirectTo?: string) => void
  getSignUpUrl: (redirectTo?: string) => string
  signOut: (redirectTo?: string) => void
  getSignOutUrl: (redirectTo?: string) => string
  fetchContext: () => Promise<void>
}

/**
 * A composable function to access Logto user info.
 *
 * @param options - The `UseLogtoOptions` object.
 * @returns An object containing various properties and methods related to Logto user info.
 */
export const useLogto = (): UseLogtoReturn => {
  const basePath = useRuntimeConfig().public.logto.basePath

  const { data } = useLogtoState()

  /**
   * Fetch the user context. This is automatically called once when the plugin is loaded.
   *
   * It can be used to refresh the user context.
   */
  const fetchContext = async () => {
    const contextUrl = `${basePath}/context`
    const headers = useRequestHeaders(['cookie']) as HeadersInit
    data.value = await $fetch<LogtoContext>(contextUrl, { headers })
  }

  /**
   * Whether the user is authenticated.
   */
  const isAuthenticated = computed(() => {
    return data.value?.isAuthenticated ?? false
  })

  /**
   * The user's claims. They are cached when tokens are granted.
   */
  const claims = computed(() => {
    return data.value?.claims
  })

  /**
   * The user's info. They are fetched from the OIDC provider.
   *
   * Only available when { fetchUserInfo: true } is set in the api route handler.
   */
  const userInfo = computed(() => {
    return data.value?.userInfo
  })

  /**
   * The access token.
   *
   * Only available when { getAccessToken: true } is set in the api route handler.
   *
   * If { resource: 'your-target-api-resource' } is set in the api route handler, the access token will be audience-restricted.
   */
  const accessToken = computed(() => {
    return data.value?.accessToken
  })

  /**
   * Sign in the user.
   * @param redirectTo - The route to redirect to after sign in.
   */
  const signIn = (redirectTo?: string) => {
    window.location.assign(getSigInUrl(redirectTo))
  }

  /**
   * Get the sign in url.
   * @param redirectTo - The route to redirect to after sign in.
   * @returns The sign in url.
   */
  const getSigInUrl = (redirectTo?: string) => {
    return withQuery(joinURL(basePath, 'sign-in'), { redirectTo })
  }

  /**
   * Sign up the user.
   * @param redirectTo - The route to redirect to after sign up.
   */
  const signUp = (redirectTo?: string) => {
    window.location.assign(getSignUpUrl(redirectTo))
  }

  /**
   * Get the sign up url.
   * @param redirectTo - The route to redirect to after sign up.
   * @returns The sign up url.
   */
  const getSignUpUrl = (redirectTo?: string) => {
    return withQuery(joinURL(basePath, 'sign-up'), { redirectTo })
  }

  /**
   * Sign out the user.
   */
  const signOut = () => {
    window.location.assign(getSignOutUrl())
  }

  /**
   * Get the sign out url.
   * @returns The sign out url.
   */
  const getSignOutUrl = () => {
    return joinURL(basePath, 'sign-out')
  }

  return {
    isAuthenticated,
    claims,
    userInfo,
    accessToken,
    fetchContext,
    signIn,
    getSigInUrl,
    signUp,
    getSignUpUrl,
    signOut,
    getSignOutUrl,
  }
}
export default useLogto
