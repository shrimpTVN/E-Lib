<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAppToast } from '@/utils/useAppToast'

const { addToast } = useAppToast()

const loading = ref(false)
const isRefreshing = ref(false)

const statsRaw = ref({
  readersTotal: 0,
  booksTotal: 0,
  publishersTotal: 0,
  loansTotal: 0,
  loansOpen: 0,
  loansOverdue: 0,
  booksAvailable: 0,
  booksOutOfStock: 0,
})

const recentActivities = ref([])
const statusDistribution = ref([])
const permissionWarnings = ref([])

const numberFormat = (value) => Number(value || 0).toLocaleString('vi-VN')

const ratioText = computed(() => {
  if (!statsRaw.value.booksTotal) return '0%'
  const ratio = Math.round((statsRaw.value.loansOpen / statsRaw.value.booksTotal) * 100)
  return `${ratio}%`
})

const healthTone = computed(() => {
  if (statsRaw.value.loansOverdue > 0) {
    return {
      text: 'Cần chú ý',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      message: `Có ${numberFormat(statsRaw.value.loansOverdue)} phiếu mượn đang quá hạn`,
    }
  }

  if (statsRaw.value.booksOutOfStock > 0) {
    return {
      text: 'Ổn định',
      color: 'text-sky-700',
      bg: 'bg-sky-100',
      message: `${numberFormat(statsRaw.value.booksOutOfStock)} đầu sách đã hết, nên cân nhắc nhập thêm`,
    }
  }

  return {
    text: 'Tốt',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    message: 'Không có phiếu quá hạn và nguồn sách đang cân bằng',
  }
})

const statCards = computed(() => [
  {
    id: 'readers',
    label: 'Độc giả',
    value: statsRaw.value.readersTotal,
    icon: 'pi pi-users',
    accent: 'from-sky-500 to-blue-600',
    subText: 'Tổng tài khoản bạn đọc',
  },
  {
    id: 'books',
    label: 'Sách',
    value: statsRaw.value.booksTotal,
    icon: 'pi pi-book',
    accent: 'from-cyan-500 to-teal-600',
    subText: `${numberFormat(statsRaw.value.booksAvailable)} cuốn sẵn sàng phục vụ`,
  },
  {
    id: 'publishers',
    label: 'Nhà xuất bản',
    value: statsRaw.value.publishersTotal,
    icon: 'pi pi-building',
    accent: 'from-indigo-500 to-violet-600',
    subText: 'Đối tác cung cấp sách',
  },
  {
    id: 'open-loans',
    label: 'Phiếu mượn đang mở',
    value: statsRaw.value.loansOpen,
    icon: 'pi pi-clock',
    accent: 'from-amber-500 to-orange-600',
    subText: `${numberFormat(statsRaw.value.loansOverdue)} phiếu đang quá hạn`,
  },
])

const loadOverview = async ({ silent = false } = {}) => {
  if (silent) {
    isRefreshing.value = true
  } else {
    loading.value = true
  }

  permissionWarnings.value = []

  try {
    const [booksRes, publishersRes, loansRes, readersRes] = await Promise.allSettled([
      api.get('/books', { params: { page: 1, limit: 1 } }),
      api.get('/publishers'),
      api.get('/borrow'),
      api.get('/readers'),
    ])

    const booksData = booksRes.status === 'fulfilled' ? booksRes.value.data : {}
    const publishersData = publishersRes.status === 'fulfilled' ? publishersRes.value.data : []
    const loansData = loansRes.status === 'fulfilled' ? loansRes.value.data : {}
    const readersData = readersRes.status === 'fulfilled' ? readersRes.value.data : {}

    if (booksRes.status === 'rejected') {
      throw booksRes.reason
    }

    if (publishersRes.status === 'rejected') {
      throw publishersRes.reason
    }

    if (loansRes.status === 'rejected') {
      throw loansRes.reason
    }

    if (readersRes.status === 'rejected') {
      const status = readersRes.reason?.response?.status
      if (status === 403) {
        permissionWarnings.value.push(
          'Tài khoản hiện tại không có quyền đọc danh sách độc giả, thống kê độc giả sẽ hiển thị 0.',
        )
      } else {
        permissionWarnings.value.push('Không tải được danh sách độc giả từ máy chủ.')
      }
    }

    const loans = loansData.loans || []
    const books = booksData.books || []
    const readers = readersData.readers || []

    const loansOpen = loans.filter((item) => !item.isReturned)
    const loansOverdue = loans.filter((item) => item.isQuaHan && !item.isReturned)
    const booksAvailable = books.reduce((sum, item) => sum + Number(item?.conLai || 0), 0)
    const booksOutOfStock = books.filter((item) => Number(item?.conLai || 0) <= 0).length

    const statusCountMap = loans.reduce((acc, item) => {
      const key = item?.trangThaiHienTai || 'Không rõ'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    statusDistribution.value = Object.entries(statusCountMap)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    recentActivities.value = [...loans]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 6)
      .map((loan) => ({
        id: loan._id,
        status: loan.trangThaiHienTai || 'Chưa cập nhật',
        readerName:
          `${loan?.idDocGia?.hoLot || ''} ${loan?.idDocGia?.ten || ''}`.trim() ||
          'Độc giả không xác định',
        bookName: loan?.idSach?.tenSach || 'Sách không xác định',
        updatedAt: new Date(loan.updatedAt || loan.createdAt).toLocaleString('vi-VN'),
      }))

    statsRaw.value = {
      readersTotal: readers.length,
      booksTotal: Number(booksData.totalRecords || books.length || 0),
      publishersTotal: Array.isArray(publishersData) ? publishersData.length : 0,
      loansTotal: loans.length,
      loansOpen: loansOpen.length,
      loansOverdue: loansOverdue.length,
      booksAvailable,
      booksOutOfStock,
    }
  } catch (error) {
    console.error('Error loading overview:', error)
    addToast('error', 'Lỗi', 'Không thể tải dữ liệu tổng quan từ hệ thống')
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

onMounted(() => {
  loadOverview()
})
</script>

<template>
  <div class="space-y-6">
    <section
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b3f7c] via-[#0d558f] to-[#0b6f86] p-6 text-white shadow-lg"
    >
      <div class="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
      <div
        class="absolute -left-10 -bottom-12 h-36 w-36 rounded-full bg-cyan-200/20 blur-2xl"
      ></div>

      <div class="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-cyan-100">E-Library Admin</p>
          <h2 class="mt-2 text-2xl font-bold">Tổng quan vận hành thư viện</h2>
          <p class="mt-1 text-sm text-cyan-100/90">
            Dữ liệu được đồng bộ trực tiếp từ hệ thống Backend theo thời gian thực.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          :disabled="isRefreshing"
          @click="loadOverview({ silent: true })"
        >
          <i :class="['pi pi-refresh text-sm', { 'animate-spin': isRefreshing }]"></i>
          Làm mới dữ liệu
        </button>
      </div>
    </section>

    <div v-if="permissionWarnings.length" class="space-y-2">
      <div
        v-for="warning in permissionWarnings"
        :key="warning"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
      >
        <i class="pi pi-exclamation-triangle mr-2"></i>{{ warning }}
      </div>
    </div>

    <section v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="index in 4"
        :key="index"
        class="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
      ></div>
    </section>

    <section v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="stat in statCards"
        :key="stat.id"
        class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div :class="['bg-gradient-to-r p-4 text-white', stat.accent]">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white/90">{{ stat.label }}</p>
            <i :class="[stat.icon, 'text-xl text-white/90']"></i>
          </div>
          <p class="mt-3 text-3xl font-bold">{{ numberFormat(stat.value) }}</p>
        </div>
        <div class="px-4 py-3 text-xs text-slate-600">{{ stat.subText }}</div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">Hoạt động mượn gần đây</h3>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {{ numberFormat(recentActivities.length) }} bản ghi mới nhất
          </span>
        </div>

        <div v-if="recentActivities.length" class="space-y-3">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-800">
                  {{ activity.readerName }}
                  <span class="font-normal text-slate-500">- {{ activity.bookName }}</span>
                </p>
                <p class="text-xs text-slate-500">{{ activity.updatedAt }}</p>
              </div>
              <span
                class="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500"
        >
          <i class="pi pi-inbox mb-2 text-2xl"></i>
          <p class="text-sm">Chưa có hoạt động mượn sách nào.</p>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800">Sức khỏe hệ thống</h3>
        <div class="mt-4 rounded-xl p-4" :class="healthTone.bg">
          <p class="text-xs uppercase tracking-wide text-slate-500">Trạng thái</p>
          <p class="mt-1 text-xl font-bold" :class="healthTone.color">{{ healthTone.text }}</p>
          <p class="mt-1 text-sm text-slate-700">{{ healthTone.message }}</p>
        </div>

        <div class="mt-5 space-y-3 text-sm">
          <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span class="text-slate-600">Tỉ lệ mượn so với tổng đầu sách</span>
            <span class="font-bold text-slate-800">{{ ratioText }}</span>
          </div>
          <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span class="text-slate-600">Tổng phiếu mượn</span>
            <span class="font-bold text-slate-800">{{ numberFormat(statsRaw.loansTotal) }}</span>
          </div>
          <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span class="text-slate-600">Sách hết số lượng</span>
            <span class="font-bold text-rose-600">{{
              numberFormat(statsRaw.booksOutOfStock)
            }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold text-slate-800">Phân bố trạng thái phiếu mượn</h3>
      </div>

      <div
        v-if="statusDistribution.length"
        class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="item in statusDistribution"
          :key="item.status"
          class="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-4 py-3"
        >
          <p class="text-sm font-semibold text-slate-700">{{ item.status }}</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ numberFormat(item.count) }}</p>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
      >
        Chưa có dữ liệu trạng thái mượn để hiển thị.
      </div>
    </section>
  </div>
</template>
