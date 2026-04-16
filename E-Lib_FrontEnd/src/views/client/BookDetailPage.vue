<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BookList from '@/components/BookList.vue'
import IsLoading from '@/components/IsLoading.vue'
import api from '@/api/axios.js'
import Galleria from 'primevue/galleria'
import { useAuthStore } from '@/stores/auth.store'
import { useAppToast } from '@/utils/useAppToast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmPopup from 'primevue/confirmpopup'

const confirm = useConfirm()
const { addToast } = useAppToast()
const authStore = useAuthStore()
const route = useRoute()

const book = ref(null)
const relatedBooks = ref([])
const loading = ref(true)
const error = ref(null)
const isLimit = ref(true)
const responsiveOptions = ref([
  {
    breakpoint: '1300px',
    numVisible: 4,
  },
  {
    breakpoint: '575px',
    numVisible: 1,
  },
])
const images = ref([])
const isShowComment = ref(false)
const visible = ref(false)
const visibleReview = ref(false)
const vote = ref(0)
const comment = ref('')
const reviews = ref([])
const isEditingReview = ref(false)
const star = [1, 2, 3, 4, 5]
// Event handler
const handleLimitChange = () => {
  isLimit.value = !isLimit.value
}

const handleAddToFavorite = () => {
  try {
    const res = api.post('/favorites', {
      idDocGia: authStore.user.id,
      idSach: book.value._id,
      soLuong: 1, // Default quantity to add to favorites
    })

    addToast('success', 'Thành công', 'Đã thêm vào danh sách yêu thích')
  } catch (err) {
    console.log('Error while adding to favorite', err)
    addToast('error', 'Thất bại', 'Thêm vào danh sách yêu thích thất bại')
  }
}

const handleBorrowNow = () => {
  if (!authStore.user) {
    addToast('error', 'Vui lòng đăng nhập', 'Bạn cần đăng nhập để mượn sách')
    return
  }

  visible.value = true
}

const handleBorrowBook = async () => {
  try {
    const res = await api.post('/borrow', {
      idDocGia: authStore.user.id,
      idSach: [book.value._id],
    })

    addToast('success', 'Mượn sách thành công', 'Bạn đã mượn sách thành công')

    visible.value = false
  } catch (err) {
    console.log('Error while borrowing books', err)
    addToast(
      'error',
      'Mượn sách thất bại',
      err.response?.data?.message || 'Có lỗi xảy ra khi mượn sách',
    )
  }
}

const openReviewDialog = (isEdit = false) => {
  if (!authStore.user) {
    addToast('error', 'Vui lòng đăng nhập', 'Bạn cần đăng nhập để viết đánh giá')
    return
  }

  isEditingReview.value = isEdit
  if (isEdit) {
    const index = reviews.value.findIndex((review) => review.idDocGia._id === authStore.user.id)
    if (index !== -1) {
      comment.value = reviews.value[index]?.binhLuan || ''
      vote.value = reviews.value[index]?.danhGia || 5
    }
  } else {
    vote.value = 5
    comment.value = ''
  }
  visibleReview.value = true
}

const closeReviewDialog = () => {
  visibleReview.value = false
  isEditingReview.value = false
  comment.value = ''
  vote.value = 0
}

const handleSubmitReview = async () => {
  if (comment.value.trim() === '') {
    addToast('error', 'Nhận xét không được để trống', 'Vui lòng nhập nhận xét của bạn')
    return
  }
  console.log('Submitting review', {
    bookId: book.value._id,
    userId: authStore.user.id,
    vote: vote.value,
    comment: comment.value,
  })
  try {
    const res = await api.post(`/reviews`, {
      idSach: book.value._id,
      idDocGia: authStore.user.id,
      danhGia: vote.value,
      binhLuan: comment.value,
    })

    addToast('success', 'Đánh giá thành công', 'Cảm ơn bạn đã đánh giá sách')
    visibleReview.value = false
    await loadReviews() // Reload reviews after submission
  } catch (err) {
    console.log('Error while submitting review', err)
    addToast(
      'error',
      'Đánh giá thất bại',
      err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá',
    )
  }
}

const handleEditReview = async () => {
  if (comment.value.trim() === '') {
    addToast('error', 'Nhận xét không được để trống', 'Vui lòng nhập nhận xét của bạn')
    return
  }

  try {
    const reviewToEdit = reviews.value.find((review) => review.idDocGia._id === authStore.user.id)
    if (!reviewToEdit) {
      addToast('error', 'Không tìm thấy đánh giá', 'Bạn không có đánh giá nào để chỉnh sửa')
      return
    }

    const res = await api.patch(`/reviews/${reviewToEdit._id}`, {
      danhGia: vote.value,
      binhLuan: comment.value,
    })

    addToast('success', 'Cập nhật đánh giá thành công', 'Đánh giá của bạn đã được cập nhật')
    visibleReview.value = false
    await loadReviews() // Reload reviews after editing
  } catch (err) {
    console.log('Error while editing review', err)
    addToast(
      'error',
      'Cập nhật đánh giá thất bại',
      err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá',
    )
  } finally {
    isEditingReview.value = false
  }
}

const handleDeleteReview = async (reviewId) => {
  try {
    const res = await api.delete(`/reviews/${reviewId}`)

    addToast('success', 'Xóa đánh giá thành công', 'Đánh giá của bạn đã được xóa')
    await loadReviews() // Reload reviews after deletion
  } catch (err) {
    console.log('Error while deleting review', err)
    addToast(
      'error',
      'Xóa đánh giá thất bại',
      err.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá',
    )
  }
}

const confirmDeleteReview = (event, reviewId) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Bạn có chắc chắn muốn xóa đánh giá này không?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Đóng',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger',
    },
    accept: () => {
      // addToast('success', 'Xóa đánh giá thành công', 'Đánh giá của bạn đã được xóa')
      handleDeleteReview(reviewId)
      // Call API to delete review here
    },
    reject: () => {},
  })
}

// methods
const loadBook = async (bookId) => {
  try {
    loading.value = true
    error.value = null

    if (!bookId) {
      error.value = 'Book ID not found'
      return
    }

    const res = await api.get(`/books/${bookId}`)
    book.value = res.data.book
    if (book.value.hinhAnh.length < 5) {
      for (let i = book.value.hinhAnh.length; i < 5; i++) {
        book.value.hinhAnh.push(
          'https://res.cloudinary.com/depaiphq0/image/upload/v1775474472/pngtree-an-open-book-is-shown-with-a-yellow-and-blue-logo-png-image_15675075_f99kmp.png',
        )
      }
    }

    images.value = (res.data.book?.hinhAnh || []).map((img) => ({
      itemImageSrc: img,
      thumbnailImageSrc: img,
      alt: book.value.tenSach,
    }))
    relatedBooks.value = res.data.relatedBooks
  } catch (err) {
    error.value = 'Failed to load book details'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadReviews = async () => {
  try {
    const res = await api.get(`/reviews/book/${book.value._id}`)
    console.log('Loaded reviews', res.data)
    reviews.value = res.data
  } catch (err) {
    console.error('Failed to load reviews', err)
  }
  // reviews.value = [
  //   {
  //     id: 1,
  //     tenDocGia: 'Nguyen Van A',
  //     danhGia: 4,
  //     binhLuan: 'Sách rất hay, nội dung hấp dẫn và dễ hiểu.',
  //     ngayTao: '2024-06-15',
  //   },
  //   {
  //     id: 2,
  //     tenDocGia: 'Tran Thi B',
  //     danhGia: 5,
  //     binhLuan: 'Tôi rất thích cuốn sách này, nó đã giúp tôi rất nhiều trong việc học tập.',
  //     ngayTao: '2024-06-16',
  //   },
  //   {
  //     id: 3,
  //     tenDocGia: 'Le Van C',
  //     danhGia: 3,
  //     binhLuan: 'Sách khá ổn, nhưng tôi nghĩ nó có thể được cải thiện hơn nữa.',
  //     ngayTao: '2024-06-17',
  //   },
  //   {
  //     id: 4,
  //     tenDocGia: 'Pham Thi D',
  //     danhGia: 2,
  //     binhLuan: 'Tôi không thực sự thích cuốn sách này, nó không phù hợp với nhu cầu của tôi.',
  //     ngayTao: '2024-06-18',
  //   },
  //   {
  //     id: 5,
  //     tenDocGia: 'Hoang Van E',
  //     danhGia: 5,
  //     binhLuan: 'Một cuốn sách tuyệt vời, tôi đã học được rất nhiều điều mới từ nó.',
  //     ngayTao: '2024-06-19',
  //   },
  // ]
}

onMounted(async () => {
  await loadBook(route.params.id)
  await loadReviews()
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
          <div class="md:col-span-1 flex items-center justify-center bg-gray-100 rounded-lg">
            <Galleria
              :value="images"
              :responsiveOptions="responsiveOptions"
              :numVisible="5"
              :circular="true"
              containerStyle="max-width: 640px"
              :showItemNavigators="true"
            >
              <template #item="slotProps">
                <img
                  :src="slotProps.item.itemImageSrc"
                  :alt="slotProps.item.alt"
                  style="height: 420px; display: block"
                />
              </template>
              <template #thumbnail="slotProps">
                <img
                  :src="slotProps.item.thumbnailImageSrc"
                  :alt="slotProps.item.alt"
                  class="block text-gray-500 max-height-8 object-cover"
                />
              </template>
            </Galleria>
          </div>

          <!-- Book Info Section -->
          <div class="md:col-span-2">
            <!-- Title -->
            <p class="text-xl md:text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              {{ book.tenSach }}
            </p>

            <!-- Navigation Buttons -->
            <div class="book-nav-btn-container flex mb-2 text-blue-500 text-lg font-bold">
              <button
                @click="isShowComment = false"
                :class="[
                  !isShowComment ? 'underline text-decoration-line: underline' : '',
                  'px-4 py-2 rounded-lg',
                ]"
              >
                Thông tin sách
              </button>

              <button
                @click="isShowComment = true"
                :class="[
                  isShowComment ? 'underline text-decoration-line: underline' : '',
                  'px-4 py-2 rounded-lg ',
                ]"
              >
                Đánh giá & Bình luận
              </button>
            </div>

            <!-- Book Information -->
            <div v-if="!isShowComment" class="book-infor-container">
              <!-- Meta Info -->
              <div class="space-y-3 mb-2">
                <div class="flex items-start">
                  <span class="text-gray-600 font-semibold w-32">Tác giả:</span>
                  <span class="text-gray-800">{{ book.tacGia }}</span>
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
                  <span class="text-gray-600 font-semibold w-32">Giá: </span>
                  <span class="text-gray-800">
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
                      'px-4 py-2 rounded-full font-bold text-center',
                      parseInt(book.soLuong) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ parseInt(book.soLuong) > 0 ? 'Còn sách' : 'Đã mượn hết' }}
                  </span>
                  <span class="text-gray-700 font-bold">
                    Số quyển:
                    <span class="font-bold text-lg">{{ book.conLai }}/{{ book.soLuong }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Comment Section -->
            <div v-else class="comment-container">
              <!-- Comment Header -->
              <div class="comment-header-container flex justify-between items-center mb-4 w-full">
                <span class="font-bold text-gray-600 text-lg">
                  Đánh giá: {{ book.danhGia }}/5
                  <i class="pi pi-star-fill text-yellow-400"></i>
                  {{
                    reviews?.length > 0 ? `(${reviews.length} đánh giá)` : '(Chưa có đánh giá nào)'
                  }}
                </span>

                <button
                  class="rounded-lg hover:bg-blue-100 hover:text-blue-600 px-4 py-2 text-blue-500 font-medium flex items-center gap-2"
                >
                  <i class="pi pi-pencil"></i>
                  <span class="underline text-center" @click="openReviewDialog(false)">
                    Viết đánh giá</span
                  >
                </button>
              </div>

              <!-- reviews -->
              <div class="reviews-container h-[16rem] overflow-y-auto">
                <div class="review flex gap-4 mb-4 ml-2" v-for="review in reviews" :key="review.id">
                  <div class="w-[16%] text-sm">
                    <span class="font-semibold text-gray-800">
                      {{ review.idDocGia.hoLot.concat(' ' + review.idDocGia.ten) }}
                    </span>
                    <p class="text-gray-600 text-sm mb-1">
                      <i
                        v-for="i in star"
                        :key="i"
                        :class="[
                          'pi pi-star-fill text-sm',
                          {
                            'text-yellow-400': i <= review.danhGia,
                            'text-gray-300': i > review.danhGia,
                          },
                        ]"
                      ></i>
                    </p>
                  </div>
                  <div class="w-[84%]">
                    <p class="text-gray-600">{{ review.binhLuan }}</p>
                    <div class="comment-button-container flex gap-4 mt-1 text-sm">
                      <span class="text-gray-500">
                        {{ new Date(review.ngayTao).toLocaleDateString('vi-VN') }}
                      </span>

                      <div v-if="review.idDocGia._id == authStore.user.id" class="flex gap-4">
                        <span
                          class="cursor-pointer hover:text-blue-600"
                          @click="openReviewDialog(true)"
                          >Chỉnh sửa</span
                        >
                        <span
                          class="cursor-pointer hover:text-red-600"
                          @click="confirmDeleteReview($event, review._id)"
                          >Xóa</span
                        >
                        <ConfirmPopup />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 mt-4 justify-center">
              <button
                @click="handleAddToFavorite"
                :disabled="parseInt(book.soLuong) === 0"
                class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="pi pi-heart-fill"></i> Thêm vào danh sách yêu thích
              </button>
              <button
                @click="handleBorrowNow"
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
              {{
                isLimit ? (book.moTa || '').substring(0, 400) + (book.moTa ? '...' : '') : book.moTa
              }}
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

      <div class="move-to-book-list-container flex justify-center mt-8">
        <router-link
          :to="`/books`"
          class="mt-6 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Xem tất cả sách
        </router-link>
      </div>
    </div>

    <!-- borrow dialog  -->
    <Dialog
      v-model:visible="visible"
      modal
      header="Xác nhận mượn sách"
      class="max-w-[50%] min-w-[30%]"
    >
      <div class="book-list-container">
        <div
          class="favorite-list-item flex border rounded-lg flex-row items-center justify-between px-4 py-2 bg-white mb-2"
        >
          <!-- book infor -->
          <div class="flex items-center">
            <div
              class="book-image w-28 h-28 bg-gray-200 rounded-md text-center flex items-center justify-center"
            >
              <img :src="book.biaSach" alt="Bia Sach" class="max-h-28 text-center" />
            </div>

            <div class="book-infor-favorite ml-4">
              <div class="book-name-container">
                <h3 class="font-bold text-gray-800 text-lg mb-1">
                  {{ book.tenSach }}
                </h3>
                <p class="text-gray-500">Tác giả: {{ book.tacGia }}</p>
                <p class="text-gray-500">Năm xuất bản: {{ book.namXuatBan }}</p>
              </div>
            </div>
          </div>

          <span class="px-6 cursor-pointer text-red-500 ml-10" @click="visible = false">
            <i class="pi pi-trash"></i>
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" label="Hủy" severity="secondary" @click="visible = false"></Button>
          <Button type="button" label="Xác nhận" @click="handleBorrowBook"></Button>
        </div>
      </div>
    </Dialog>

    <!-- Review Dialog -->
    <Dialog
      v-model:visible="visibleReview"
      modal
      header="Đánh giá sách"
      class="max-w-[50%] min-w-[30%]"
      @hide="closeReviewDialog"
    >
      <div class="book-list-container">
        <div class="flex flex-col gap-4">
          <div>
            <label for="vote" class="block text-sm font-bold text-gray-700 mb-2">Đánh giá</label>
            <Rating v-model="vote" :cancel="false" />
          </div>
          <div>
            <label for="comment" class="block text-sm font-bold text-gray-700 mb-2">Nhận xét</label>
            <Textarea v-model="comment" rows="8" cols="56" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            label="Hủy"
            severity="secondary"
            @click="closeReviewDialog"
          ></Button>
          <Button
            v-if="!isEditingReview"
            type="button"
            label="Gửi đánh giá"
            @click="handleSubmitReview"
          ></Button>
          <Button v-else type="button" label="Chỉnh sửa" @click="handleEditReview"></Button>
        </div>
      </div>
    </Dialog>
  </section>
</template>
