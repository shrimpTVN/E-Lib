<script setup>
import BookFilter from '@/components/BookFilter.vue'
import BookList from '@/components/BookList.vue'
import IsLoading from '@/components/IsLoading.vue'
import Paginator from 'primevue/paginator'
import { ref, onMounted } from 'vue'
import api from '@/api/axios.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const books = ref([])

const publisherNames = ref([])
const types = ref([])
const authors = ref([])

const isLoading = ref(true)

// --- Search Bar State ---
const searchQuery = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestTimeout = null

// --- 1. Trạng thái Phân trang (Pagination State) ---
const first = ref(0) // Vị trí index bắt đầu (PrimeVue sử dụng)
const rows = ref(12) // Số lượng sách trên 1 trang (limit)
const totalRecords = ref(0) // Tổng số sách thỏa mãn điều kiện (Backend phải trả về số này)

// --- 2. Trạng thái Bộ lọc (Filter State) ---
const currentFilters = ref({ types: [], authors: [], publishers: [] })

// --- 3. Hàm gọi API trung tâm ---
const fetchBooks = async () => {
  isLoading.value = true
  try {
    // Tính toán số trang (page) hiện tại. Backend thường dùng index bắt đầu từ 1.
    const currentPage = Math.floor(first.value / rows.value) + 1

    // Định nghĩa các Query Parameters sẽ gửi lên Express
    const params = {
      page: currentPage,
      limit: rows.value,
      // Nối các mảng thành chuỗi phân cách bằng dấu phẩy (ví dụ: "Tiểu thuyết,Khoa học")
      keyword: searchQuery.value.trim(),
      types: currentFilters.value.types.join(', '),
      authors: currentFilters.value.authors.join(', '),
      publishers: currentFilters.value.publishers.join(', '),
    }

    // Axios sẽ tự động chuyển object params thành query string:
    // GET /books?page=1&limit=12&types=...
    const response = await api.get('/books', { params })

    // Cập nhật danh sách sách cho trang hiện tại và tổng số record
    books.value = response.data.books
    totalRecords.value = response.data.totalRecords // QUAN TRỌNG: Backend cần tính và trả về giá trị này

    // Chỉ cập nhật danh sách các bộ lọc (publishers, types, authors) trong lần render đầu tiên
    // Nếu BE của bạn tách riêng API lấy danh sách filter, bạn nên tách ra hàm riêng.
    if (types.value.length === 0) {
      publisherNames.value = response.data.publisherNames || []
      types.value = response.data.types || []
      authors.value = response.data.authors || []
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu sách:', err)
  } finally {
    isLoading.value = false
  }
}

// --- 4. Xử lý Sự kiện (Event Handlers) ---
// Khi Paginator thay đổi trang
const onPageChange = (event) => {
  first.value = event.first // Cập nhật vị trí bắt đầu mới
  rows.value = event.rows
  fetchBooks() // Gọi lại API để lấy dữ liệu của trang mới
}

// Khi người dùng chọn bộ lọc mới
const handleFilter = (filters) => {
  console.log('Bộ lọc mới được áp dụng:', filters)
  currentFilters.value = filters
  first.value = 0 // Bắt buộc: Trở về trang 1 (first = 0) khi áp dụng bộ lọc mới
  fetchBooks() // Gọi lại API với điều kiện lọc mới
}

// Hàm gọi API lấy gợi ý (Debounce ngắn: 300ms)
const fetchSuggestions = () => {
  clearTimeout(suggestTimeout)

  if (!searchQuery.value.trim()) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  suggestTimeout = setTimeout(async () => {
    try {
      const response = await api.get(`/books/suggestions?keyword=${searchQuery.value}`)
      suggestions.value = response.data
      showSuggestions.value = true
    } catch (error) {
      console.error('Lỗi tải gợi ý:', error)
    }
  }, 300)
}

// Xử lý tắt gợi ý khi click ra ngoài input
const hideSuggestions = () => {
  // Dùng setTimeout nhỏ để sự kiện click vào gợi ý kịp chạy trước khi input mất focus
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Xử lý khi user nhấn Enter để tìm kiếm toàn bộ
const onSearchEnter = () => {
  showSuggestions.value = false // Ẩn gợi ý
  first.value = 0
  fetchBooks() // Gọi hàm fetchBooks đầy đủ
}

// Chuyển đến trang chi tiết sách khi click vào gợi ý
const goToBookDetail = (bookId) => {
  router.push(`/books/${bookId}`)
}

// Gọi data lần đầu khi component được mount
onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <section class="grid grid-cols-[20%_80%] mt-6">
    <BookFilter
      :publisher-names="publisherNames"
      :types="types"
      :authors="authors"
      @filter="handleFilter"
    >
    </BookFilter>

    <div class="flex flex-col relative min-h-[500px]">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 z-10 flex items-center justify-center"
      >
        <IsLoading></IsLoading>
      </div>

      <!-- search bar -->
      <div class="mb-6 flex items-center justify-center">
        <div class="relative w-[38rem] h-[3.6rem]">
          <input
            v-model="searchQuery"
            @input="fetchSuggestions"
            @keyup.enter="onSearchEnter"
            @focus="showSuggestions = suggestions.length > 0"
            @blur="hideSuggestions"
            type="text"
            placeholder="Tìm kiếm theo tên, tác giả..."
            class="w-full rounded-md border border-slate-300 px-4 py-2 text-lg text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
          />
          <span
            class="absolute right-3 top-2.5 text-slate-400 px-2 py-1 rounded-md hover:bg-slate-200 cursor-pointer"
            @click="fetchSuggestions"
            ><i class="pi pi-search"></i
          ></span>

          <ul
            v-if="showSuggestions && suggestions.length > 0"
            class="absolute left-0 top-full mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl z-50 divide-y divide-slate-100"
          >
            <li
              v-for="book in suggestions"
              :key="book._id"
              @mousedown.prevent="goToBookDetail(book._id)"
              class="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 transition-colors"
            >
              <div
                class="h-12 w-8 flex-shrink-0 bg-slate-100 flex items-center justify-center overflow-hidden rounded-sm"
              >
                <img
                  v-if="book.biaSach"
                  :src="book.biaSach"
                  alt="Bìa"
                  class="h-full object-cover"
                />
                <span v-else class="text-xs">📚</span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ book.tenSach }}</p>
                <p class="text-xs text-slate-500 truncate">{{ book.tacGia }}</p>
              </div>
            </li>

            <li class="p-2 text-center border-t border-slate-100">
              <span class="text-xs text-slate-400">Nhấn Enter để xem tất cả kết quả</span>
            </li>
          </ul>
        </div>
      </div>

      <BookList class="flex-grow" :books="books"> </BookList>

      <div class="my-4 w-full flex justify-center" v-show="totalRecords > 0">
        <Paginator
          v-model:first="first"
          :rows="rows"
          :totalRecords="totalRecords"
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          class="w-full mx-6"
        />
      </div>
    </div>
  </section>
</template>
