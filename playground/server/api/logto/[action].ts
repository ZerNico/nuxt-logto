import { logtoClient } from '~/lib/logto'

export default logtoClient.handleAuthRoutes({
  getAccessToken: true,
  fetchUserInfo: true,
})
