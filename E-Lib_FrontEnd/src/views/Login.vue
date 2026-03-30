<template>
  <div class="login-page">
    <component :is="formType" :url="url" @update:url="(newValue) => (url = newValue)"></component>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const { title, desc, formType } = defineProps({
  title: String,
  desc: String,
  formType: Object,
})

const route = useRoute()
const url = ref(route.path)
</script>
