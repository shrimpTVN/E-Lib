<script setup>
import Button from 'primevue/button'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import { ref, onMounted, reactive, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import api from '@/api/axios.js'
import { useAppToast } from '@/utils/useAppToast'
import { useAuthStore } from '@/stores/auth.store.js'

const authStore = useAuthStore()
const { addToast } = useAppToast()

const staffs = ref([])
const query = ref('')
const visibleInfoDialog = ref(false)
const selectedStaff = ref(null)
const visiblePasswordDialog = ref(false)
const isLoading = ref(false)
const loading = ref(false)
const password = ref('')

const validationSchema = yup.object({
  hoTen: yup.string().required('Tên nhân viên là bắt buộc'),
  vaiTro: yup
    .string()
    .required('Chức vụ là bắt buộc')
    .oneOf(['staff', 'admin'], 'Chức vụ không hợp lệ'),
  dienThoai: yup.string().required('Điện thoại là bắt buộc'),
  diaChi: yup.string().required('Địa chỉ là bắt buộc'),
})

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema,
  initialValues: {
    hoTen: '',
    vaiTro: 'staff',
    dienThoai: '',
    diaChi: '',
  },
})

const { value: hoTen, errorMessage: hoTenError } = useField('hoTen')
const { value: vaiTro, errorMessage: vaiTroError } = useField('vaiTro')
const { value: dienThoai, errorMessage: dienThoaiError } = useField('dienThoai')
const { value: diaChi, errorMessage: diaChiError } = useField('diaChi')

const openDialog = (staff, dialogType) => {
  selectedStaff.value = staff
  if (dialogType === 'info') {
    if (staff) {
      hoTen.value = staff.hoTen
      vaiTro.value = staff.chucVu
      dienThoai.value = staff.dienThoai
      diaChi.value = staff.diaChi
    }

    visibleInfoDialog.value = true
  } else if (dialogType === 'password') {
    visiblePasswordDialog.value = true
    password.value = ''
  }
}

const handleFormSubmit = handleSubmit(async (formData) => {
  try {
    isLoading.value = true

    if (!selectedStaff.value) {
      await api.post('/staffs', formData)
      addToast('success', 'Thành công', 'Thêm nhân viên thành công')
    } else {
      console.log('Updating staff with data:', formData)
      await api.patch(`/staffs/${selectedStaff.value._id}`, formData)
      addToast('success', 'Thành công', 'Cập nhật thông tin nhân viên thành công')
    }

    closeDialog('info')
    loadStaffs()
  } catch (error) {
    console.log('Error saving staff:', error)
    addToast('error', 'Lỗi', 'Lỗi khi lưu thông tin nhân viên')
  } finally {
    isLoading.value = false
  }
})

const closeDialog = (dialogType) => {
  if (dialogType === 'info') {
    visibleInfoDialog.value = false
    resetForm()
  } else if (dialogType === 'password') {
    visiblePasswordDialog.value = false
    password.value = ''
  }
  selectedStaff.value = null
}

const handleToggleStaffStatus = async () => {
  try {
    await api.patch(`/staffs/${selectedStaff.value._id}/active`, {
      staff: {
        password: password.value,
        _id: authStore.user.id,
      },
    })
    addToast('success', 'Thành công', 'Trạng thái nhân viên đã được cập nhật')
    await loadStaffs()
    visiblePasswordDialog.value = false
  } catch (error) {
    console.error('Error toggling staff status:', error)
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể cấm nhân viên')
  }
}

const filteredStaffs = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  if (!keyword) return staffs.value

  return staffs.value.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)),
  )
})

const loadStaffs = async () => {
  try {
    const res = await api.get('/staffs')
    staffs.value = res.data.filter((staff) => staff._id !== authStore.user.id)
  } catch (error) {
    console.log('Error fetching staffs:', error)
    addToast('error', 'Lỗi', 'Lỗi khi tải danh sách nhân viên')
  }
}

onMounted(() => {
  loadStaffs()
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row justify-end items-center mb-2 px-2">
    <span class="p-input-icon-left sm:w-72">
      <!-- search bar -->
      <InputText v-model="query" class="h-10 w-full text-lg" placeholder="Tìm kiếm nhân viên...">
      </InputText>
    </span>

    <!-- create button -->
    <Button
      label="+ Thêm nhân viên"
      class="h-10 border-none bg-green-600 text-lg font-semibold text-slate-800 hover:bg-green-500"
      @click="openDialog(null, 'info')"
    ></Button>
  </div>

  <DataTable
    :value="filteredStaffs"
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
    <Column field="maNhanVien" header="Mã nhân viên" sortable=""> </Column>
    <Column field="hoTen" header="Tên nhân viên" sortable=""> </Column>
    <Column header="Ngày sinh" sortable="">
      <template #body="slotProps">
        {{ new Date(slotProps.data.ngaySinh).toLocaleDateString('vi-VN') }}
      </template>
    </Column>
    <Column field="dienThoai" header="Điện thoại" sortable=""> </Column>
    <Column field="chucVu" header="Chức vụ" sortable=""> </Column>
    <Column header="Hành động" :exportable="false" style="width: 8rem">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          text
          rounded
          @click="openDialog(slotProps.data, 'info')"
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

  <!-- Info Dialog -->
  <Dialog
    v-model:visible="visibleInfoDialog"
    :header="selectedStaff ? 'Chỉnh sửa thông tin Nhân viên' : 'Thêm nhân viên'"
    modal
    class="w-full max-w-xl"
    @hide="closeDialog('info')"
  >
    <!-- Info dialog content -->
    <form @submit.prevent="handleFormSubmit">
      <!-- ma nhan vien -->
      <div v-if="selectedStaff" class="flex gap-2 justify-start items-center mb-4">
        <label class="text-sm font-bold text-gray-700 w-[6rem]">Mã nhân viên: </label>
        <InputText v-model="selectedStaff.maNhanVien" disabled></InputText>
      </div>
      <!-- ho ten -->
      <div class="flex gap-2 justify-start items-center mb-4">
        <label class="text-sm font-bold text-gray-700 w-[6rem]"
          >Họ và tên: <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="hoTen"
          type="text"
          placeholder="Nhập họ và tên nhân viên"
          class="rounded border border-gray-300"
          :class="{ 'border-red-500': hoTenError }"
        />
        <small class="text-red-500" v-if="hoTenError">{{ hoTenError }}</small>
      </div>

      <!-- chuc vu  & dien thoai-->

      <div class="role-and-phone-container flex flex-col gap-8 sm:flex-row mb-4">
        <!-- chuc vu -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-gray-700"
            >Chức vụ: <span class="text-red-500">*</span></label
          >
          <select
            v-model="vaiTro"
            :value="vaiTro"
            class="rounded border border-gray-300 p-2"
            :class="{ 'border-red-500': vaiTroError }"
          >
            <option value="admin">Quản trị viên</option>
            <option value="staff">Thủ thư</option>
          </select>
          <small class="text-red-500" v-if="vaiTroError">{{ vaiTroError }}</small>
        </div>
        <!-- dien thoai -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-gray-700"
            >Số điện thoại: <span class="text-red-500">*</span></label
          >
          <InputText
            v-model="dienThoai"
            type="text"
            placeholder="Nhập số điện thoại"
            class="rounded border border-gray-300"
            :class="{ 'border-red-500': dienThoaiError }"
          />
          <small class="text-red-500" v-if="dienThoaiError">{{ dienThoaiError }}</small>
        </div>
      </div>

      <!-- dia chi -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-bold text-gray-700"
          >Địa chỉ: <span class="text-red-500">*</span></label
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

      <!-- button -->
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
          :label="selectedStaff ? 'Lưu thông tin' : 'Thêm nhân viên'"
          :loading="isLoading"
          :disabled="isLoading"
        ></Button>
      </div>
    </form>
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
          :label="selectedStaff?.isActive ? 'Xác nhận cấm' : 'Xác nhận bỏ cấm'"
          :severity="selectedStaff?.isActive ? 'danger' : 'success'"
          @click="handleToggleStaffStatus"
          :loading="isLoading"
          :disabled="isLoading || !password"
        ></Button>
      </div>
    </div>
  </Dialog>
</template>
