<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
  console.log('Auth check completed. User:', authStore.user)
})
</script>

<template>
  <section class="app-container bg-gray-100 min-h-screen">
    <RouterView />
  </section>
</template>
