<script setup>
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { reactive, watch } from 'vue'
import api from '@/api/axios.js'
// import { useToast } from 'primevue/usetoast'
import { useAppToast } from '@/utils/useToast.js'

// const toast = useToast()
const { addToast } = useAppToast()

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

const userInfor = reactive({
  hoLot: '',
  ten: '',
  phai: '',
  ngaySinhNgay: '',
  ngaySinhThang: '',
  ngaySinhNam: '',
  dienThoai: '',
  diaChi: '',
})

const syncUserInfor = (userData) => {
  if (!userData) return

  const ngaySinh = userData.ngaySinh ? new Date(userData.ngaySinh) : null

  userInfor.hoLot = userData.hoLot ?? ''
  userInfor.ten = userData.ten ?? ''
  userInfor.phai = userData.phai ?? ''
  userInfor.dienThoai = userData.dienThoai ?? ''
  userInfor.diaChi = userData.diaChi ?? ''
  userInfor.ngaySinhNgay = ngaySinh ? String(ngaySinh.getDate()).padStart(2, '0') : ''
  userInfor.ngaySinhThang = ngaySinh ? String(ngaySinh.getMonth() + 1).padStart(2, '0') : ''
  userInfor.ngaySinhNam = ngaySinh ? String(ngaySinh.getFullYear()) : ''
}

watch(
  () => props.user,
  (newUser) => {
    syncUserInfor(newUser)
  },
  { immediate: true },
)

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
  dienThoai: yup
    .string()
    .required('Điện thoại không được để trống')
    .matches(/^\d{10}$/, 'Số điện thoại phải có 10 chữ số'),
  diaChi: yup.string().max(100, 'Địa chỉ tối đa 100 ký tự'),
  ngaySinhNgay: yup
    .number()
    .typeError('Ngày sinh không hợp lệ')
    .required('Ngày không được để trống')
    .integer('Ngày sinh không hợp lệ')
    .min(1, 'Ngày sinh không hợp lệ')
    .max(31, 'Ngày sinh không hợp lệ'),
  ngaySinhThang: yup
    .number()
    .typeError('Ngày sinh không hợp lệ')
    .required('Tháng không được để trống')
    .integer('Ngày sinh không hợp lệ')
    .min(1, 'Ngày sinh không hợp lệ')
    .max(12, 'Ngày sinh không hợp lệ'),
  ngaySinhNam: yup
    .number()
    .typeError('Ngày sinh không hợp lệ')
    .required('Năm không được để trống')
    .integer('Ngày sinh không hợp lệ')
    .min(1900, 'Ngày sinh không hợp lệ')
    .max(new Date().getFullYear(), 'Ngày sinh phải là ngày trong quá khứ'),
  gioiTinh: yup.string().oneOf(['Nam', 'Nữ'], 'Giới tính không hợp lệ'),
})

const handleSubmit = async () => {
  if (!props.user?._id) {
    addToast('error', 'Lỗi', 'Không tìm thấy thông tin người dùng để cập nhật.', 2000)
    return
  }

  const day = Number(userInfor.ngaySinhNgay)
  const month = Number(userInfor.ngaySinhThang)
  const year = Number(userInfor.ngaySinhNam)
  const ngaySinh = new Date(year, month - 1, day)

  if (
    Number.isNaN(ngaySinh.getTime()) ||
    ngaySinh.getDate() !== day ||
    ngaySinh.getMonth() + 1 !== month ||
    ngaySinh.getFullYear() !== year ||
    ngaySinh > new Date()
  ) {
    addToast('error', 'Lỗi', 'Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.', 3000)
    return
  }

  const payload = {
    hoLot: userInfor.hoLot,
    ten: userInfor.ten,
    phai: userInfor.phai,
    ngaySinh,
    dienThoai: userInfor.dienThoai,
    diaChi: userInfor.diaChi,
  }

  try {
    const userId = props.user._id
    const response = await api.patch(`/readers/${userId}`, payload)
    syncUserInfor(response.data)
    addToast('success', 'Thành công', 'Thông tin của bạn đã được cập nhật thành công!', 3000)
  } catch (error) {
    console.error('Failed to update user data:', error)
    addToast('error', 'Lỗi', 'Cập nhật thông tin thất bại. Vui lòng thử lại.', 3000)
  }
}
</script>

<template>
  <section>
    <div class="infor-container bg-white border border-gray-300 ml-4 p-6 rounded-lg">
      <div class="user-infor">
        <h2 class="text-2xl font-medium text-gray-800 mb-6">Thông tin cá nhân</h2>
        <Form @submit="handleSubmit" :validation-schema="userInforSchema">
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
                  v-model="userInfor.phai"
                  class="w-5 h-5 text-blue-600 border-gray-500 focus:ring-blue-500"
                />
                Nam
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-lg text-gray-600">
                <Field
                  name="gioiTinh"
                  type="radio"
                  value="Nữ"
                  v-model="userInfor.phai"
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
            <label class="font-bold w-28 inline-block text-lg text-gray-700">Ngày sinh</label>
            <div class="inline-flex gap-3 w-[60%] align-middle">
              <div class="flex-1">
                <Field
                  name="ngaySinhNgay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ngày"
                  class="pl-4 form-control border border-gray-500 rounded-md w-full p-1 text-lg text-gray-500"
                  v-model="userInfor.ngaySinhNgay"
                />
                <ErrorMessage
                  name="ngaySinhNgay"
                  class="error-feedback block text-red-500 text-sm mt-1"
                />
              </div>

              <div class="flex-1">
                <Field
                  name="ngaySinhThang"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Tháng"
                  class="pl-4 form-control border border-gray-500 rounded-md w-full p-1 text-lg text-gray-500"
                  v-model="userInfor.ngaySinhThang"
                />
                <ErrorMessage
                  name="ngaySinhThang"
                  class="error-feedback block text-red-500 text-sm mt-1"
                />
              </div>

              <div class="flex-1">
                <Field
                  name="ngaySinhNam"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  placeholder="Năm"
                  class="pl-4 form-control border border-gray-500 rounded-md w-full p-1 text-lg text-gray-500"
                  v-model="userInfor.ngaySinhNam"
                />
                <ErrorMessage
                  name="ngaySinhNam"
                  class="error-feedback block text-red-500 text-sm mt-1"
                />
              </div>
            </div>
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
