import { computed, useFetch, nextTick } from '#imports'
import { LogtoContext } from '@logto/node/lib/types'
import { ComputedRef } from 'nuxt/dist/app/compat/vue-demi'

export interface UseLogtoOptions {
  /**
   * The URL to fetch the user context from.
   *
   * @default '/api/logto/context'
   */
  contextUrl?: string
}

export interface UseLogtoReturn {
  claims: Readonly<ComputedRef<LogtoContext['claims']>>
  userInfo: Readonly<ComputedRef<LogtoContext['userInfo']>>
  accessToken: Readonly<ComputedRef<LogtoContext['accessToken']>>
  isAuthenticated: Readonly<ComputedRef<boolean>>
  status: Readonly<ComputedRef<'authenticated' | 'unauthenticated' | 'pending'>>
  refresh: () => Promise<void>
  signIn: (url?: string) => void
  signUp: (url?: string) => void
  signOut: (url?: string) => void
  awaitPending: (intervalMs?: number) => Promise<void>
}

/**
 * A composable function to access Logto user info.
 *
 * @param options - The `UseLogtoOptions` object.
 * @returns An object containing various properties and methods related to Logto user info.
 */
export const useLogto = (options?: UseLogtoOptions): UseLogtoReturn => {
  const { contextUrl = '/api/logto/context' } = options || {}

  const { data, refresh, pending } = useFetch<LogtoContext>(contextUrl)

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
  const signIn = (url = '/api/logto/sign-in') => {
    window.location.replace(url)
  }

  /**
   * Sign up the user.
   * @param url - The auth api route to use for signing up.
   */
  const signUp = (url = '/api/logto/sign-up') => {
    window.location.replace(url)
  }

  /**
   * Sign out the user.
   * @param url - The auth api route to use for signing out.
   */
  const signOut = (url = '/api/logto/sign-out') => {
    window.location.replace(url)
  }

  /**
   * Refresh the user info.
   * @param intervalMs - The interval in milliseconds to check if the user info is refreshed.
   * @returns A promise that resolves when the user info is refreshed. Useful when not using SSR.
   */
  const awaitPending = async (intervalMs = 50): Promise<void> => {
    if (pending) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!pending.value) {
            clearInterval(interval)
            nextTick(() => {
              resolve(undefined)
            })
          }
        }, intervalMs)
      })
    }
  }

  /**
   * The user's status.
   * - `authenticated`: The user is authenticated.
   * - `unauthenticated`: The user is not authenticated.
   * - `pending`: The user status is pending.
   */
  const status = computed(() => {
    if (isAuthenticated.value) {
      return 'authenticated'
    } else if (pending) {
      return 'pending'
    } else {
      return 'unauthenticated'
    }
  })

  return {
    isAuthenticated,
    status,
    claims,
    userInfo,
    accessToken,
    awaitPending,
    refresh,
    signIn,
    signUp,
    signOut,
  }
}
export default useLogto
