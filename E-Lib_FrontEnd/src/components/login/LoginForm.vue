<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import api from '@/api/axios.js'

const { username, password } = ref({
  username: '',
  password: '',
})

const loginSchema = yup.object({
  email: yup.string().trim().required('Vui long nhap email').email('Email khong dung dinh dang'),
  password: yup
    .string()
    .required('Vui long nhap mat khau')
    .min(6, 'Mat khau phai co it nhat 6 ky tu'),
})

const socialLoginMethods = [
  {
    name: 'Facebook',
    code: 'f',
    badgeClass: 'bg-[#1877f2]',
  },
  {
    name: 'Gmail',
    code: 'g',
    badgeClass: 'bg-[#db4437]',
  },
  {
    name: 'Zalo',
    code: 'z',
    badgeClass: 'bg-[#0068ff]',
  },
]

const handleLogin = async () => {
  try {
    const res = await api.post('login', { email: email.value, password: password.value })

    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      // Logic giải mã payload để lấy role như bạn đã làm
      const payload = JSON.parse(atob(res.data.token.split('.')[1]))
      authorizationLink.value = payload.role === 'admin' ? '/admin' : '/'
      // centerDialogVisible.value = true
    }
  } catch (error) {
    open(error.response?.data?.message || 'Lỗi kết nối', 'error')
  }
}

const handleSocialLogin = (provider) => {
  // TODO: Replace with OAuth flow.
  console.log(`Dang nhap bang ${provider}`)
}
</script>

<template>
  <section
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_30%,#4f90bf,transparent_45%),radial-gradient(circle_at_80%_10%,#2f5d87,transparent_35%),linear-gradient(140deg,#0e2a47,#1a4f7d)] px-[14px] py-6 sm:px-6"
  >
    <div
      class="absolute -right-[70px] -top-[90px] h-80 w-80 rounded-full bg-[#b7deff] opacity-25 blur-[2px]"
    ></div>
    <div
      class="absolute -bottom-[70px] -left-[30px] h-[250px] w-[250px] rounded-full bg-[#ffd5aa] opacity-25 blur-[2px]"
    ></div>

    <div
      class="relative z-10 w-full max-w-[460px] rounded-[18px] bg-white px-[18px] py-[22px] shadow-[0_30px_65px_rgba(5,17,28,0.35)] sm:rounded-3xl sm:p-7"
    >
      <div class="mb-5">
        <p class="m-0 text-xs font-bold tracking-[1.8px] text-[#0f6cbf]">E-LIBRARY CTU</p>
        <h1 class="my-2 text-[26px] leading-[1.2] text-[#13263a] sm:text-[30px]">Dang nhap</h1>
        <p class="m-0 text-[#5e7186]">Su dung email va mat khau de truy cap tai khoan cua ban.</p>
      </div>

      <Form class="grid gap-[14px]" :validation-schema="loginSchema" @submit="handleLogin">
        <div class="grid gap-[7px]">
          <label for="email" class="text-sm font-semibold text-[#13263a]">Email</label>
          <Field
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a] transition focus:border-[#0f6cbf] focus:outline-none focus:ring-4 focus:ring-[#0f6cbf]/20"
            v-model="username"
          />
          <ErrorMessage name="email" class="text-[13px] text-[#d63649]" />
        </div>

        <div class="grid gap-[7px]">
          <label for="password" class="text-sm font-semibold text-[#13263a]">Mat khau</label>
          <Field
            id="password"
            name="password"
            type="password"
            placeholder="Nhap mat khau"
            class="w-full rounded-xl border border-[#d4dce5] px-3 py-[11px] text-[15px] text-[#13263a] transition focus:border-[#0f6cbf] focus:outline-none focus:ring-4 focus:ring-[#0f6cbf]/20"
            v-model="password"
          />
          <ErrorMessage name="password" class="text-[13px] text-[#d63649]" />
        </div>

        <button
          class="mt-0.5 rounded-xl bg-[#0f6cbf] p-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#0a528f]"
          type="submit"
        >
          Dang nhap
        </button>
      </Form>

      <div class="mt-4 flex flex-wrap gap-2 text-sm text-[#5e7186]">
        <span>Chua co tai khoan?</span>
        <router-link to="/register" class="font-bold text-[#0f6cbf] no-underline hover:underline"
          >Dang ky ngay</router-link
        >
      </div>

      <div
        class="mb-[14px] mt-[18px] text-center text-[13px] uppercase tracking-[1px] text-[#5e7186]"
      >
        hoac
      </div>

      <div class="grid gap-[10px]">
        <button
          v-for="method in socialLoginMethods"
          :key="method.name"
          type="button"
          class="flex w-full items-center justify-start gap-[10px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left text-sm font-semibold text-[#1e293b] transition hover:-translate-y-px hover:shadow-[0_10px_18px_rgba(15,23,42,0.1)]"
          @click="handleSocialLogin(method.name)"
        >
          <span
            class="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold uppercase text-white"
            :class="method.badgeClass"
            >{{ method.code }}</span
          >
          <span>Dang nhap bang {{ method.name }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
