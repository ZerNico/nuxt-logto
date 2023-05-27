export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  logto: {
    appId: process.env.LOGTO_APP_ID,
    appSecret: process.env.LOGTO_APP_SECRET,
    endpoint: process.env.LOGTO_ENDPOINT,
    origin: 'http://localhost:3000',
    basePath: '/api/logto',
    cookieSecret: 'complex_password_at_least_32_characters_long',
    cookieSecure: process.env.NODE_ENV === 'production',
    resources: '',
    scopes: '',
  },
})
