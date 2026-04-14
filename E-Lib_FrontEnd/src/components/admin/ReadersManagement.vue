<script setup>
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import { ref, onMounted, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import api from '@/api/axios.js'
import { useAppToast } from '@/utils/useAppToast'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { useAuthStore } from '@/stores/auth.store.js'

const authStore = useAuthStore()
const visibleDialog = ref(false)
const visiblePasswordDialog = ref(false)
const { addToast } = useAppToast()
const isLoading = ref(false)
const loading = ref(false)
const selectedReader = ref(null)
const password = ref('')
const query = ref('')
const readers = ref([])

// Validation schema
const validationInfoSchema = yup.object().shape({
  hoLot: yup.string().required('Họ là bắt buộc').min(1, 'Họ không được để trống'),
  ten: yup.string().required('Tên là bắt buộc').min(1, 'Tên không được để trống'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  dienThoai: yup.string().required('Điện thoại là bắt buộc'),
  ngaySinh: yup.string().required('Ngày sinh là bắt buộc'),
  diaChi: yup.string().required('Địa chỉ là bắt buộc').min(1, 'Địa chỉ không được để trống'),
})

const validationRecordSchema = yup.object().shape({
  type: yup
    .string()
    .required('Loại ghi nhận là bắt buộc')
    .oneOf(['point', 'day', 'money'], 'Loại ghi nhận không hợp lệ'),
  number: yup
    .number()
    .required('Số điểm/tiền/ngày là bắt buộc')
    .notOneOf([0], 'Giá trị phải khác 0'),
  lyDo: yup.string().required('Lý do là bắt buộc').min(5, 'Lý do phải có ít nhất 5 ký tự'),
})

const {
  handleSubmit: handleInfoSubmit,
  resetForm: resetFormInfo,
  values,
  errors,
} = useForm({
  validationSchema: validationInfoSchema,
  initialValues: {
    hoLot: '',
    ten: '',
    email: '',
    dienThoai: '',
    ngaySinh: '',
    diaChi: '',
  },
})

// Form infor fields
const { value: hoLot, errorMessage: hoLotError } = useField('hoLot')
const { value: ten, errorMessage: tenError } = useField('ten')
const { value: email, errorMessage: emailError } = useField('email')
const { value: dienThoai, errorMessage: dienThoaiError } = useField('dienThoai')
const { value: ngaySinh, errorMessage: ngaySinhError } = useField('ngaySinh')
const { value: diaChi, errorMessage: diaChiError } = useField('diaChi')

const {
  handleSubmit: handleRecordSubmit,
  resetForm: resetFormRecord,
  values: recordValues,
  errors: recordErrors,
} = useForm({
  validationSchema: validationRecordSchema,
  initialValues: {
    type: 'point',
    number: '0',
    lyDo: '',
  },
})

// Form record fields
const { value: recordType, errorMessage: recordTypeError } = useField('type')
const { value: recordNumber, errorMessage: recordNumberError } = useField('number')
const { value: recordLyDo, errorMessage: recordLyDoError } = useField('lyDo')

const openDialog = (reader, dialog) => {
  selectedReader.value = reader
  if (dialog == 'password') {
    visiblePasswordDialog.value = true
    password.value = ''
  } else {
    visibleDialog.value = true
    if (reader) {
      hoLot.value = reader.hoLot
      ten.value = reader.ten
      email.value = reader.email
      dienThoai.value = reader.dienThoai
      ngaySinh.value = new Date(reader.ngaySinh).toLocaleDateString('en-CA') // Format to YYYY-MM-DD for input type="date"
      diaChi.value = reader.diaChi
    }
  }
}

const handleFormInfoSubmit = handleInfoSubmit(async (formData) => {
  isLoading.value = true
  try {
    if (!selectedReader.value) {
      const updateData = {
        hoLot: formData.hoLot,
        ten: formData.ten,
        email: formData.email,
        dienThoai: formData.dienThoai,
        ngaySinh: new Date(formData.ngaySinh).toISOString(),
        diaChi: formData.diaChi,
      }
      await api.patch(`/readers/${selectedReader.value._id}`, updateData)
      addToast('success', 'Thành công', 'Cập nhật thông tin độc giả thành công')
    } else {
      const res = await api.post('/readers', formData)
      addToast('success', 'Thành công', 'Thêm độc giả thành công')
    }

    visibleDialog.value = false
    resetFormInfo()
    await loadUsers()
  } catch (error) {
    console.error('Error updating reader:', error)
    addToast('error', 'Lỗi', 'Không thể cập nhật thông tin độc giả')
  } finally {
    isLoading.value = false
  }
})

const handleFormRecordSubmit = handleRecordSubmit(async (formData) => {
  const historyData = {
    type: formData.type,
    number: formData.number,
    lyDo: formData.lyDo,
  }

  console.log('Submitting history record:', historyData)
  if (historyData.type === 'day' && historyData.number < 0) {
    addToast('error', 'Lỗi', 'Số ngày phạt phải là số dương')
    return
  }

  try {
    const res = await api.post(`/readers/${selectedReader.value._id}/history`, historyData)
    addToast('success', 'Thành công', 'Thêm ghi nhận cho độc giả thành công')
    await loadUsers() // Reload users to update points/penalties
  } catch (error) {
    console.error('Error adding history record:', error)
    addToast('error', 'Lỗi', 'Không thể thêm ghi nhận cho độc giả')
  } finally {
    // resetFormRecord()
  }
})

const closeDialog = (dialog) => {
  if (dialog == 'password') {
    visiblePasswordDialog.value = false
  } else {
    visibleDialog.value = false
    resetFormInfo()
    resetFormRecord()
    selectedReader.value = null
  }
}

const handleBlockReader = async (reader) => {
  try {
    const res = await api.patch(`/readers/${reader._id}/block`, {
      isActive: false,
      staff: {
        _id: authStore.user.id,
        password: password.value,
      },
    })
    addToast('success', 'Thành công', 'Độc giả đã bị cấm thành công')
    await loadUsers()
    visiblePasswordDialog.value = false
  } catch (error) {
    console.error('Error blocking reader:', error)
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể cấm độc giả')
  }
}

const handleUnblockReader = async (reader) => {
  console.log('Unblocking reader:', reader)
  try {
    const res = await api.patch(`/readers/${reader._id}/block`, {
      isActive: true,
      staff: {
        _id: authStore.user.id,
        password: password.value,
      },
    })
    addToast('success', 'Thành công', 'Độc giả đã được bỏ cấm thành công')
    await loadUsers()
    visiblePasswordDialog.value = false
  } catch (error) {
    console.error('Error unblocking reader:', error)
    addToast('error', 'Lỗi', 'Không thể bỏ cấm độc giả')
  }
}

const filteredRows = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  if (!keyword) return readers.value

  return readers.value.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)),
  )
})

const loadUsers = async () => {
  try {
    const response = await api.get('/readers')
    readers.value = response.data.readers
  } catch (error) {
    console.error('Error loading readers:', error)
    addToast('error', 'Đã xảy ra lỗi', 'Không thể tải danh sách độc giả.')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row justify-end items-center mb-2 px-2">
    <span class="p-input-icon-left sm:w-72">
      <!-- search bar -->
      <InputText v-model="query" class="h-10 w-full text-lg" placeholder="Tìm kiếm độc giả...">
        ></InputText
      >
    </span>

    <!-- create button -->
    <Button
      label="+ Thêm độc giả"
      class="h-10 border-none bg-green-600 text-lg font-semibold text-slate-800 hover:bg-green-500"
      @click="openDialog(null, 'info')"
    ></Button>
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
    <Column field="hoTen" header="Họ và tên" sortable>
      <template #body="slotProps"> {{ slotProps.data.hoLot }} {{ slotProps.data.ten }} </template>
    </Column>
    <Column field="email" header="Email" sortable />
    <Column field="dienThoai" header="Điện thoại" />
    <Column field="diemTichLuy" header="Điểm tích lũy" sortable />
    <Column field="tienPhat" header="Tiền phạt" sortable />
    <Column header="Hành động" :exportable="false" style="width: 8rem">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          @click="openDialog(slotProps.data)"
        ></Button>
        <Button
          v-if="slotProps.data.isActive == true"
          icon="pi pi-ban"
          severity="secondary"
          text
          rounded
          @click="openDialog(slotProps.data, 'password')"
        ></Button>

        <Button
          v-else
          icon="pi pi-lock-open"
          severity="secondary"
          text
          rounded
          @click="openDialog(slotProps.data, 'password')"
        ></Button>
      </template>
    </Column>
    <template #empty>
      <div class="py-6 text-center text-sm text-slate-500">Không tìm thấy dữ liệu phù hợp.</div>
    </template>
  </DataTable>

  <!-- Infor dialog -->
  <Dialog
    v-model:visible="visibleDialog"
    :header="selectedReader ? 'Chỉnh sửa thông tin độc giả' : 'Thêm độc giả'"
    modal
    class="w-full max-w-2xl"
    @hide="closeDialog('info')"
  >
    <Tabs value="0">
      <TabList>
        <Tab value="0">Thông tin</Tab>
        <Tab v-if="selectedReader" value="1">Ghi nhận</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <form @submit.prevent="handleFormInfoSubmit" class="grid grid-cols-2 gap-4">
            <!-- Họ -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Họ <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="hoLot"
                type="text"
                placeholder="Nhập họ"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': hoLotError }"
              />
              <small class="text-red-500" v-if="hoLotError">{{ hoLotError }}</small>
            </div>

            <!-- Tên -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Tên <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="ten"
                type="text"
                placeholder="Nhập tên"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': tenError }"
              />
              <small class="text-red-500" v-if="tenError">{{ tenError }}</small>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2 col-span-2">
              <label class="text-sm font-bold text-gray-700"
                >Email <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="email"
                type="email"
                placeholder="Nhập email"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': emailError }"
              />
              <small class="text-red-500" v-if="emailError">{{ emailError }}</small>
            </div>

            <!-- Điện thoại -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Điện thoại <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="dienThoai"
                type="tel"
                placeholder="Nhập số điện thoại"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': dienThoaiError }"
              />
              <small class="text-red-500" v-if="dienThoaiError">{{ dienThoaiError }}</small>
            </div>

            <!-- Ngày sinh -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Ngày sinh <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="ngaySinh"
                type="date"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': ngaySinhError }"
              />
              <small class="text-red-500" v-if="ngaySinhError">{{ ngaySinhError }}</small>
            </div>

            <!-- Địa chỉ -->
            <div class="flex flex-col gap-2 col-span-2">
              <label class="text-sm font-bold text-gray-700"
                >Địa chỉ <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="diaChi"
                type="text"
                placeholder="Nhập địa chỉ"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': diaChiError }"
              />
              <small class="text-red-500" v-if="diaChiError">{{ diaChiError }}</small>
            </div>

            <!-- Điểm - Tiền phạt - Ngày phạt -->
            <div
              v-if="selectedReader"
              class="point-container flex justify-start border-t pt-4 w-full col-span-2"
            >
              <span class="px-4"
                ><span class="font-bold">Điểm tích lũy:</span>
                {{ selectedReader.diemTichLuy || 0 }}</span
              >
              <span class="px-4"
                ><span class="font-bold">Tiền phạt:</span> {{ selectedReader.tienPhat || 0 }}</span
              >
              <span
                ><span class="font-bold">Số ngày phạt:</span>
                {{ selectedReader.ngayPhat || 0 }}</span
              >
            </div>
            <!-- Buttons -->
            <div class="col-span-2 flex justify-end gap-2 pt-4">
              <Button
                type="button"
                label="Hủy"
                severity="secondary"
                @click="closeDialog('info')"
                :disabled="isLoading"
              ></Button>
              <Button
                type="submit"
                :label="selectedReader ? 'Lưu thông tin' : 'Thêm độc giả'"
                :loading="isLoading"
                :disabled="isLoading"
              ></Button>
            </div>
          </form>
        </TabPanel>
        <TabPanel v-if="selectedReader" value="1">
          <form @submit.prevent="handleFormRecordSubmit" class="grid grid-cols-2 gap-4">
            <!-- Loại ghi nhận -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Loại ghi nhận <span class="text-red-500">*</span></label
              >
              <select
                v-model="recordType"
                class="rounded border border-gray-300 p-2"
                :class="{ 'border-red-500': recordTypeError }"
              >
                <option value="point">Điểm tích lũy</option>
                <option value="money">Tiền phạt</option>
                <option value="day">Ngày phạt</option>
              </select>
              <small class="text-red-500" v-if="recordTypeError">{{ recordTypeError }}</small>
            </div>

            <!-- Số điểm/tiền/ngày -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-700"
                >Số điểm/tiền/ngày <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="recordNumber"
                type="number"
                placeholder="Nhập số điểm/tiền/ngày"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': recordNumberError }"
              />
              <small class="text-red-500" v-if="recordNumberError">{{ recordNumberError }}</small>
            </div>

            <!-- Lý do -->
            <div class="flex flex-col gap-2 col-span-2">
              <label class="text-sm font-bold text-gray-700"
                >Lý do <span class="text-red-500">*</span></label
              >
              <InputText
                v-model="recordLyDo"
                type="text"
                placeholder="Nhập lý do ghi nhận"
                class="rounded border border-gray-300"
                :class="{ 'border-red-500': recordLyDoError }"
              />
              <small class="text-red-500" v-if="recordLyDoError">{{ recordLyDoError }}</small>
            </div>
            <!-- Buttons -->
            <div class="col-span-2 flex justify-end gap-2 pt-4">
              <Button
                type="button"
                label="Hủy"
                severity="secondary"
                @click="closeDialog('info')"
                :disabled="isLoading"
              ></Button>
              <Button
                type="submit"
                label="Lưu thông tin"
                :loading="isLoading"
                :disabled="isLoading"
              ></Button>
            </div>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>

  <!-- Password Dialog -->
  <Dialog
    v-model:visible="visiblePasswordDialog"
    header="Xác thực mật khẩu"
    modal
    class="w-full max-w-2xl"
    @hide="closeDialog('password')"
  >
    <div class="flex flex-col gap-4">
      <p>Vui lòng nhập mật khẩu của bạn để xác thực hành động này:</p>
      <InputText
        v-model="password"
        type="password"
        placeholder="Nhập mật khẩu"
        class="rounded border border-gray-300"
      />
      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Hủy"
          severity="secondary"
          @click="closeDialog('password')"
          :disabled="isLoading"
        ></Button>
        <Button
          :label="selectedReader?.isActive ? 'Xác nhận cấm' : 'Xác nhận bỏ cấm'"
          :severity="selectedReader?.isActive ? 'danger' : 'success'"
          @click="
            selectedReader?.isActive
              ? handleBlockReader(selectedReader)
              : handleUnblockReader(selectedReader)
          "
          :loading="isLoading"
          :disabled="isLoading || !password"
        ></Button>
      </div>
    </div>
  </Dialog>
</template>
