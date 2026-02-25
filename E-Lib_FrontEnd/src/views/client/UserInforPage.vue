<script setup>
import UserInforSideBar from '@/components/user-infor/UserInforSideBar.vue'
import UserInfor from '@/components/user-infor/UserInfor.vue'
import UserAccount from '@/components/user-infor/UserAccount.vue'
import UserHistory from '@/components/user-infor/UserHistory.vue'
import { ref } from 'vue'

const tagName = ref('user-infor')

const handleChangeTag = (tag) => {
  tagName.value = tag
  console.log(tagName.value)
}
</script>

<template>
  <section class="user-infor-container grid grid-cols-[25%_75%] max-w-7xl mx-auto">
    <UserInforSideBar @handleChangeTag="handleChangeTag"></UserInforSideBar>
    <UserHistory v-if="tagName == 'user-history'"></UserHistory>
    <UserAccount v-else-if="tagName == 'user-account'"></UserAccount>
    <UserInfor v-else></UserInfor>
  </section>
</template>
