<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppToast } from '@/utils/useAppToast.js'

import api from '@/api/axios'
import IsLoading from '@/components/IsLoading.vue'
import { useAuthStore } from '@/stores/auth.store'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const { addToast } = useAppToast()
const authStore = useAuthStore()
const favoriteList = ref([])
const isLoading = ref(true)
const visible = ref(false)
const selectedFavorites = ref([])
const selectedQuantity = computed(() => {
  return selectedFavorites.value.reduce((total, favorite) => total + favorite.soLuong, 0)
})

const isSelectAll = computed({
  get() {
    return (
      favoriteList.value.length > 0 && selectedFavorites.value.length === favoriteList.value.length
    )
  },
  set(value) {
    if (value) {
      selectedFavorites.value = [...favoriteList.value]
    } else {
      selectedFavorites.value = []
    }
  },
})

// const handleIncreaseQuantity = async (favorite, index) => {
//   if (favorite.soLuong + 1 > 5) {
//     addToast('warn', 'Không thể tăng số lượng', 'Tổng số lượng mượn không thể vượt quá 5')
//     return
//   }

//   // if (favorite.soLuong >= favorite.idSach.conLai) {
//   //   addToast(
//   //     'warn',
//   //     'Không thể tăng số lượng',
//   //     'Số lượng yêu thích không thể vượt quá số sách còn lại',
//   //   )
//   //   return
//   // }

//   try {
//     const res = await api.patch('/favorites', {
//       idDocGia: authStore.user.id,
//       idSach: favorite.idSach._id,
//       soLuong: favorite.soLuong + 1,
//     })
//     if (res.status === 200) {
//       favoriteList.value[index].soLuong += 1
//     }
//   } catch (err) {
//     console.log('Error while increasing quantity', err)
//     addToast('error', 'Lỗi', 'Có lỗi xảy ra khi tăng số lượng')
//   }
// }

// const handleDecreaseQuantity = async (favorite, index) => {
//   try {
//     if (favoriteList.value[index].soLuong > 1) {
//       const res = await api.patch('/favorites', {
//         idDocGia: authStore.user.id,
//         idSach: favorite.idSach._id,
//         soLuong: favorite.soLuong - 1,
//       })
//       if (res.status === 200) {
//         favoriteList.value[index].soLuong -= 1
//       }
//     } else {
//       handleDeleteFavorite(favorite, index)
//     }
//   } catch (err) {
//     console.log('Error while decreasing quantity', err)
//     addToast('error', 'Lỗi', 'Có lỗi xảy ra khi giảm số lượng')
//   }
// }

const deleteFavorite = async (bookId) => {
  try {
    const res = await api.delete('/favorites', {
      data: {
        idDocGia: authStore.user.id,
        idSach: bookId,
      },
    })
    return res.status === 200
  } catch (err) {
    console.log('Error while deleting favorite', err)
    addToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích')
    return false
  }
}

const handleDeleteFavorite = async (favorite, index) => {
  if (await deleteFavorite(favorite.idSach._id)) {
    favoriteList.value.splice(index, 1)

    // remove from selected list if exist
    const selectedIndex = selectedFavorites.value.findIndex(
      (item) => item.idSach._id === favorite.idSach._id,
    )
    if (selectedIndex !== -1) {
      selectedFavorites.value.splice(selectedIndex, 1)
    }
  }
}

const handleOpenDialog = () => {
  if (selectedQuantity.value > 5) {
    addToast('error', 'Không thể mượn sách', 'Không thể mượn hơn 5 quyển sách cùng lúc')
    return
  }

  if (selectedQuantity.value === 0) {
    addToast('warn', 'Chưa chọn sách', 'Vui lòng chọn ít nhất một quyển sách để mượn')
    return
  }

  visible.value = true
}

const handleDeleteSelectedFavorite = (index) => {
  selectedFavorites.value.splice(index, 1)
  if (selectedFavorites.value.length === 0) {
    visible.value = false
  }
}

// const handleIncreaseBorrow = (index) => {
//   const quantity = selectedFavorites.value.reduce((total, favorite) => total + favorite.soLuong, 0)
//   if (quantity + 1 > 5) {
//     addToast('warn', 'Không thể tăng số lượng', 'Tổng số lượng mượn không thể vượt quá 5')
//     return
//   }
//   selectedFavorites.value[index].soLuong += 1
// }

// const handleDecreaseBorrow = (index) => {
//   selectedFavorites.value[index].soLuong -= 1
//   if (selectedFavorites.value[index].soLuong < 1) {
//     selectedFavorites.value.splice(index, 1)
//   }
// }

const handleBorrowBooks = async () => {
  if (selectedQuantity.value > 5) {
    addToast('error', 'Không thể mượn sách', 'Không thể mượn hơn 5 quyển sách cùng lúc')
    return
  }

  const borrowBookIds = selectedFavorites.value.map((favorite) => favorite.idSach._id)

  try {
    const res = await api.post('/borrow', {
      idDocGia: authStore.user.id,
      idSach: borrowBookIds,
    })

    addToast('success', 'Mượn sách thành công', 'Bạn đã mượn sách thành công')
    console.log('Borrow response:', res.data.bookCreated)
    visible.value = false
    // Remove borrowed books from favorite list

    // remove selected books
    selectedFavorites.value = []
  } catch (err) {
    console.log('Error while borrowing books', err)
    addToast(
      'error',
      'Mượn sách thất bại',
      err.response?.data?.message || 'Có lỗi xảy ra khi mượn sách',
    )
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/favorites', {
      params: { idDocGia: authStore.user.id },
    })
    console.log('Favorite list:', res.data.favorites)
    favoriteList.value = res.data.favorites
  } catch (err) {
    console.log('Error while fetching data', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="pt-4 min-h-screen">
    <h1 class="text-2xl mb-4 text-blue-600 font-bold">Danh sách yêu thích</h1>

    <IsLoading v-if="isLoading" />

    <div v-else class="grid grid-cols-[70%_30%]">
      <div class="book-favorite-container">
        <!-- favorite list header -->
        <div
          class="book-favorite__header flex border rounded-lg flex-row items-center justify-between mb-4 px-4 py-2 bg-white text-center"
        >
          <!-- checked all items -->
          <div class="flex items-center">
            <div class="mt-1 px-4 inline-block">
              <input
                type="checkbox"
                class="h-[1.4rem] w-[1.4rem] rounded-md text-center bg-orange-500"
                v-model="isSelectAll"
              />
            </div>
            <span class="ml-2 text-center">Chọn tất cả</span>
          </div>

          <div>
            <span class="px-6 inline-block">Xóa</span>
          </div>
        </div>

        <!-- favorite list items -->
        <div
          v-for="(favorite, index) in favoriteList"
          :key="favorite._id"
          class="favorite-list-item flex border rounded-lg flex-row items-center justify-between px-4 py-2 bg-white mb-2"
        >
          <!-- book infor -->
          <div class="flex items-center">
            <div class="mt-1 px-4 inline-block">
              <input
                type="checkbox"
                class="h-[1.4rem] w-[1.4rem] rounded-md text-center bg-orange-500"
                v-model="selectedFavorites"
                :value="favorite"
              />
            </div>

            <div
              class="book-image w-28 h-28 bg-gray-200 rounded-md text-center flex items-center justify-center"
            >
              <img
                :src="
                  favorite.idSach.biaSach ||
                  'https://res.cloudinary.com/depaiphq0/image/upload/v1775474472/pngtree-an-open-book-is-shown-with-a-yellow-and-blue-logo-png-image_15675075_f99kmp.png'
                "
                alt="Bia Sach"
                class="max-h-28 text-center"
              />
            </div>

            <div class="book-infor-favorite ml-4">
              <div class="book-name-container">
                <h3 class="font-bold text-gray-800 text-lg mb-1">{{ favorite.idSach.tenSach }}</h3>
                <p class="text-gray-500">Tác giả: {{ favorite.idSach.tacGia }}</p>
                <p class="text-gray-500">Năm xuất bản: {{ favorite.idSach.namXuatBan }}</p>
              </div>

              <p class="book-infor-quantity">
                <span>Sách hiện có: </span> {{ favorite.idSach.conLai }}/{{
                  favorite.idSach.soLuong
                }}
              </p>
            </div>
          </div>

          <!-- quantity and delete
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-2 border rounded-lg px-3 text-gray-500">
              <button
                class="text-sm text-center leading-none"
                @click="handleDecreaseQuantity(favorite, index)"
              >
                <i class="pi pi-minus"></i>
              </button>
              <input
                type="text"
                class="w-6 h-8 text-center font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                :value="favorite.soLuong"
              />
              <button
                class="text-sm text-center leading-none"
                @click="handleIncreaseQuantity(favorite, index)"
              >
                <i class="pi pi-plus"></i>
              </button>
            </span>
            <span
              class="px-6 cursor-pointer text-red-500 ml-10"
              @click="handleDeleteFavorite(favorite, index)"
            >
              <i class="pi pi-trash"></i>
            </span>
          </div> -->

          <span
            class="px-6 cursor-pointer text-red-500 ml-10"
            @click="handleDeleteFavorite(favorite, index)"
          >
            <i class="pi pi-trash"></i>
          </span>
        </div>
      </div>

      <!-- borrow sidebar -->
      <div
        class="book-favorite__sidebar border border-gray-300 rounded-lg p-4 md:ml-4 bg-white max-h-[452px]"
      >
        <h2 class="text-xl font-bold mb-4 text-blue-600 text-center">Tổng quan</h2>
        <div class="policy-container border-b border-gray-300 mb-4 pb-4">
          <p class="text-gray-700 mb-2 font-bold">Quy định mượn sách:</p>
          <ul class="list-disc list-inside text-gray-700 mb-4 text-sm *:py-1">
            <li>Mỗi quyển sách chỉ được mượn không quá 2 tuần và cần gia hạn khi hết thời hạn.</li>
            <li>Nếu trả sách trễ sẽ bị trừ điểm thành viên và có thể phạt tiền tùy mức độ trễ.</li>
            <li>
              Nếu làm hư hỏng hoặc mất sách sẽ phải bồi thường theo giá trị thực tế của sách và trừ
              điểm thành viên.
            </li>
            <li>
              <a href="/" class="text-blue-500">Điều khoản và quy định mượn sách tại E-Lib</a>
            </li>
          </ul>
        </div>
        <p class="font-bold text-gray-700 mb-2">
          Tổng số sách: <span class="font-semibold">{{ selectedFavorites.length }}</span>
        </p>

        <button
          class="mt-8 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-bold"
          @click="handleOpenDialog"
        >
          Mượn sách
        </button>
      </div>
    </div>

    <!-- borrow dialog  -->
    <Dialog
      v-model:visible="visible"
      modal
      header="Xác nhận mượn sách"
      :style="{ width: '25rem' }"
      class="max-w-[50%] min-w-[30%]"
    >
      <div class="book-list-container">
        <div
          v-for="(selectedFavorite, index) in selectedFavorites"
          :key="selectedFavorite._id"
          class="favorite-list-item flex border rounded-lg flex-row items-center justify-between px-4 py-2 bg-white mb-2"
        >
          <!-- book infor -->
          <div class="flex items-center">
            <div
              class="book-image w-28 h-28 bg-gray-200 rounded-md text-center flex items-center justify-center"
            >
              <img
                :src="selectedFavorite.idSach.biaSach"
                alt="Bia Sach"
                class="max-h-28 text-center"
              />
            </div>

            <div class="book-infor-favorite ml-4">
              <div class="book-name-container">
                <h3 class="font-bold text-gray-800 text-lg mb-1">
                  {{ selectedFavorite.idSach.tenSach }}
                </h3>
                <p class="text-gray-500">Tác giả: {{ selectedFavorite.idSach.tacGia }}</p>
                <p class="text-gray-500">Năm xuất bản: {{ selectedFavorite.idSach.namXuatBan }}</p>
              </div>
            </div>
          </div>

          <span
            class="px-6 cursor-pointer text-red-500 ml-10"
            @click="handleDeleteSelectedFavorite(index)"
          >
            <i class="pi pi-trash"></i>
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <Button type="button" label="Hủy" severity="secondary" @click="visible = false"></Button>
          <Button type="button" label="Xác nhận" @click="handleBorrowBooks"></Button>
        </div>
      </div>
    </Dialog>
  </section>
</template>
