<script setup>
import { useLogto } from './.nuxt/imports'

const { claims, accessToken, signIn, signOut, signUp, fetchContext } = useLogto()
</script>

<template>
  <div>
    Nuxt module playground!
    {{ JSON.stringify(claims) }}

    {{ JSON.stringify(accessToken) }}

    <button @click="() => signIn()">Sign In</button>
    <button @click="() => signUp()">Sign Up</button>
    <button @click="() => signOut()">Sign Out</button>
    <button @click="() => fetchContext()">Refresh</button>
  </div>
</template>
