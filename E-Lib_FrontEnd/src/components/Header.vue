<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()

const { isAuthenticated, user } = storeToRefs(authStore)
</script>

<template>
  <div class="flex items-center justify-between px-8 py-4 bg-blue-800 shadow-md text-white-500">
    <!-- Logo Section -->
    <router-link to="/">
      <div class="flex items-center gap-3">
        <img src="/ctu-logo.png" alt="CTU Logo" class="h-10 w-10" />
        <span class="text-xl font-bold text-white">E-Library CTU</span>
      </div>
    </router-link>

    <!-- Navigation Tags -->
    <div>
      <ul class="flex gap-8 text-white font-bold">
        <li>
          <router-link to="/" class="hover:text-blue-600 cursor-pointer transition-colors"
            >Trang chủ</router-link
          >
        </li>
        <li>
          <router-link to="/books" class="hover:text-blue-600 cursor-pointer transition-colors"
            >Sách</router-link
          >
        </li>
        <li>
          <router-link to="" class="hover:text-blue-600 cursor-pointer transition-colors"
            >Mượn sách</router-link
          >
        </li>
      </ul>
    </div>

    <!-- Icons Section -->
    <div v-if="isAuthenticated" class="flex items-center gap-6 text-white font-bold">
      <router-link to="/favorite">
        <i
          class="pi pi-heart hover:text-red-600 cursor-pointer !text-2xl block transition-colors px-4"
        ></i>
      </router-link>

      <router-link :to="`/readers/${user.id}`">
        <i
          class="pi pi-user hover:text-blue-600 cursor-pointer !text-2xl block transition-colors px-4"
        ></i>
      </router-link>
    </div>
    <div v-else class="login-btn-container text-white">
      <router-link to="/login" class="px-2 py-2 transition-colors rounded-md hover:bg-blue-600"
        >Đăng nhập</router-link
      >
      |
      <router-link to="/register" class="px-2 py-2 transition-colors rounded-md hover:bg-blue-600"
        >Đăng ký</router-link
      >
    </div>
  </div>
</template>
