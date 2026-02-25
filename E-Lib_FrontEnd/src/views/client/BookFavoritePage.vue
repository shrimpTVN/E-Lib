<script setup>
import FavoriteService from '@/services/favorite.service.js'
import { ref, onMounted } from 'vue'
import UserService from '@/services/user.serivce.js'
import IsLoading from '@/components/IsLoading.vue'

const userID = ref('1') // TODO: Replace with actual user ID from authentication
const favoriteList = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const favorites = await FavoriteService.getAll()
    const user = await UserService.get(userID.value)
    favoriteList.value = favorites.filter((favorite) => favorite.maDocGia === user.maDocGia)
  } catch (err) {
    console.log('Error while fetching data', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="">
    <h1 class="text-2xl mb-4 text-blue-600">Danh sách yêu thích</h1>

    <IsLoading v-if="isLoading" />

    <div v-else class="grid grid-cols-[70%_30%]">
      <div class="book-favorite-container">
        <div
          class="book-favorite__header flex border rounded-lg flex-d flex-row items-center justify-between mb-4 px-4 py-2 bg-white text-center"
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
            <span class="px-12">Số lượng</span>
            <span class="px-4">Xóa</span>
          </div>
        </div>

        <div
          class="favorite-list-item flex border rounded-lg flex-row items-center justify-between px-4 py-2 bg-white"
        >
          <div class="flex items-center">
            <div class="mt-1 px-4 inline-block">
              <input
                type="checkbox"
                class="h-[1.4rem] w-[1.4rem] rounded-md text-center bg-orange-500"
              />
            </div>

            <div class="book-image w-28 h-28 bg-gray-200 rounded-md"></div>

            <div class="book-infor-favorite ml-4">
              <div class="book-name-container">
                <h3 class="font-bold text-gray-800 text-lg mb-1">Thói quen nguyên tử</h3>
                <p class="text-gray-500">Tác giả: Nguyễn Văn A</p>
                <p class="text-gray-500">Năm xuất bản: 2020</p>
              </div>

              <p class="book-infor-quantity"><span>Sách hiện có: </span> 1</p>
            </div>
          </div>

          <!-- Book quanity in favorite -->
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-2 border rounded-lg px-3 text-gray-500">
              <button class="text-sm text-center leading-none">
                <i class="pi pi-minus"></i>
              </button>
              <input
                type="text"
                class="w-6 h-8 text-center font-medium text-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                value="1"
              />
              <button class="text-sm text-center leading-none"><i class="pi pi-plus"> </i></button>
            </span>
            <!-- erease -->
            <span class="px-4 cursor-pointer text-red-500 ml-10">Xóa</span>
          </div>
        </div>
      </div>

      <div class="book-favorite__sidebar border border-gray-300 rounded-lg p-4 md:ml-4 bg-white">
        <h2 class="text-xl font-bold mb-4 text-blue-600 text-center">Tổng quan</h2>
        <div class="policy-container border-b border-gray-300 mb-4 pb-4">
          <p class="text-gray-700 mb-2 font-bold">Quy định mượn sách:</p>
          <ul class="list-disc list-inside text-gray-700 mb-4 text-sm *:py-1">
            <li>Mỗi quyển sách chỉ được mượn không quá 2 tuần và cần gia hạn khi hết thời hạn.</li>
            <li>Nếu trả sách trễ sẽ bị trừ điểm thành viên và có thể phạt tiền tùy mức độ trễ</li>
            <li>
              Nếu làm hư hỏng hoặc mất sách sẽ phải bồi thường theo giá trị thực tế của sách và trừ
              điểm thành viên
            </li>
            <li>
              <a href="/" class="text-blue-500">Điều khoản và quy định mượn sách tại E-Lib </a>
            </li>
          </ul>
        </div>
        <p class="font-bold text-gray-700 mb-2">
          Tổng số sách: <span class="font-bold font-semibold">1</span>
        </p>
        <p class="font-bold text-gray-700 mb-4">
          Tổng số lượng: <span class="font-semibold">1</span>
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
