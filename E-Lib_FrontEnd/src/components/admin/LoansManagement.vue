<script setup>
import { computed, ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'

import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth.store'
import { useAppToast } from '@/utils/useAppToast'

const authStore = useAuthStore()
const { addToast } = useAppToast()
const query = ref('')
const selectedStatus = ref()
const loading = ref(false)
const loans = ref([])
const statusSeverity = {
  'Đã hủy nhận': 'secondary',
  'Bị từ chối': 'secondary',
  'Chờ duyệt': 'info',
  'Chờ nhận': 'warning',
  'Đang mượn': 'success',
  'Đã trả': 'secondary',
  'Quá hạn': 'danger',
  'Thất lạc': 'contrast',
}

const arrStatus = [
  'Chờ duyệt',
  'Đã hủy nhận',
  'Bị từ chối',
  'Chờ nhận',
  'Đang mượn',
  'Đã trả',
  'Quá hạn',
  'Thất lạc',
]

// enum: ["Duyệt", "Hủy nhận", "Từ chối", "Đã nhận", "Đã trả", "Thất lạc"]
const operation = {
  'Chờ duyệt': ['Từ chối', 'Duyệt'],
  'Chờ nhận': ['Hủy nhận', 'Đã nhận'],
  'Đang mượn': ['Thất lạc', 'Đã trả'],
}

const filteredRows = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  let filtered = loans.value

  if (keyword) {
    filtered = filtered.filter((loan) =>
      [loan.idSach.tenSach, loan.idDocGia.hoLot, loan.idDocGia.ten]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((row) => row.trangThaiHienTai === selectedStatus.value)
  }

  return filtered
})

const normalizeLoanData = (loans) => {
  console.log(loans)
  return loans.map((loan) => {
    const cntStatus = loan.TRANG_THAI.length

    const ngayCapNhat = cntStatus > 0 ? loan.TRANG_THAI[cntStatus - 1].ngayTao : loan.ngayMuon
    loan.ngayCapNhat = new Date(ngayCapNhat).toLocaleDateString('vi-VN')
    return loan
  })
}

const handleAddStatus = async (newStatus, selectedLoan) => {
  console.log('Updating status to:', newStatus, 'for loan:', selectedLoan._id)
  try {
    const res = await api.patch('/borrow/update-status', {
      idLoan: selectedLoan._id,
      newStatus,
      idNhanVien: authStore.user.id,
      idSach: selectedLoan.idSach._id,
      idDocGia: selectedLoan.idDocGia._id,
    })

    addToast('success', 'Thành công', `Trạng thái đã được cập nhật thành "${newStatus}".`)
    await loadLoans()
  } catch (error) {
    console.error('Error updating status:', error)
    addToast('error', 'Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái.')
  }
}

const loadLoans = async () => {
  try {
    loading.value = true
    const res = await api.get('/borrow')
    // console.log('API response:', res.data)
    loans.value = res.data.loans
    loans.value = normalizeLoanData(loans.value)
    // console.log('Loaded loans:', loans.value)
  } catch (error) {
    addToast('error', 'Lỗi', 'Không thể tải danh sách mượn sách.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLoans()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2 justify-end px-2">
      <span class="p-input-icon-left w-full sm:w-80">
        <InputText
          v-model="query"
          class="h-10 w-full"
          placeholder="Tìm theo tên độc giả, tên sách"
        />
      </span>
      <Select
        v-model="selectedStatus"
        :options="arrStatus"
        placeholder="Lọc theo trạng thái"
        showClear
        class="w-[16rem]"
      ></Select>
    </div>
    <DataTable
      :value="filteredRows"
      dataKey="_id"
      paginator
      :rows="12"
      :rowsPerPageOptions="[12, 24, 36]"
      stripedRows
      removableSort
      :loading="loading"
      class="overflow-hidden rounded-lg border border-slate-200"
      tableClass="text-sm"
      :rowHover="true"
    >
      <Column header="Tên độc giả" sortable class="w-[12rem]">
        <template #body="slotProps">
          {{ slotProps.data.idDocGia.hoLot }} {{ slotProps.data.idDocGia.ten }}
        </template>
      </Column>
      <Column field="idSach.tenSach" header="Tên sách" sortable />
      <Column field="trangThaiHienTai" header="Trạng thái" sortable class="w-[10rem]">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.trangThaiHienTai"
            :severity="statusSeverity[slotProps.data.trangThaiHienTai]"
          />
        </template>
      </Column>
      <Column field="ngayCapNhat" header="Ngày cập nhật" sortable class="w-[10rem]" />

      <Column header="Hành động" class="max-w-[6rem] text-center">
        <template #body="slotProps">
          <div v-if="operation[slotProps.data.trangThaiHienTai]" class="flex gap-1">
            <Button
              severity="danger"
              rounded
              @click="
                handleAddStatus(operation[slotProps.data.trangThaiHienTai]?.[0], slotProps.data)
              "
              >{{ operation[slotProps.data.trangThaiHienTai]?.[0] }}</Button
            >
            <Button
              severity="success"
              rounded
              @click="
                handleAddStatus(operation[slotProps.data.trangThaiHienTai]?.[1], slotProps.data)
              "
              >{{ operation[slotProps.data.trangThaiHienTai]?.[1] }}</Button
            >
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="py-6 text-center text-sm text-slate-500">Không tìm thấy dữ liệu phù hợp.</div>
      </template>
    </DataTable>
  </div>
</template>
