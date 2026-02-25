<script setup>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import IsLoading from '../IsLoading.vue'
import UserService from '@/services/user.service.js'

const router = useRouter()
const userInfor = ref({
  maDocGia: '',
  hoLot: '',
  ten: '',
  ngaySinh: '',
  gioiTinh: '',
  diaChi: '',
  dienThoai: '',
})
const isLoading = ref(true)

const userInforSchema = yup.object().shape({
  hoLot: yup
    .string()
    .required('Họ lót không được để trống')
    .min(2, 'Họ lót phải có ít nhất 2 ký tự')
    .max(50, 'Họ lót có nhiều nhất 50 ký tự'),

  ten: yup
    .string()
    .required('Tên không được để trống')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên có nhiều nhất 50 ký tự'),
  dienThoai: yup.string().matches(/^(09|03|07|08|05)[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  diaChi: yup.string().max(100, 'Địa chỉ tối đa 100 ký tự'),
  ngaySinh: yup.date().max(new Date(), 'Ngày sinh phải là ngày trong quá khứ'),
  gioiTinh: yup.string().oneOf(['Nam', 'Nữ'], 'Giới tính không hợp lệ'),
})

const handleSubmit = (values) => {
  // Xử lý logic lưu thông tin người dùng tại đây
  console.log('Thông tin người dùng đã được lưu:', values)
  // Sau khi lưu, bạn có thể điều hướng hoặc hiển thị thông báo thành công
  alert('Thông tin của bạn đã được cập nhật thành công!')
}

onMounted(async () => {
  const userId = router.currentRoute.value.params.id
  if (!userId) {
    console.error('Không tìm thấy ID người dùng trong URL')
    return
  }

  try {
    userInfor.value = await UserService.get(userId)
    console.log(userInfor.value.dienThoai)
  } catch (error) {
    console.log('Lỗi khi lấy thông tin người dùng:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section>
    <div class="infor-container bg-white border border-gray-300 ml-4 p-6 rounded-lg">
      <div class="user-infor">
        <h2 class="text-2xl font-medium text-gray-800 mb-6">Thông tin cá nhân</h2>
        <IsLoading v-if="isLoading"> </IsLoading>
        <Form v-else @submit.prevent="handleSubmit" :validation-schema="userInforSchema">
          <div class="form-group py-2">
            <label for="hoLot" class="font-bold w-28 inline-block text-lg text-gray-700">Họ</label>
            <Field
              name="hoLot"
              type="text"
              class="pl-4 form-control border border-gray-500 rounded-md w-[60%] p-1 text-lg text-gray-500"
              v-model="userInfor.hoLot"
            />
            <ErrorMessage
              name="hoLot"
              class="error-feedback block text-red-500 text-sm mt-1 pl-32"
            />
          </div>

          <div class="form-group py-2">
            <label for="ten" class="font-bold w-28 inline-block text-lg text-gray-700">Tên</label>
            <Field
              name="ten"
              type="text"
              class="pl-4 form-control border border-gray-500 rounded-md w-[60%] p-1 text-lg text-gray-500"
              v-model="userInfor.ten"
            />
            <ErrorMessage name="ten" class="error-feedback block text-red-500 text-sm mt-1 pl-32" />
          </div>
          <div class="form-group py-2">
            <div class="flex items-center gap-6 w-[60%] inline-block">
              <label
                for="gioiTinh"
                class="justify-self-start font-bold w-28 inline-block text-lg text-gray-700"
                >Giới tính</label
              >
              <label class="flex items-center gap-2 cursor-pointer text-lg text-gray-600">
                <Field
                  name="gioiTinh"
                  type="radio"
                  value="Nam"
                  v-model="userInfor.gioiTinh"
                  class="w-5 h-5 text-blue-600 border-gray-500 focus:ring-blue-500"
                />
                Nam
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-lg text-gray-600">
                <Field
                  name="gioiTinh"
                  type="radio"
                  value="Nữ"
                  v-model="userInfor.gioiTinh"
                  class="w-5 h-5 text-blue-600 border-gray-500 focus:ring-blue-500"
                />
                Nữ
              </label>
            </div>

            <ErrorMessage
              name="gioiTinh"
              class="error-feedback block text-red-500 text-sm mt-1 pl-32"
            />
          </div>
          <div class="form-group py-2">
            <label for="ngaySinh" class="font-bold w-28 inline-block text-lg text-gray-700"
              >Ngày sinh</label
            >
            <Field
              name="ngaySinh"
              type="text"
              class="pl-4 form-control border border-gray-500 rounded-md w-[60%] p-1 text-lg text-gray-500"
              v-model="userInfor.ngaySinh"
            />
            <ErrorMessage
              name="ngaySinh"
              class="error-feedback block text-red-500 text-sm mt-1 pl-32"
            />
          </div>
          <div class="form-group py-2">
            <label for="dienThoai" class="font-bold w-28 inline-block text-lg text-gray-700"
              >Điện thoại</label
            >
            <Field
              name="dienThoai"
              type="text"
              class="pl-4 form-control border border-gray-500 rounded-md w-[60%] p-1 text-lg text-gray-500"
              v-model="userInfor.dienThoai"
            />
            <ErrorMessage
              name="dienThoai"
              class="error-feedback block text-red-500 text-sm mt-1 pl-32"
            />
          </div>
          <div class="form-group py-2">
            <label for="diaChi" class="font-bold w-28 inline-block text-lg text-gray-700"
              >Địa chỉ</label
            >
            <Field
              name="diaChi"
              type="text"
              class="pl-4 form-control border border-gray-500 rounded-md w-[60%] p-1 text-base h-[38px] text-gray-500"
              v-model="userInfor.diaChi"
            />
            <ErrorMessage
              name="diaChi"
              class="error-feedback block text-red-500 text-sm mt-1 pl-32"
            />
          </div>

          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center mx-auto block mt-6"
          >
            Lưu thông tin
          </button>
        </Form>
      </div>
    </div>
  </section>
</template>
