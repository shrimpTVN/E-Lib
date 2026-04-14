<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useForm } from 'vee-validate'
import Image from 'primevue/image'
import * as yup from 'yup'

import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth.store'
import { useAppToast } from '@/utils/useAppToast'

const authStore = useAuthStore()
const { addToast } = useAppToast()

const loading = ref(false)
const saving = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const staff = ref({
  maNhanVien: '',
  avatar: '',
  hoTen: '',
  chucVu: '',
  dienThoai: '',
  diaChi: '',
  ngaySinh: '',
  username: '',
  vaiTro: '',
  isActive: true,
})

const profileSchema = yup.object({
  hoTen: yup.string().trim().required('Vui lòng nhập họ và tên.'),
  dienThoai: yup.string().trim().required('Vui lòng nhập số điện thoại.'),
  ngaySinh: yup.string().trim().required('Vui lòng nhập ngày sinh.'),
  diaChi: yup.string().nullable(),
})

const passwordSchema = yup.object({
  oldPassword: yup.string().min(6, 'Mật khẩu cũ cần ít nhất 6 ký tự.'),
  newPassword: yup.string().min(6, 'Mật khẩu mới cần ít nhất 6 ký tự.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Mật khẩu nhập lại không khớp.'),
})

const { validate: validateProfile, setValues: setProfileValues } = useForm({
  validationSchema: profileSchema,
})

const { validate: validatePassword, setValues: setPasswordValues } = useForm({
  validationSchema: passwordSchema,
})

const handleSave = async () => {
  setProfileValues({
    hoTen: staff.value.hoTen,
    dienThoai: staff.value.dienThoai,
    ngaySinh: staff.value.ngaySinh,
    diaChi: staff.value.diaChi,
  })

  const { valid, errors } = await validateProfile()
  if (!valid) {
    const firstError = Object.values(errors)[0]
    addToast('warn', 'Thông tin chưa hợp lệ', firstError || 'Vui lòng kiểm tra lại dữ liệu.')
    return
  }

  const payload = {
    hoTen: staff.value.hoTen,
    dienThoai: staff.value.dienThoai,
    ngaySinh: staff.value.ngaySinh,
    diaChi: staff.value.diaChi,
  }

  try {
    saving.value = true
    const res = await api.patch(`/staffs/${authStore.user.id}`, payload)
    staff.value = { ...staff.value, ...res.data }
    addToast('success', 'Thành công', 'Cập nhật thông tin cá nhân thành công.')
  } catch (error) {
    console.error('Error updating staff info:', error)
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin.')
  } finally {
    saving.value = false
  }
}

const handleChangePassword = async () => {
  setPasswordValues({
    oldPassword: oldPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  })

  const { valid, errors } = await validatePassword()
  if (!valid) {
    const firstError = Object.values(errors)[0]
    addToast('warn', 'Thông tin chưa hợp lệ', firstError || 'Vui lòng kiểm tra lại dữ liệu.')
    return
  }

  if (!newPassword.value) {
    addToast('warn', 'Thiếu thông tin', 'Vui lòng nhập mật khẩu mới.')
    return
  }

  try {
    saving.value = true
    const res = await api.patch(`/staffs/${authStore.user.id}/change-password`, {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })

    staff.value = { ...staff.value, ...res.data }
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    addToast('success', 'Thành công', 'Đổi mật khẩu thành công.')
  } catch (error) {
    console.error('Error updating password:', error)
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu.')
  } finally {
    saving.value = false
  }
}

const loadPersonalInfo = async () => {
  try {
    loading.value = true
    const res = await api.get(`/staffs/${authStore.user.id}`)
    staff.value = { ...staff.value, ...res.data }
    staff.value.ngaySinh = new Date(staff.value.ngaySinh).toLocaleDateString('en-CA')
  } catch (error) {
    console.error('Error loading staff info:', error)
    addToast('error', 'Lỗi', 'Không thể tải thông tin cá nhân.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user?.id) {
    loadPersonalInfo()
  }
})
</script>

<template>
  <section class="space-y-4">
    <div class="rounded-lg border border-slate-200 bg-white p-4">
      <div v-if="loading" class="py-6 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>

      <form v-else class="grid gap-4 md:grid-cols-2 mb-4" @submit.prevent="handleSave">
        <div class="md:col-span-2 flex gap-8">
          <!-- avatar -->
          <div
            class="bg-gray-100 p-4 rounded-lg flex items-center justify-center w-[12rem] h-[16rem]"
          >
            <Image
              :src="
                staff.avatar ||
                'https://res.cloudinary.com/depaiphq0/image/upload/v1776151633/User-avatar_dhrqba.png'
              "
              alt="Image"
              width="250"
            />
          </div>

          <div>
            <div class="flex justify-center items-center gap-2 mb-4">
              <label class="mb-1 block text-sm font-semibold text-gray-700 w-[10rem]"
                >Mã nhân viên:
              </label>
              <InputText v-model="staff.maNhanVien" class="w-full" disabled />
            </div>

            <div class="flex justify-center items-center gap-2 mb-4">
              <label class="mb-1 block text-sm font-semibold text-gray-700 w-[10rem]"
                >Chức vụ:
              </label>
              <InputText v-model="staff.chucVu" class="w-full" disabled />
            </div>

            <div class="flex justify-center items-center gap-2 mb-4">
              <label class="mb-1 block text-sm font-semibold text-gray-700 w-[10rem]">
                Họ và tên <span class="text-red-500">*</span>:
              </label>
              <InputText v-model="staff.hoTen" class="w-full" placeholder="Nhập họ và tên" />
            </div>
            <div class="flex justify-center items-center gap-2 mb-4">
              <label class="mb-1 block text-sm font-semibold text-gray-700 w-[10rem]">
                Ngày sinh <span class="text-red-500">*</span>
              </label>
              <InputText v-model="staff.ngaySinh" class="w-full" type="date" />
            </div>

            <div class="flex justify-center items-center gap-2 mb-4">
              <label class="mb-1 block text-sm font-semibold text-gray-700 w-[10rem]">
                Số điện thoại <span class="text-red-500">*</span>
              </label>
              <InputText
                v-model="staff.dienThoai"
                class="w-full"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-semibold text-gray-700">Địa chỉ</label>
          <Textarea v-model="staff.diaChi" class="w-full" placeholder="Nhập địa chỉ" />
        </div>

        <div class="md:col-span-2 flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            label="Lưu thay đổi"
            :loading="saving"
            :disabled="saving || loading"
          ></Button>
        </div>
      </form>

      <div class="pt-4 mb-4 border-t border-gray-300">
        <h2 class="text-xl text-gray-600 font-bold">Tài khoản</h2>
      </div>
      <!-- Change password form -->
      <form @submit.prevent="handleChangePassword">
        <div>
          <div class="flex justify-center items-center gap-2 mb-4">
            <label class="mb-1 block text-sm font-semibold text-gray-700 w-[8rem]"
              >Tên đăng nhập:
            </label>
            <InputText v-model="staff.username" class="w-[18rem]" disabled />
          </div>

          <div class="flex justify-center items-center gap-2 mb-4">
            <label class="mb-1 block text-sm font-semibold text-gray-700 w-[8rem]"
              >Mật khẩu cũ:
            </label>
            <InputText
              v-model="oldPassword"
              type="password"
              class="w-[18rem]"
              placeholder="Để trống nếu không đổi mật khẩu"
            />
          </div>
          <div class="flex justify-center items-center gap-2 mb-4">
            <label class="mb-1 block text-sm font-semibold text-gray-700 w-[8rem]"
              >Mật khẩu mới:
            </label>
            <InputText
              v-model="newPassword"
              type="password"
              class="w-[18rem]"
              placeholder="Để trống nếu không đổi mật khẩu"
            />
          </div>
          <div class="flex justify-center items-center gap-2 mb-4">
            <label class="mb-1 block text-sm font-semibold text-gray-700 w-[8rem]"
              >Nhập lại mật khẩu mới:
            </label>
            <InputText
              v-model="confirmPassword"
              type="password"
              class="w-[18rem]"
              placeholder="Để trống nếu không đổi mật khẩu"
            />
          </div>
          <div class="md:col-span-2 flex justify-center gap-2 pt-2">
            <Button
              type="submit"
              label="Đổi mật khẩu"
              :loading="saving"
              :disabled="saving || loading"
            ></Button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>
