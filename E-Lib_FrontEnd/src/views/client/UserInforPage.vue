<script setup>
import UserInforSideBar from '@/components/user-infor/UserInforSideBar.vue'
import UserInfor from '@/components/user-infor/UserInfor.vue'
import UserAccount from '@/components/user-infor/UserAccount.vue'
import UserHistory from '@/components/user-infor/UserHistory.vue'
import IsLoading from '@/components/IsLoading.vue'
import { onMounted, ref } from 'vue'
import api from '@/api/axios.js'
import { useAuthStore } from '@/stores/auth.store'

const tagName = ref('user-infor')
const authStore = useAuthStore()
const user = ref(null)

// 1. Create a loading state
const isLoading = ref(true)

const loadUser = async () => {
  try {
    const response = await api.get(`/readers/${authStore.user.id}`)
    user.value = response.data
  } catch (error) {
    console.error('Error loading user data:', error)
  } finally {
    // 2. Set loading to false whether the request succeeds or fails
    isLoading.value = false
  }
}

// 3. Trigger the API call right after the component mounts
onMounted(() => {
  loadUser()
})

const handleChangeTag = (tag) => {
  tagName.value = tag
  console.log(tagName.value)
}
</script>

<template>
  <IsLoading v-if="isLoading" />

  <section
    v-else-if="user"
    class="user-infor-container grid grid-cols-[25%_75%] max-w-7xl mx-auto mt-4 mb-12"
  >
    <UserInforSideBar :user="user" @handleChangeTag="handleChangeTag"></UserInforSideBar>

    <UserHistory :user="user" v-if="tagName == 'user-history'"></UserHistory>
    <UserAccount :user="user" v-else-if="tagName == 'user-account'"></UserAccount>
    <UserInfor :user="user" v-else></UserInfor>
  </section>

  <div v-else class="text-center py-10 text-red-500">Failed to load user profile.</div>
</template>
