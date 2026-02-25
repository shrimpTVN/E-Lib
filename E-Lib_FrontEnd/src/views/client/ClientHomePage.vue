<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <Header></Header>
  <section class="homepage-container min-h-screen max-w-7xl mx-auto py-8">
    <router-view />
  </section>

  <Footer></Footer>
</template>
