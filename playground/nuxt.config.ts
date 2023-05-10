export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  logto: {
    appId: '<your-application-id>',
    appSecret: '<your-app-secret-copied-from-console>',
    endpoint: '<your-logto-endpoint>', // E.g. http://localhost:3001
    baseUrl: '<your-nextjs-app-base-url>', // E.g. http://localhost:3000
    cookieSecret: 'complex_password_at_least_32_characters_long',
    cookieSecure: process.env.NODE_ENV === 'production',
    resources: ['<your-resource-id>'], // optionally add a resource
  },
})
