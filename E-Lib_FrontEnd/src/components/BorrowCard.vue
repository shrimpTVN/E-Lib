<script setup>
import { computed, ref, onMounted, defineEmits } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const emit = defineEmits(['delete-loan', 'extend-loan'])

const props = defineProps({
  loan: {
    type: Object,
    required: true,
  },
})

const loan = ref(props.loan)
console.log('Received loan data:', loan.value)
const messageType = ref('info')

const normalizeLoanData = () => {
  loan.value.soNgayMuon = 14 + (loan.value.isGiaHan ? 7 : 0)
  loan.value.ngayMuon = new Date(loan.value.ngayMuon).toLocaleDateString('en-VN')

  if (loan.value.ngayTra) {
    loan.value.ngayTra = new Date(loan.value.ngayTra).toLocaleDateString('en-VN')
  }

  if (loan.value.TRANG_THAI.length > 0) {
    loan.value.TRANG_THAI = loan.value.TRANG_THAI.map((status) => ({
      ...status,
      ngayTao: new Date(status.ngayTao).toLocaleDateString('en-VN'),
    }))

    const ngayNhan = loan.value.TRANG_THAI.find(
      (status) => status.tenTrangThai === 'Đã nhận',
    )?.ngayTao

    if (ngayNhan) {
      loan.value.ngayNhan = ngayNhan
      loan.value.hanTra = new Date(
        new Date(ngayNhan).getTime() + loan.value.soNgayMuon * 24 * 60 * 60 * 1000,
      ).toLocaleDateString('en-VN')

      if (!loan.value.isReturned) {
        loan.value.soNgayConLai = Math.ceil(
          (new Date(loan.value.hanTra) - new Date()) / (24 * 60 * 60 * 1000),
        )
      }
    }
  }

  //   const arrStatus = ['Chờ duyệt','Đã hủy nhận','Bị từ chối','Chờ nhận','Đang mượn','Đã trả','Quá hạn','Thất lạc', ]
  switch (loan.value.trangThaiHienTai) {
    case 'Chờ duyệt':
      messageType.value = 'secondary'
      break
    case 'Đã hủy nhận':
      messageType.value = 'contrast'
      break
    case 'Bị từ chối':
      messageType.value = 'secondary'
      break
    case 'Chờ nhận':
      messageType.value = 'warn'
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

const bgType = () => {
  if (!loan.value.soNgayConLai) return ''

  if (loan.value.soNgayConLai > 3 && loan.value.soNgayConLai <= 7) {
    return 'bg-yellow-100'
  } else if (loan.value.soNgayConLai <= 3 && loan.value.soNgayConLai > 0) {
    return 'bg-orange-100'
  } else if (loan.value.soNgayConLai <= 0) {
    return 'bg-red-100'
  } else {
    return 'bg-green-100'
  }
}

const handleClick = () => {
  // Xử lý khi người dùng click vào thẻ mượn sách
  // Ví dụ: Điều hướng đến trang chi tiết của sách hoặc hiển thị thông tin chi tiết
  console.log('Clicked on loan:', loan.value)
}

const handleDeleteLoan = () => {
  // Phát ra sự kiện xóa lịch sử mượn sách
  emit('delete-loan', loan.value._id)
}

const handleExtendLoan = () => {
  // Phát ra sự kiện gia hạn mượn sách
  emit('extend-loan', loan.value._id)
}
</script>

<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md min-h-[13.2rem]"
    :class="
      loan.trangThaiHienTai === 'Bị từ chối' || loan.trangThaiHienTai === 'Đã hủy nhận'
        ? 'bg-gray-100'
        : ''
    "
    @click="handleClick"
  >
    <div class="flex gap-3">
      <div class="h-full w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 my-auto">
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

        <div class="loan-info-container flex-col justify-between">
          <div class="loan-info">
            <div class="mt-1 flex gap-2 text-sm">
              <div class="mr-4">
                <p class="text-sm font-semibold text-slate-700">Ngày nhận</p>
                <p class="font-semibold text-slate-500">
                  {{ loan.ngayNhan ? loan.ngayNhan : 'Chưa nhận' }}
                </p>
              </div>
              <div v-if="loan.ngayTra">
                <p class="text-sm font-semibold text-slate-700">Ngày trả</p>
                <p class="font-semibold text-slate-500">{{ loan.ngayTra }}</p>
              </div>
            </div>

            <p class="mt-2 text-sm font-semibold text-slate-700">
              Số ngày mượn:
              {{ loan.soNgayMuon }}
            </p>
          </div>

          <div class="status-container">
            <div v-if="loan.trangThaiHienTai === 'Đang mượn'" class="date-container mt-2">
              <span
                class="mt-2 text-sm font-semibold text-slate-700 rounded-lg py-1 px-2"
                :class="bgType()"
              >
                {{ loan.isReturned ? '' : `Hạn trả: ${loan.hanTra}` }}
              </span>
            </div>
            <div class="flex justify-between items-center mt-4">
              <Tag :severity="messageType" class="w-max">
                <span class="text-center w-full font-bold text-sm">{{
                  loan.trangThaiHienTai
                }}</span></Tag
              >

              <button
                v-if="loan.trangThaiHienTai === 'Chờ duyệt'"
                class="text-red-500 hover:font-bold px-3 py-2 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100"
                @click.stop="handleDeleteLoan"
              >
                Xóa yêu cầu
              </button>

              <Tag
                v-if="
                  loan.trangThaiHienTai === 'Đang mượn' &&
                  !loan.isReturned &&
                  loan.isGiaHan === false
                "
                class="cursor-pointer hover:font-bold px-3 py-2 text-sm font-semibold rounded-lg transition duration-200 hover:bg-green-200"
                @click.stop="handleExtendLoan"
              >
                Gia hạn
              </Tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
