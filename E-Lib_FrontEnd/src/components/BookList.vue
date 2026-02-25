<script setup>
import { ref, onMounted } from 'vue'
import BookCard from '@/components/BookCard.vue'
import BookService from '@/services/book.service'
import IsLoading from '@/components/IsLoading.vue'

const books = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    books.value = await BookService.getAll()
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="mt-6 mx-4">
    <div class="book-list-container">
      <IsLoading v-if="isLoading"></IsLoading>
      <div v-else class="grid grid-cols-4 gap-1">
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </div>
  </section>
</template>
