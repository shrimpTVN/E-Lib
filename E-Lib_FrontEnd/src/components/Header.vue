<script setup>
import { ref } from 'vue'

const userID = ref(1) // TODO: Replace with actual user ID from authentication
</script>

<template>
  <div class="flex items-center justify-between px-8 py-4 bg-blue-800 shadow-md text-white-500">
    <!-- Logo Section -->
    <div class="flex items-center gap-3">
      <img src="/ctu-logo.png" alt="CTU Logo" class="h-10 w-10" />
      <span class="text-xl font-bold text-white">E-Library CTU</span>
    </div>

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
    <div class="flex items-center gap-6 text-2xl text-white font-bold">
      <router-link to="/favorite">
        <i class="pi pi-heart hover:text-red-600 cursor-pointer transition-colors"></i>
      </router-link>

      <router-link :to="`/users/${userID}`">
        <i class="pi pi-user hover:text-blue-600 cursor-pointer transition-colors px-4"></i>
      </router-link>
    </div>
  </div>
</template>
