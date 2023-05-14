import { computed, useRequestHeaders, useRuntimeConfig } from '#imports'
import { LogtoContext } from '@logto/node/lib/types'
import { ComputedRef } from 'nuxt/dist/app/compat/vue-demi'
import { useLogtoState } from './useLogtoState'

export interface UseLogtoReturn {
  claims: Readonly<ComputedRef<LogtoContext['claims']>>
  userInfo: Readonly<ComputedRef<LogtoContext['userInfo']>>
  accessToken: Readonly<ComputedRef<LogtoContext['accessToken']>>
  isAuthenticated: Readonly<ComputedRef<boolean>>
  signIn: (url?: string) => void
  signUp: (url?: string) => void
  signOut: (url?: string) => void
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
   * @param url - The auth api route to use for signing in.
   */
  const signIn = () => {
    const signInUrl = `${basePath}/sign-in`
    window.location.assign(signInUrl)
  }

  /**
   * Sign up the user.
   * @param url - The auth api route to use for signing up.
   */
  const signUp = () => {
    const url = `${basePath}/sign-up`
    window.location.assign(url)
  }

  /**
   * Sign out the user.
   * @param url - The auth api route to use for signing out.
   */
  const signOut = () => {
    const url = `${basePath}/sign-out`
    window.location.assign(url)
  }

  return {
    isAuthenticated,
    claims,
    userInfo,
    accessToken,
    fetchContext,
    signIn,
    signUp,
    signOut,
  }
}
export default useLogto
