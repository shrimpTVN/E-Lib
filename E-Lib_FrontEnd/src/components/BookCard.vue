<script setup>
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <router-link
    :to="`/books/${book._id}`"
    class="book-card bg-white border border-gray-200 px-6 pb-4 rounded-tl-lg rounded-tr-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out m-1"
  >
    <div class="image-container h-48 w-full mb-4 flex items-center justify-center">
      <span class="text-8xl text-center align-middle m-auto">📚</span>
    </div>
    <h3 class="text-base font-bold text-gray-900 line-clamp-1">
      {{ book.tenSach }}
    </h3>
    <div class="space-y-2 truncate">
      <p class="text-gray-600 text-sm">Tác gia: {{ book.tacGia }}</p>
      <p class="text-gray-600 text-sm">
        Nhà xuất bản: {{ book.idNXB ? book.idNXB.tenNXB : 'Đang tải...' }}
      </p>
      <p class="text-gray-600 text-sm">
        <span class="font-semibold text-gray-700"
          >Số quyển còn lại: {{ book.conLai }}/{{ book.soLuong }}</span
        >
      </p>
    </div>
  </router-link>
</template>
