<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'

const props = defineProps({
  query: {
    type: String,
    default: '',
  },
})

const rows = [
  { id: 1, code: 'PM-2401', reader: 'Nguyen Van A', status: 'Đang mượn' },
  { id: 2, code: 'PM-2402', reader: 'Le Thi B', status: 'Chờ duyệt' },
  { id: 3, code: 'PM-2403', reader: 'Pham Van D', status: 'Đã trả' },
]

const statusSeverity = {
  'Đang mượn': 'warn',
  'Chờ duyệt': 'info',
  'Đã trả': 'success',
}

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
    <Column field="code" header="Mã phiếu mượn" sortable />
    <Column field="reader" header="Độc giả" sortable />
    <Column field="status" header="Trạng thái" sortable>
      <template #body="slotProps">
        <Tag
          :value="slotProps.data.status"
          :severity="statusSeverity[slotProps.data.status] || 'secondary'"
        />
      </template>
    </Column>
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
