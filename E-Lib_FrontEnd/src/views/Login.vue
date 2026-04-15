<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'

const { title, desc, formType } = defineProps({
  title: String,
  desc: String,
  formType: Object,
})

const route = useRoute()
const url = ref(route.path)
</script>

<template>
  <Header />
  <div
    class="login-page bg-[url(https://res.cloudinary.com/depaiphq0/image/upload/v1775465600/40lkAjHsxejTsAdZPuHRM1_vaybuq.webp)] bg-cover bg-center"
  >
    <component :is="formType" :url="url" @update:url="(newValue) => (url = newValue)"></component>
  </div>
</template>
