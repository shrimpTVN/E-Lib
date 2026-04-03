import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/api/axios' // Your axios instance with withCredentials: true

export const useAuthStore = defineStore('auth', () => {
  // 1. State: The data we want to manage globally
  const user = ref(null)
  const isLoading = ref(true)

  // 2. Getters: Computed properties based on state
  const isAuthenticated = computed(() => user.value !== null)
  const isStaffOrAdmin = computed(
    () => user.value?.role === 'staff' || user.value?.role === 'admin',
  )

  // 3. Actions: Functions to modify the state
  const setUser = (userData) => {
    user.value = userData
  }

  // Action to check session on page load
  const checkAuth = async () => {
    isLoading.value = true
    try {
      // Calls the backend to check if the HttpOnly cookie is still valid
      const response = await axios.get('/me', { user })
      user.value = response.data.user
    } catch (error) {
      // If 401 Unauthorized, it means no valid cookie
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Action to handle logout globally
  const logout = async () => {
    try {
      await axios.post('/login/logout')
      user.value = null // Clear state on success
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  // Explicitly return what you want to expose to components
  return {
    user,
    isLoading,
    isAuthenticated,
    isStaffOrAdmin,
    setUser,
    checkAuth,
    logout,
  }
})
