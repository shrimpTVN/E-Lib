<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
const emit = defineEmits(['handleChangeTag'])
import { useRouter } from 'vue-router'
import Image from 'primevue/image'

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
      class="user-infor-sidebar border bg-white border-gray-300 pb-4 rounded-lg min-h-[46rem] relative"
    >
      <div class="avartar-container *:text-center">
        <!-- user avatar -->
        <div
          class="p-4 mb-4 bg-gray-100 rounded-tl-lg rounded-tr-lg w-40 h-44 rounded-xl mx-auto mt-4"
        >
          <Image
            :src="
              user.avatar ||
              'https://res.cloudinary.com/depaiphq0/image/upload/v1776151633/User-avatar_dhrqba.png'
            "
            alt="Image"
          />
        </div>
        <h3 class="font-bold text-gray-700 text-xl mb-2">
          {{ props.user.hoLot + ' ' + props.user.ten }}
        </h3>
        <p class="text-slate-600 text-base">Điểm tích lũy: {{ props.user.diemTichLuy }}</p>
        <p class="text-slate-600 text-base">Số tiền phạt: {{ props.user.tienPhat }}</p>
        <p class="text-slate-600 text-base">Số ngày phạt: 0</p>
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
