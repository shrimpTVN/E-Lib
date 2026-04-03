<script setup>
import { ref } from 'vue'

const props = defineProps({
  types: {
    type: Array,
    default: () => [],
  },
  authors: {
    type: Array,
    default: () => [],
  },
  publisherNames: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['filter'])

const selectedTypes = ref([])
const selectedAuthors = ref([])
const selectedPublishers = ref([])

const resolveText = (item) => {
  if (typeof item === 'string') return item
  if (!item || typeof item !== 'object') return ''
  return item.tenNXB || item.tenLoai || item.tacGia || item.name || item.label || item.value || ''
}

const handleFilter = () => {
  emit('filter', {
    types: selectedTypes.value,
    authors: selectedAuthors.value,
    publishers: selectedPublishers.value,
  })
}

const clearFilters = () => {
  selectedTypes.value = []
  selectedAuthors.value = []
  selectedPublishers.value = []
  handleFilter()
}
</script>

<template>
  <section class="h-full border-r border-slate-200 bg-gradient-to-b from-amber-50 to-orange-50 p-4">
    <h2 class="mb-4 text-lg font-semibold text-slate-800">Bộ lọc sách</h2>

    <div class="space-y-5">
      <div>
        <p class="mb-2 block text-sm font-semibold text-slate-700">Loại</p>
        <div
          class="max-h-36 space-y-2 overflow-auto rounded-md border border-slate-200 bg-white p-2"
        >
          <label
            v-for="type in props.types"
            :key="resolveText(type)"
            class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-amber-50"
          >
            <input
              v-model="selectedTypes"
              type="checkbox"
              :value="resolveText(type)"
              class="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              @change="handleFilter"
            />
            <span>{{ resolveText(type) }}</span>
          </label>
        </div>
      </div>

      <div>
        <p class="mb-2 block text-sm font-semibold text-slate-700">Tác giả</p>
        <div
          class="max-h-36 space-y-2 overflow-auto rounded-md border border-slate-200 bg-white p-2"
        >
          <label
            v-for="author in props.authors"
            :key="resolveText(author)"
            class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-amber-50"
          >
            <input
              v-model="selectedAuthors"
              type="checkbox"
              :value="resolveText(author)"
              class="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              @change="handleFilter"
            />
            <span>{{ resolveText(author) }}</span>
          </label>
        </div>
      </div>

      <div>
        <p class="mb-2 block text-sm font-semibold text-slate-700">Nhà xuất bản</p>
        <div
          class="max-h-36 space-y-2 overflow-auto rounded-md border border-slate-200 bg-white p-2"
        >
          <label
            v-for="publisher in props.publisherNames"
            :key="resolveText(publisher)"
            class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-amber-50"
          >
            <input
              v-model="selectedPublishers"
              type="checkbox"
              :value="resolveText(publisher)"
              class="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              @change="handleFilter"
            />
            <span>{{ resolveText(publisher) }}</span>
          </label>
        </div>
      </div>
    </div>

    <button
      class="mt-6 w-full rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      @click="clearFilters"
    >
      Xoa bo loc
    </button>
  </section>
</template>
