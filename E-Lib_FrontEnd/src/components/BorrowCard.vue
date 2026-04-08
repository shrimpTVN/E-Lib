<script setup>
import { computed, ref, onMounted, defineEmits } from 'vue'
// import Tag from 'primevue/tag'
import Message from 'primevue/message'

const emit = defineEmits(['delete-loan'])

const props = defineProps({
  loan: {
    type: Object,
    required: true,
  },
})

const loan = ref(props.loan)
const messageType = ref('info')

const normalizeLoanData = () => {
  loan.value.soNgayMuon = 14 + (loan.value.isGiaHan ? 7 : 0)
  loan.value.ngayMuon = new Date(loan.value.ngayMuon).toLocaleDateString('vi-VN')

  if (loan.value.TRANG_THAI.length > 0) {
    loan.value.TRANG_THAI = loan.value.TRANG_THAI.map((status) => ({
      ...status,
      ngayTao: new Date(status.ngayTao).toLocaleDateString('vi-VN'),
    }))
  }

  switch (loan.value.trangThaiHienTai) {
    case 'Chờ duyệt':
      messageType.value = 'secondary'
      break
    case 'Chờ nhận':
      messageType.value = 'warning'
      break
    case 'Đang mượn':
      messageType.value = 'info'
      break
    case 'Đã trả':
      messageType.value = 'success'
      break
    case 'Quá hạn':
      messageType.value = 'danger'
      break
    case 'Thất lạc':
      messageType.value = 'danger'
      break
    default:
      messageType.value = 'info'
  }
}

normalizeLoanData()

const handleClick = () => {
  // Xử lý khi người dùng click vào thẻ mượn sách
  // Ví dụ: Điều hướng đến trang chi tiết của sách hoặc hiển thị thông tin chi tiết
  console.log('Clicked on loan:', loan.value)
}

const handleDeleteLoan = () => {
  // Phát ra sự kiện xóa lịch sử mượn sách
  emit('delete-loan', loan.value._id)
}
</script>

<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    @click="handleClick"
  >
    <div class="flex gap-3">
      <div
        class="h-full w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 justify-self-center my-auto"
      >
        <img
          :src="loan.idSach.biaSach"
          :alt="loan.idSach.tenSach"
          class="h-36 w-full object-cover"
          loading="lazy"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col justify-between">
        <h3 class="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-slate-800">
          {{ loan.idSach.tenSach }}
        </h3>
        <div class="loan-info-container">
          <div class="mt-1 flex gap-2 text-sm">
            <div class="mr-4">
              <p class="text-sm font-semibold text-slate-700">Ngày mượn</p>
              <p class="font-semibold text-slate-500">
                {{ loan.TRANG_THAI.length > 0 ? loan.TRANG_THAI[0].ngayTao : 'Chưa duyệt' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700">Ngày trả</p>
              <p class="font-semibold text-slate-500">{{ loan.ngayTra || 'Chưa trả' }}</p>
            </div>
          </div>

          <p class="mt-2 text-sm font-semibold text-slate-700">
            Số ngày mượn:
            {{ loan.soNgayMuon }}
          </p>

          <div v-if="loan.TRANG_THAI.length > 0" class="date-container">
            <p class="mt-2 text-sm font-semibold text-slate-600">
              {{ loan.isReturned ? '' : 'Hạn trả:' }}
            </p>
            <!-- progressBar -->
          </div>

          <div class="flex justify-between items-center">
            <Message :severity="messageType" class="mt-2 w-max">
              <span class="mt-2 text-center w-full font-bold text-sm">{{
                loan.trangThaiHienTai
              }}</span></Message
            >

            <button
              class="text-red-500 hover:font-bold px-3 py-1 text-sm font-semibold"
              @click.stop="handleDeleteLoan"
            >
              Xóa yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
