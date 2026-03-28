<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <Header></Header>
  <section>
    <router-view />
  </section>

  <Footer></Footer>
</template>
