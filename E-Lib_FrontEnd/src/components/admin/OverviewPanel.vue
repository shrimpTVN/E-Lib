<script setup>
const stats = [
  {
    id: 1,
    label: 'Người dùng',
    value: '1,240',
    cardClass: 'from-blue-50 to-white',
  },
  {
    id: 2,
    label: 'Sách',
    value: '3,560',
    cardClass: 'from-sky-50 to-white',
  },
  {
    id: 3,
    label: 'Nhà xuất bản',
    value: '158',
    cardClass: 'from-teal-50 to-white',
  },
  {
    id: 4,
    label: 'Phiếu mượn đang mở',
    value: '342',
    cardClass: 'from-amber-50 to-white',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="item in stats"
      :key="item.id"
      class="rounded-lg border border-slate-200 bg-gradient-to-br p-4 shadow-sm"
      :class="item.cardClass"
    >
      <p class="text-sm text-slate-500">{{ item.label }}</p>
      <p class="mt-2 text-2xl font-bold text-[#04156A]">{{ item.value }}</p>
    </article>
  </div>
</template>
