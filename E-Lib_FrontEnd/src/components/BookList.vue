<script setup>
// import { props } from 'vue'
import BookCard from '@/components/BookCard.vue'

const props = defineProps({
  books: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="mx-4">
    <div class="book-list-container">
      <div class="grid grid-cols-4 gap-1">
        <BookCard v-for="book in books" :key="book._id" :book="book" />
      </div>
    </div>
  </section>
</template>
