<script setup>
import PublisherService from '@/services/publisher.service.js'
import { ref, onMounted } from 'vue'

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})

const publisher = ref(null)

onMounted(async () => {
  try {
    const publishers = await PublisherService.getAll()
    publisher.value = publishers.find((p) => p.maNXB === props.book.maNXB)
  } catch (err) {
    console.log(err)
  }
})
</script>

<template>
  <router-link
    :to="`/books/${book.id}`"
    class="book-card bg-white border border-gray-200 px-6 pb-4 rounded-tl-lg rounded-tr-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out m-1"
  >
    <div class="image-container h-48 w-full mb-4 flex items-center justify-center">
      <span class="text-8xl text-center align-middle m-auto">📚</span>
    </div>
    <h3 class="text-base font-bold text-gray-900 line-clamp-1">
      {{ book.tenSach }}
    </h3>
    <div class="space-y-2 truncate">
      <p class="text-gray-600 text-sm"></p>
      <p class="text-gray-600 text-sm">
        <span class="font-semibold text-gray-700">Số quyển còn lại: </span>
        <span class="text-blue-800 text-sm font-bold">{{ book.soQuyen }}</span>
      </p>
    </div>
  </router-link>
</template>
