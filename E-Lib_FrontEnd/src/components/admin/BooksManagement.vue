<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const props = defineProps({
  query: {
    type: String,
    default: '',
  },
})

const rows = [
  { id: 1, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', stock: 24 },
  { id: 2, title: 'Số Đỏ', author: 'Vũ Trọng Phụng', stock: 14 },
  { id: 3, title: 'Đất Rừng Phương Nam', author: 'Đoàn Giỏi', stock: 8 },
]

const filteredRows = computed(() => {
  const keyword = props.query.trim().toLowerCase()

  if (!keyword) return rows

  return rows.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(keyword)),
  )
})
</script>

<template>
  <DataTable
    :value="filteredRows"
    dataKey="id"
    paginator
    :rows="5"
    stripedRows
    class="overflow-hidden rounded-lg border border-slate-200"
    tableClass="text-sm"
  >
    <Column field="title" header="Tên sách" sortable />
    <Column field="author" header="Tác giả" sortable />
    <Column field="stock" header="Số lượng" sortable />
    <Column header="Hành động" :exportable="false" style="width: 8rem">
      <template #body>
        <Button icon="pi pi-ellipsis-v" severity="secondary" text rounded />
      </template>
    </Column>
    <template #empty>
      <div class="py-6 text-center text-sm text-slate-500">Không tìm thấy dữ liệu phù hợp.</div>
    </template>
  </DataTable>
</template>
