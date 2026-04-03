<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BookList from '@/components/BookList.vue'
import IsLoading from '@/components/IsLoading.vue'
import api from '@/api/axios.js'

const route = useRoute()
const book = ref(null)
const relatedBooks = ref([])
const loading = ref(true)
const error = ref(null)
const isLimit = ref(true)

// Event handler
const handleLimitChange = () => {
  isLimit.value = !isLimit.value
}

const handleAddToFavorite = () => {
  // TODO: Implement add to favorite functionality
  console.log('Added to favorite:', book.value)
}

const handleBorrowNow = () => {
  // TODO: Implement buy now functionality
  console.log('Borrow now:', book.value)
}

// methods
const loadBook = async (bookId) => {
  try {
    if (!bookId) {
      error.value = 'Book ID not found'
      return
    }
    console.log('-----Loading book with ID:', bookId)
    // Fetch book details and related books in one request
    const res = await api.get(`/books/${bookId}`)
    book.value = res.data.book
    relatedBooks.value = res.data.relatedBooks
  } catch (err) {
    error.value = 'Failed to load book details'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBook(route.params.id)
})

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) loadBook(newId)
  },
)
</script>

<template>
  <section class="py-4 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Back Button -->
      <router-link
        to="/books"
        class="inline-flex items-center bg-blue-600 hover:text-blue-800 mb-4 transition-colors text-white px-4 py-2 rounded-lg text-center"
      >
        <i class="pi pi-arrow-left pr-2"></i>
        <span class="text-center text-sm font-bold pb"> Quay lại</span>
      </router-link>

      <!-- Loading State -->
      <IsLoading v-if="loading"></IsLoading>

      <!-- Error State -->
      <div
        v-if="error && !loading"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <p class="text-red-700 font-medium">{{ error }}</p>
      </div>

      <!-- Book Details -->
      <div v-if="book && !loading" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          <!-- Book Image Section -->
          <div class="md:col-span-1">
            <div class="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-96">
              <div class="text-center">
                <div class="text-6xl mb-4">📚</div>
                <p class="text-gray-500 text-sm">Hình ảnh sách</p>
              </div>
            </div>
          </div>

          <!-- Book Info Section -->
          <div class="md:col-span-2">
            <!-- Title -->
            <p class="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              {{ book.tenSach }}
            </p>

            <!-- Meta Info -->
            <div class="space-y-3 mb-2">
              <div class="flex items-start">
                <span class="text-gray-600 font-semibold w-32">Tác giả:</span>
                <span class="text-blue-600 hover:underline cursor-pointer">{{ book.tacGia }}</span>
              </div>
              <div class="flex items-start">
                <span class="text-gray-600 font-semibold w-32">Nhà xuất bản:</span>
                <span class="text-gray-800">{{ book.idNXB?.tenNXB || 'Không xác định' }}</span>
              </div>
              <div class="flex items-start">
                <span class="text-gray-600 font-semibold w-32">Năm xuất bản:</span>
                <span class="text-gray-800">{{ book.namXuatBan }}</span>
              </div>
              <!-- Price Section -->
              <div class="flex items-start">
                <span class="text-gray-600 font-bold pr-2 w-32">Giá: </span>
                <span class="text-xl font-bold text-blue-600 align-middle text-center">
                  {{
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      book.donGia,
                    )
                  }}
                </span>
              </div>
            </div>

            <!-- Stock Info -->
            <div class="mb-8">
              <p class="text-gray-600 font-semibold mb-2">Tình trạng tủ sách:</p>
              <div class="flex items-center gap-4">
                <span
                  :class="[
                    'px-4 py-2 rounded-full font-medium',
                    parseInt(book.soLuong) > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ parseInt(book.soLuong) > 0 ? 'Còn sách' : 'Đã mượn hết' }}
                </span>
                <span class="text-gray-700">
                  Số quyển:
                  <span class="font-bold text-lg">{{ book.conLai }}/{{ book.soLuong }}</span>
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button
                @click="handleAddToCart"
                :disabled="parseInt(book.soLuong) === 0"
                class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="pi pi-heart-fill"></i> Thêm vào danh sách yêu thích
              </button>
              <button
                @click="handleBuyNow"
                :disabled="parseInt(book.soLuong) === 0"
                class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="pi pi-bolt"></i> Mượn ngay
              </button>
            </div>
          </div>
        </div>

        <!-- Description Section (Optional) -->
        <div class="border-t">
          <div class="p-8">
            <h2
              class="text-xl font-bold text-blue-600 mb-4 text-center decoration-[1.2px] underline"
            >
              Giới thiệu sách
            </h2>
            <p class="text-gray-700 md:px-8">
              {{ isLimit ? book.gioiThieu.substring(0, 400) + '...' : book.gioiThieu }}
            </p>
            <div class="text-center">
              <button @click="handleLimitChange" class="text-blue-600 hover:underline font-medium">
                {{ isLimit ? 'Xem thêm' : 'Rút gọn' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Book suggest relevant list -->
      <div v-if="book && !loading" class="mt-12">
        <h2 class="text-2xl font-bold text-blue-600 mb-6 text-center underline">Sách liên quan</h2>
        <BookList :books="relatedBooks" />
      </div>
    </div>
  </section>
</template>
