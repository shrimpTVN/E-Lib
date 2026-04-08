<script setup>
import { ref, onMounted } from 'vue'
import BorrowCard from '@/components/BorrowCard.vue'
import api from '@/api/axios.js'
// import { useAuthStore } from '@/stores/auth.js'
import { useAppToast } from '@/utils/useAppToast.js'
const { addToast } = useAppToast()
const borrowList = ref([])

const fetchBorrowHistory = async () => {
  try {
    const response = await api.get('/borrow')
    borrowList.value = response.data.loans
  } catch (error) {
    console.error('Error fetching borrow history:', error)
    addToast(
      'error',
      'Lỗi',
      error.response?.data?.message || ' Lỗi xảy ra khi tải lịch sử mượn sách.Vui lòng thử lại sau',
    )
  }
}

const handleDeleteLoan = async (loanId) => {
  try {
    const res = await api.delete(`/borrow/${loanId}`)
    if (res.status === 200) {
      borrowList.value = borrowList.value.filter(
        (loan) => loan._id !== loanId && loan.id !== loanId,
      )
      addToast('success', 'Thành công', 'Lịch sử mượn sách đã được xóa thành công')
    }
  } catch (error) {
    console.error('Error deleting loan:', error)
    addToast(
      'error',
      'Lỗi',
      error.response?.data?.message || ' Lỗi xảy ra khi xóa lịch sử mượn sách.Vui lòng thử lại sau',
    )
  }
}

onMounted(() => {
  fetchBorrowHistory()
})
</script>

<template>
  <section class="mx-auto min-h-screen max-w-[1500px] px-4 py-8 sm:px-6">
    <div class="title-container mb-8">
      <h1 class="mb-1 text-center text-3xl text-blue-800 font-bold">Lịch sử mượn sách</h1>
      <span class="block h-[2px] w-[128px] bg-blue-700 mx-auto"></span>
    </div>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <BorrowCard
        v-for="borrow in borrowList"
        :key="borrow._id || borrow.id"
        :loan="borrow"
        @delete-loan="handleDeleteLoan"
      />
    </div>
  </section>
</template>
