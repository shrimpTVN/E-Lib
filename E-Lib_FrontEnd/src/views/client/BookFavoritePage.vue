<script setup>
import { ref, onMounted } from 'vue'
import { useAppToast } from '@/utils/useToast.js'

import api from '@/api/axios'
import IsLoading from '@/components/IsLoading.vue'
import { useAuthStore } from '@/stores/auth.store'

const { addToast } = useAppToast()
const authStore = useAuthStore()
const favoriteList = ref([])
const isLoading = ref(true)

const handleIncreaseQuantity = async (favorite, index) => {
  try {
    const res = await api.patch('/favorites', {
      idDocGia: authStore.user.id,
      idSach: favorite.idSach._id,
      soLuong: favorite.soLuong + 1,
    })
    if (res.status === 200) {
      favoriteList.value[index].soLuong += 1
    }
  } catch (err) {
    console.log('Error while increasing quantity', err)
    addToast('error', 'Lỗi', 'Có lỗi xảy ra khi tăng số lượng')
  }
}

const handleDecreaseQuantity = async (favorite, index) => {
  try {
    if (favoriteList.value[index].soLuong > 1) {
      const res = await api.patch('/favorites', {
        idDocGia: authStore.user.id,
        idSach: favorite.idSach._id,
        soLuong: favorite.soLuong - 1,
      })
      if (res.status === 200) {
        favoriteList.value[index].soLuong -= 1
      }
    } else {
      handleDeleteFavorite(favorite, index)
    }
  } catch (err) {
    console.log('Error while decreasing quantity', err)
    addToast('error', 'Lỗi', 'Có lỗi xảy ra khi giảm số lượng')
  }
}

const handleDeleteFavorite = async (favorite, index) => {
  try {
    const res = await api.delete('/favorites', {
      data: {
        idDocGia: authStore.user.id,
        idSach: favorite.idSach._id,
      },
    })
    if (res.status === 200) {
      favoriteList.value.splice(index, 1)
    }
  } catch (err) {
    console.log('Error while deleting favorite', err)
    addToast('error', 'Lỗi', 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích')
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
          <div class="flex items-center">
            <div class="mt-1 px-4 inline-block">
              <input
                type="checkbox"
                class="h-[1.4rem] w-[1.4rem] rounded-md text-center bg-orange-500"
              />
            </div>

            <span class="ml-2 text-center">Chọn tất cả</span>
          </div>

          <div>
            <span class="px-12 inline-block">Số lượng</span>
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
              />
            </div>

            <div class="book-image w-28 h-28 bg-gray-200 rounded-md">
              <img :src="favorite.idSach.biaSach" alt="Bia Sach" />
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

          <!-- quantity and delete -->
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
          </div>
        </div>
      </div>

      <!-- borrow sidebar -->
      <div class="book-favorite__sidebar border border-gray-300 rounded-lg p-4 md:ml-4 bg-white">
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
          Tổng số sách: <span class="font-semibold">{{ favoriteList.length }}</span>
        </p>
        <p class="font-bold text-gray-700 mb-4">
          Tổng số lượng: <span class="font-semibold">{{ favoriteList.length }}</span>
        </p>
        <button
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-bold"
        >
          Mượn sách
        </button>
      </div>
    </div>
  </section>
</template>
