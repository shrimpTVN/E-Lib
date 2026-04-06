<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <Header></Header>

  <section class="max-w-[1440px] mx-auto">
    <router-view />
  </section>

  <Footer></Footer>
</template>
