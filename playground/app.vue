<script setup>
import { useLogto } from './.nuxt/imports'

const { claims, accessToken, signIn, signOut, signUp, refresh } = useLogto()
</script>

<template>
  <div>
    Nuxt module playground!
    {{ JSON.stringify(claims) }}

    {{ JSON.stringify(accessToken) }}

    <button @click="() => signIn()">Sign In</button>
    <button @click="() => signUp()">Sign Up</button>
    <button @click="() => signOut()">Sign Out</button>
    <button @click="() => refresh()">Refresh</button>
  </div>
</template>
