<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios.js'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const user = ref(props.user)
const history = ref([])

const loadHistory = async () => {
  try {
    const response = await api.get(`/readers/${user.value._id}/history`)
    history.value = response.data
    history.value = normalizeHistoryData()
    console.log('Loaded user history:', history.value)
  } catch (error) {
    console.error('Error loading user history:', error)
  }
}

const normalizeHistoryData = () => {
  return history.value.map((item) => {
    item.ngayTao = new Date(item.ngayTao).toLocaleDateString('en-VN')
    if (item.type === 'point') {
      item.title = (item.number > 0 ? 'Cộng' : 'Trừ') + ' điểm tích lũy'
      item.quantity = item.number + ' điểm'
      item.bgColor = 'bg-gray-50'
    } else if (item.type === 'money') {
      item.title = (item.number > 0 ? 'Cộng' : 'Trừ') + ' tiền '
      item.quantity = item.number + ' VND'
      item.bgColor = 'bg-yellow-50'
    } else {
      item.title = (item.number > 0 ? 'Giảm' : 'Tăng') + ' ngày phạt'
      item.quantity = item.number + ' ngày'
      item.bgColor = 'bg-blue-50'
    }
    return item
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <section>
    <div class="infor-container bg-white border border-gray-300 ml-4 p-6 rounded-lg">
      <div class="user-infor mb-6">
        <h2 class="text-2xl font-medium text-gray-800">Lịch sử thưởng phạt</h2>
      </div>

      <div
        v-for="item in history"
        :key="item._id"
        :class="`rounded border-[1px] border-gray-500 mb-2 px-4 py-2 ${item.bgColor}`"
      >
        <h3 class="text-lg font-bold pb-1 border-b border-gray-300">{{ item.title }}</h3>
        <p>Giá trị: {{ item.quantity }}</p>
        <p>Lý do: {{ item.lyDo }}</p>
        <p>Ngày: {{ item.ngayTao }}</p>
      </div>
    </div>
  </section>
</template>
