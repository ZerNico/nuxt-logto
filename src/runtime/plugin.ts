import { defineNuxtPlugin } from '#app'
import { useLogto } from './composables/useLogto'
import { useLogtoState } from './composables/useLogtoState'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchContext } = useLogto()
  const { data } = useLogtoState()

  if (data.value === undefined) {
    await fetchContext()
  }

  const unmount = nuxtApp.vueApp.unmount
  nuxtApp.vueApp.unmount = function () {
    data.value = undefined
    unmount()
  }
})
