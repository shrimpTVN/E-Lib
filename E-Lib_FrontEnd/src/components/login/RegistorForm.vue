<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios.js'

const router = useRouter()
const submitError = ref('')
const submitSuccess = ref('')
const isSubmitting = ref(false)

const registerSchema = yup.object({
  hoLot: yup.string().trim().required('Vui long nhap ho + ten lot'),
  ten: yup.string().trim().required('Vui long nhap ten'),
  phai: yup
    .string()
    .oneOf(['Nam', 'Nữ', 'Khác'], 'Gioi tinh khong hop le')
    .required('Vui long chon gioi tinh'),
  ngay: yup
    .number()
    .typeError('Ngay phai la so')
    .integer('Ngay khong hop le')
    .min(1, 'Ngay tu 1 den 31')
    .max(31, 'Ngay tu 1 den 31')
    .required('Nhap ngay sinh'),
  thang: yup
    .number()
    .typeError('Thang phai la so')
    .integer('Thang khong hop le')
    .min(1, 'Thang tu 1 den 12')
    .max(12, 'Thang tu 1 den 12')
    .required('Nhap thang sinh'),
  nam: yup
    .number()
    .typeError('Nam phai la so')
    .integer('Nam khong hop le')
    .min(1900, 'Nam khong hop le')
    .max(new Date().getFullYear(), 'Nam khong hop le')
    .required('Nhap nam sinh'),
  dienThoai: yup
    .string()
    .trim()
    .matches(/^[0-9]{9,11}$/, 'So dien thoai gom 9-11 chu so')
    .required('Vui long nhap so dien thoai'),
  email: yup.string().trim().email('Email khong dung dinh dang').required('Vui long nhap email'),
  password: yup
    .string()
    .required('Vui long nhap mat khau')
    .min(6, 'Mat khau phai co it nhat 6 ky tu'),
  confirmPassword: yup
    .string()
    .required('Vui long nhap lai mat khau')
    .oneOf([yup.ref('password')], 'Nhap lai mat khau khong khop'),
})

const handleRegister = async (values) => {
  submitError.value = ''
  submitSuccess.value = ''
  isSubmitting.value = true

  const day = Number(values.ngay)
  const month = Number(values.thang)
  const year = Number(values.nam)
  const birthDate = new Date(year, month - 1, day)

  const isInvalidDate =
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day

  // check whether the constructed date matches the input values to catch invalid dates like 31/02/2020
  if (isInvalidDate) {
    submitError.value = 'Ngay sinh khong hop le'
    isSubmitting.value = false
    return
  }

  try {
    console.log('Submitting with:', values)
    await api.post('/register', {
      hoLot: values.hoLot,
      ten: values.ten,
      phai: values.phai,
      ngaySinh: birthDate,
      dienThoai: values.dienThoai,
      diaChi: values.diaChi || '',
      email: values.email,
      password: values.password,
    })

    submitSuccess.value = 'Dang ky thanh cong. Dang chuyen den trang dang nhap...'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Dang ky that bai. Vui long thu lai.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_30%,#4f90bf,transparent_45%),radial-gradient(circle_at_80%_10%,#2f5d87,transparent_35%),linear-gradient(140deg,#0e2a47,#1a4f7d)] px-[14px] py-6 sm:px-6"
  >
    <div
      class="relative z-10 w-full max-w-[560px] rounded-[18px] bg-white px-[18px] py-[22px] shadow-[0_30px_65px_rgba(5,17,28,0.35)] sm:rounded-3xl sm:p-7"
    >
      <div class="mb-5 form-header">
        <p class="m-0 text-xs font-bold tracking-[1.8px] text-[#0f6cbf]">E-LIBRARY CTU</p>
        <h1 class="my-2 text-[26px] leading-[1.2] text-[#13263a] sm:text-[30px]">Dang ky</h1>
        <p class="m-0 text-[#5e7186]">Tao tai khoan doc gia de su dung he thong muon sach.</p>
      </div>

      <Form class="grid gap-[14px]" :validation-schema="registerSchema" @submit="handleRegister">
        <div class="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div class="grid gap-[7px]">
            <label for="hoLot" class="text-sm font-semibold text-[#13263a]">Họ</label>
            <Field
              id="hoLot"
              name="hoLot"
              type="text"
              placeholder="Nguyen Van"
              class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
            />
            <div class="min-h-[18px]">
              <ErrorMessage name="hoLot" class="text-[13px] text-[#d63649]" />
            </div>
          </div>

          <div class="grid gap-[7px]">
            <label for="ten" class="text-sm font-semibold text-[#13263a]">Tên</label>
            <Field
              id="ten"
              name="ten"
              type="text"
              placeholder="Nghia"
              class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
            />
            <div class="min-h-[18px]">
              <ErrorMessage name="ten" class="text-[13px] text-[#d63649]" />
            </div>
          </div>
        </div>

        <div class="grid gap-[7px]">
          <p class="text-sm font-semibold text-[#13263a]">Giới tính</p>
          <div
            class="flex flex-wrap items-center gap-4 rounded-xl border border-[#d4dce5] px-3 py-[11px]"
          >
            <label class="inline-flex items-center gap-2 text-[15px] text-[#13263a]">
              <Field name="phai" type="radio" value="Nam" />
              <span>Nam</span>
            </label>
            <label class="inline-flex items-center gap-2 text-[15px] text-[#13263a]">
              <Field name="phai" type="radio" value="Nữ" />
              <span>Nu</span>
            </label>
            <label class="inline-flex items-center gap-2 text-[15px] text-[#13263a]">
              <Field name="phai" type="radio" value="Khác" />
              <span>Khac</span>
            </label>
          </div>
          <div class="min-h-[18px]">
            <ErrorMessage name="phai" class="text-[13px] text-[#d63649]" />
          </div>
        </div>

        <div class="grid gap-[7px]">
          <p class="text-sm font-semibold text-[#13263a]">Ngày sinh</p>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <Field
                name="ngay"
                type="number"
                min="1"
                max="31"
                placeholder="Ngay"
                class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
              />
              <div class="min-h-[18px]">
                <ErrorMessage name="ngay" class="text-[13px] text-[#d63649]" />
              </div>
            </div>
            <div>
              <Field
                name="thang"
                type="number"
                min="1"
                max="12"
                placeholder="Thang"
                class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
              />
              <div class="min-h-[18px]">
                <ErrorMessage name="thang" class="text-[13px] text-[#d63649]" />
              </div>
            </div>
            <div>
              <Field
                name="nam"
                type="number"
                min="1900"
                :max="new Date().getFullYear()"
                placeholder="Nam"
                class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
              />
              <div class="min-h-[18px]">
                <ErrorMessage name="nam" class="text-[13px] text-[#d63649]" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-[7px]">
          <label for="dienThoai" class="text-sm font-semibold text-[#13263a]">Số điện thoại</label>
          <Field
            id="dienThoai"
            name="dienThoai"
            type="text"
            placeholder="0912345678"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
          />

          <div class="min-h-[18px]">
            <ErrorMessage name="dienThoai" class="text-[13px] text-[#d63649]" />
          </div>
        </div>
        <div class="grid gap-[7px]">
          <label for="email" class="text-sm font-semibold text-[#13263a]">Email</label>
          <Field
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
          />
          <div class="min-h-[18px]">
            <ErrorMessage name="email" class="text-[13px] text-[#d63649]" />
          </div>
        </div>

        <div class="grid gap-[7px]">
          <label for="password" class="text-sm font-semibold text-[#13263a]">Mật khẩu</label>
          <Field
            id="password"
            name="password"
            type="password"
            placeholder="Nhap mat khau"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
          />
          <div class="min-h-[18px]">
            <ErrorMessage name="password" class="text-[13px] text-[#d63649]" />
          </div>
        </div>

        <div class="grid gap-[7px]">
          <label for="confirmPassword" class="text-sm font-semibold text-[#13263a]"
            >Nhập lại mật khẩu</label
          >
          <Field
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Nhap lai mat khau"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a]"
          />
          <div class="min-h-[18px]">
            <ErrorMessage name="confirmPassword" class="text-[13px] text-[#d63649]" />
          </div>
        </div>

        <p v-if="submitError" class="rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">
          {{ submitError }}
        </p>
        <p v-if="submitSuccess" class="rounded-lg bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">
          {{ submitSuccess }}
        </p>

        <!-- Submit Button - only able when the form is valid -->
        <button
          class="mt-0.5 rounded-xl bg-[#0f6cbf] p-3 text-[15px] font-bold text-white transition hover:bg-[#0a528f] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Đang xử lý ...' : 'Đăng ký' }}
        </button>
      </Form>

      <div class="mt-4 flex flex-wrap gap-2 text-sm text-[#5e7186]">
        <span>Đã có tài khoản?</span>
        <router-link to="/login" class="font-bold text-[#0f6cbf] no-underline hover:underline"
          >Đăng nhập</router-link
        >
      </div>
    </div>
  </section>
</template>
