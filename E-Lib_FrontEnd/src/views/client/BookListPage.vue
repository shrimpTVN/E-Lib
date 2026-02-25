<script setup>
import BookFilter from '@/components/BookFilter.vue'
import BookList from '@/components/BookList.vue'
</script>

<template>
  <section class="grid grid-cols-[20%_80%]">
    <BookFilter class="bg-yellow-200"> </BookFilter>
    <BookList class="border-l border-black"> </BookList>
  </section>
</template>
