<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import BooksManagement from '../../components/admin/BooksManagement.vue'
import LoansManagement from '../../components/admin/LoansManagement.vue'
import OverviewPanel from '../../components/admin/OverviewPanel.vue'
import PublishersManagement from '../../components/admin/PublishersManagement.vue'
import UsersManagement from '../../components/admin/UsersManagement.vue'
import StaffsManagement from '../../components/admin/StaffsManagement.vue'

const adminMenu = [
  { key: 'home', label: 'Trang chủ', icon: 'pi pi-home' },
  { key: 'loans', label: 'Mượn sách', icon: 'pi pi-list-check' },
  { key: 'readers', label: 'Độc giả', icon: 'pi pi-users' },
  { key: 'books', label: 'Sách', icon: 'pi pi-book' },
  { key: 'publishers', label: 'Nhà xuất bản', icon: 'pi pi-building' },
  { key: 'staffs', label: 'Nhân viên', icon: 'pi pi-users' },
]

const screenTitle = {
  home: 'Tổng quan hệ thống',
  readers: 'Danh sách người dùng',
  staffs: 'Danh sách nhân viên',
  books: 'Danh sách sách',
  publishers: 'Danh sách nhà xuất bản',
  loans: 'Danh sách phiếu mượn',
}

const screenComponentMap = {
  home: OverviewPanel,
  readers: UsersManagement,
  staffs: StaffsManagement,
  books: BooksManagement,
  publishers: PublishersManagement,
  loans: LoansManagement,
}

const activeScreen = ref('publishers')

const activeComponent = computed(() => screenComponentMap[activeScreen.value] || OverviewPanel)
</script>

<template>
  <section class="min-h-screen bg-slate-100 text-slate-700">
    <header class="px-8 py-4 bg-blue-800 shadow-md text-white-500">
      <div class="flex items-center gap-3">
        <img src="/ctu-logo.png" alt="CTU Logo" class="h-10 w-10" />
        <span class="text-xl font-bold text-white">E-Library CTU</span>
      </div>
    </header>
    <div class="flex min-h-screen flex-col md:flex-row">
      <!-- sidebar -->
      <aside class="w-full bg-cyan-700 text-slate-700 md:w-64 pt-6">
        <nav class="p-3">
          <button
            v-for="item in adminMenu"
            :key="item.key"
            class="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-lg transition"
            :class="
              activeScreen === item.key
                ? 'bg-slate-100/20 font-semibold text-white'
                : 'text-slate-200 hover:bg-slate-100/10'
            "
            @click="activeScreen = item.key"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <button
          class="m-3 mt-12 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md border border-slate-200/30 px-3 py-2 text-sm text-slate-100 hover:bg-slate-100/10"
        >
          <i class="pi pi-sign-out"></i>
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main class="flex-1 p-4 md:p-6">
        <section class="rounded-xl bg-white p-4 shadow-sm md:p-5">
          <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <!-- title -->
            <h2 class="text-xl font-bold text-slate-700">{{ screenTitle[activeScreen] }}</h2>
          </div>

          <component :is="activeComponent" />
        </section>
      </main>
    </div>
  </section>
</template>
