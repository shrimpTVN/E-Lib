<script setup>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import api from '@/api/axios.js'
import { useAppToast } from '@/utils/useToast.js'
import { ref } from 'vue'
import Message from 'primevue/message'

const { addToast } = useAppToast()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const isSubmitError = ref(false)
const userInfor = ref(props.user)
const showPassword = ref(false)
const showRepassword = ref(false)

const password = ref('')

const repassword = ref('')

const accountSchema = yup.object({
  password: yup
    .string()
    .required('Mật khẩu hiện tại là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  repassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

const handlePasswordChange = async () => {
  isSubmitError.value = false
  if (!props.user?._id) {
    addToast('error', 'Lỗi', 'Không tìm thấy thông tin người dùng để cập nhật.', 2000)
    return
  }

  try {
    const res = await api.patch(`/readers/${props.user._id}/change-password`, {
      currentPass: password.value,
      newPass: repassword.value,
    })

    if (res.data.type == 'error') {
      isSubmitError.value = true
      return
    }

    addToast('success', 'Thành công', 'Mật khẩu đã được cập nhật.', 3000)
  } catch (error) {
    addToast('error', 'Lỗi', 'Cập nhật thông tin thất bại. Vui lòng thử lại.', 3000)
  }
}
</script>

<template>
  <section>
    <div class="infor-container bg-white border border-gray-300 ml-4 p-6 rounded-lg">
      <div class="user-infor">
        <h2 class="text-2xl font-medium text-gray-800">Thông tin tài khoản</h2>
        <Form
          @submit="handlePasswordChange"
          :validation-schema="accountSchema"
          class="account-form"
        >
          <div class="form-group email-container py-2">
            <label class="font-bold w-[20%] inline-block text-lg text-gray-700">Email</label>
            <Field
              name="email"
              type="text"
              readonly
              class="pl-4 form-control border border-gray-300 bg-gray-100 rounded-md w-[60%] p-1 text-lg text-gray-500 cursor-not-allowed"
              v-model="userInfor.email"
            />
          </div>

          <div class="form-group pass-container py-2">
            <label for="password" class="font-bold w-[20%] inline-block text-lg text-gray-700"
              >Mật khẩu hiện tại</label
            >
            <div class="relative inline-block w-[60%]">
              <Field
                name="password"
                :type="showPassword ? 'text' : 'password'"
                class="pl-4 pr-12 form-control border border-gray-500 rounded-md w-full p-1 text-lg text-gray-500"
                v-model="password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 text-sm text-blue-600 hover:text-blue-800"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <ErrorMessage
              name="password"
              class="error-feedback block text-red-500 text-sm mt-1 ml-[20%]"
            />
          </div>

          <div class="form-group pass-container py-2">
            <label for="repassword" class="font-bold w-[20%] inline-block text-lg text-gray-700"
              >Mật khẩu mới</label
            >
            <div class="relative inline-block w-[60%]">
              <Field
                name="repassword"
                :type="showRepassword ? 'text' : 'password'"
                class="pl-4 pr-12 form-control border border-gray-500 rounded-md w-full p-1 text-lg text-gray-500"
                v-model="repassword"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 text-sm text-blue-600 hover:text-blue-800"
                @click="showRepassword = !showRepassword"
              >
                <i :class="showRepassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <ErrorMessage
              name="repassword"
              class="error-feedback block text-red-500 text-sm mt-1 ml-[20%]"
            />
          </div>

          <Message v-if="isSubmitError" severity="error" class="w-[30%] mx-auto"
            >Mật khẩu không đúng</Message
          >

          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center mx-auto block mt-6"
          >
            Lưu mật khẩu
          </button>
        </Form>
      </div>
    </div>
  </section>
</template>
