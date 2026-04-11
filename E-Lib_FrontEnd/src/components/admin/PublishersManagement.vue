<script setup>
import { computed, ref, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import api from '@/api/axios'
import { useAppToast } from '@/utils/useAppToast'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const props = defineProps({
  query: {
    type: String,
    default: '',
  },
})

const isLoading = ref(false)
const { addToast } = useAppToast()
const publishers = ref([])
const selectedPublisher = ref([])
const visibleDialog = ref(false)

const validationSchema = yup.object({
  tenNXB: yup.string().required('Tên nhà xuất bản là bắt buộc'),
  diaChi: yup.string().required('Địa chỉ là bắt buộc'),
})

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema,
  initialValues: {
    tenNXB: '',
    diaChi: '',
  },
})

const { value: tenNXB, errorMessage: tenNXBError } = useField('tenNXB')
const { value: diaChi, errorMessage: diaChiError } = useField('diaChi')

const openDialog = (publisher) => {
  selectedPublisher.value = publisher

  if (publisher) {
    tenNXB.value = publisher.tenNXB
    diaChi.value = publisher.diaChi
  }

  visibleDialog.value = true
}

const closeDialog = () => {
  visibleDialog.value = false
  resetForm()
}

const handleFormSubmit = handleSubmit(async (formData) => {
  try {
    isLoading.value = true

    if (!selectedPublisher.value) {
      await api.post('/publishers', formData)
    } else {
      await api.put(`/publishers/${selectedPublisher.value._id}`, formData)
    }

    addToast('success', 'Thành công', 'Thông tin nhà xuất bản đã được lưu')
    closeDialog()
    // Refresh the list after adding/updating
    const res = await api.get('/publishers')
    publishers.value = res.data || []
  } catch (error) {
    console.error('Error saving publisher:', error)
    addToast('error', 'Lỗi', 'Không thể lưu thông tin nhà xuất bản')
  } finally {
    isLoading.value = false
  }
})

const filteredRows = computed(() => {
  const keyword = props.query.trim().toLowerCase()

  if (!keyword) return publishers.value

  return publishers.value.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)),
  )
})

onMounted(async () => {
  try {
    const res = await api.get('/publishers')

    publishers.value = res.data || []
  } catch (error) {
    console.error('Error fetching publishers:', error)
    addToast('error', 'Lỗi', 'Không thể tải danh sách nhà xuất bản')
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row justify-end items-center mb-2 px-2">
    <span class="p-input-icon-left sm:w-72">
      <!-- search bar -->
      <InputText class="h-10 w-full text-lg" placeholder="Tìm kiếm nhà xuất bản..."> </InputText>
    </span>

    <!-- create button -->
    <Button
      label="+ Thêm nhà xuất bản"
      class="h-10 border-none bg-green-600 text-lg font-semibold text-slate-800 hover:bg-green-500"
      @click="openDialog(null)"
    ></Button>
  </div>
  <DataTable
    :value="filteredRows"
    dataKey="id"
    paginator
    :rows="10"
    stripedRows
    class="overflow-hidden rounded-lg border border-slate-200"
    tableClass="text-sm"
  >
    <Column field="tenNXB" header="Tên nhà xuất bản" sortable />
    <Column field="diaChi" header="Địa chỉ" sortable />
    <Column header="Hành động" :exportable="false" style="width: 8rem">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          @click="openDialog(slotProps.data)"
        ></Button>
      </template>
    </Column>
    <template #empty>
      <div class="py-6 text-center text-sm text-slate-500">Không tìm thấy dữ liệu phù hợp.</div>
    </template>
  </DataTable>

  <Dialog
    v-model:visible="visibleDialog"
    :header="selectedPublisher ? 'Chỉnh sửa thông tin Nhà xuất bản' : 'Thêm nhà xuất bản'"
    modal
    class="w-full max-w-2xl"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleFormSubmit" class="px-4 my-4">
      <div class="flex gap-2 justify-start items-center mb-4">
        <!-- publisher name -->
        <label class="text-sm font-bold text-gray-700"
          >Tên nhà xuất bản: <span class="text-red-500">*</span></label
        >
        <InputText
          v-model="tenNXB"
          type="text"
          placeholder="Tên NXB"
          class="rounded border border-gray-300 w-full flex-1"
          :class="{ 'border-red-500': tenNXBError }"
        >
        </InputText>
        <small v-if="tenNXB" class="text-red-500">{{ tenNXBError }}</small>
      </div>
      <!-- publisheraddress -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-gray-700"
          >Địa chỉ: <span class="text-red-500">*</span></label
        >
        <InputText
          v-model="diaChi"
          type="text"
          placeholder="Địa chỉ"
          class="rounded border border-gray-300 w-full flex-1"
          :class="{ 'border-red-500': diaChiError }"
        >
        </InputText>
        <small v-if="diaChi" class="text-red-500">{{ diaChiError }}</small>
      </div>
      <!-- Buttons -->
      <div class="col-span-2 flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Hủy"
          severity="secondary"
          @click="closeDialog()"
          :disabled="isLoading"
        ></Button>
        <Button
          type="submit"
          :label="selectedPublisher ? 'Lưu thông tin' : 'Thêm nhà xuất bản'"
          :loading="isLoading"
          :disabled="isLoading"
        ></Button>
      </div>
    </form>
  </Dialog>
</template>
