# Nuxt Logto

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Logto auth module for Nuxt 3.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Quick Setup

1. Add `@zernico/nuxt-logto` dependency to your project

```bash
# Using pnpm
pnpm add @zernico/nuxt-logto

# Using yarn
yarn add @zernico/nuxt-logto

# Using npm
npm install @zernico/nuxt-logto
```

2. Add `@zernico/nuxt-logto` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['@zernico/nuxt-logto'],
})
```

3. Configure it:

```js
export default defineNuxtConfig({
  modules: ['@zernico/nuxt-logto'],
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
```

4. Add the api routes

```js
// lib/logto.ts
import { LogtoClient } from "#logto";

export const logtoClient = new LogtoClient()
```

```js
// server/api/logto/[action].ts
import { logtoClient } from '~/lib/logto'

export default logtoClient.handleAuthRoutes()
```

5. Optional configuration

```js
// server/api/logto/[action].ts
import { logtoClient } from '~/lib/logto'

export default logtoClient.handleAuthRoutes({
  getAccessToken: true, // get access token from logto
  resource: '<your-resource-id>', // optionally add a resource for your access token
  fetchUserInfo: true, // fetch user info from logto, in most cases you want to use claims instead
})
````

6. Use the composable

```vue
<script setup lang="ts">
const { signIn, signOut } = useLogto();
</script>

<template>
  <div>
    <button @click="() => signIn()">Login</button>
    <button @click="() => signOut()">Logout</button>
  </div>
</template>
```


That's it! You can now use Nuxt Logto in your Nuxt app ✨

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@zernico/nuxt-logto/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@zernico/nuxt-logto
[npm-downloads-src]: https://img.shields.io/npm/dm/@zernico/nuxt-logto.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@zernico/nuxt-logto
[license-src]: https://img.shields.io/npm/l/@zernico/nuxt-logto.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@zernico/nuxt-logto
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
