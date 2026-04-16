<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import { onMounted } from 'vue'
import Toast from 'primevue/toast'
import { ConfirmDialog } from 'primevue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await authStore.checkAuth()
  if (!authStore.isAuthenticated) {
    console.warn('User is not authenticated. Redirecting to login page.')
    // You can use router.push('/login') here if you have access to the router instance
  } else {
    console.log('User is authenticated:', authStore.user)
    if (authStore.isStaffOrAdmin && authStore.user) {
      router.push('/admin/dashboard')
    }
  }
})
</script>

<template>
  <section class="app-container bg-gray-100 min-h-screen">
    <Toast position="top-right" />
    <!-- <ConfirmDialog></ConfirmDialog> -->
    <RouterView />
  </section>
</template>
