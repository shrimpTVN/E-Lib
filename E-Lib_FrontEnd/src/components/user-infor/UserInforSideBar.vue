<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
const emit = defineEmits(['handleChangeTag'])
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const handleChangeTag = (tagName) => {
  // console.log(tagName)
  emit('handleChangeTag', tagName)
}
</script>

<template>
  <section>
    <div
      class="user-infor-sidebar border bg-white border-gray-300 pb-4 rounded-lg h-screen relative"
    >
      <div class="avartar-container *:text-center">
        <!-- user avatar -->
        <div
          class="p-4 mb-4 bg-sky-200 rounded-tl-lg rounded-tr-lg w-36 h-40 rounded-xl mx-auto mt-4"
        ></div>
        <h3 class="font-bold text-gray-700 text-xl">
          {{ props.user.hoLot + ' ' + props.user.ten }}
        </h3>
        <p class="text-gray-500 text-base">Điểm tích lũy: {{ props.user.diemTichLuy }}</p>
        <p class="text-gray-500 text-base">Số tiền phạt: {{ props.user.tienPhat }}</p>
        <p class="text-gray-500 text-base">Số ngày phạt: 0</p>
        <div class="w-[80%] mx-auto bg-gray-400 h-[1px] mt-10"></div>
      </div>

      <div class="infor-list-container mt-6">
        <ul class="mx-4 px-2 text-gray-600 font-bold *:p-2 *:rounded-lg">
          <li class="hover:bg-sky-50 cursor-pointer" @click="handleChangeTag('user-infor')">
            Hố sơ cá nhân
          </li>
          <li class="hover:bg-sky-50 cursor-pointer" @click="handleChangeTag('user-account')">
            Tài khoản
          </li>
          <li class="hover:bg-sky-50 cursor-pointer" @click="handleChangeTag('user-history')">
            Lịch sử mượn sách
          </li>
          <li class="hover:bg-sky-50 cursor-pointer" @click="handleChangeTag('user-history')">
            Ghi nhận thưởng phạt
          </li>
        </ul>
      </div>

      <button
        class="text-gray-600 font-bold absolute bottom-[1rem] hover:bg-sky-50 right-[26%] px-8 py-2 mt-auto hover:text-gray-800 border border-gray-300 rounded-lg flex items-center justify-center gap-2"
        @click="handleLogout"
      >
        <i class="pi pi-sign-out"> </i> Đăng xuất
      </button>
    </div>
  </section>
</template>
