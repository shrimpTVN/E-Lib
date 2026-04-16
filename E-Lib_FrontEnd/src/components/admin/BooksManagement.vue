<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios.js'
import { useAppToast } from '@/utils/useAppToast'
import Button from 'primevue/button'
import Column from 'primevue/column'
import IsLoading from '@/components/IsLoading.vue'
import Select from 'primevue/select'
import Paginator from 'primevue/paginator'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Image from 'primevue/image'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { sm } from '@primeuix/themes/aura/badge'

const { addToast } = useAppToast()

const books = ref([])
const publishers = ref([])

// fitler state
const publisherNames = ref([])
const types = ref([])
const authors = ref([])
const selectedPublisher = ref()
const selectedType = ref()
const selectedAuthor = ref()

// search state
const searchQuery = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestTimeout = null

// load book report
const isLoadedReport = ref(false)
const bookReport = ref(null)

const loading = ref(false)
const localQuery = ref('')
const selectedBook = ref(null)
const visibleDialog = ref(false)
const isLoading = ref(false)
const coverPreview = ref('')
const relatedPreviews = ref([])

const fallbackCover =
  'https://res.cloudinary.com/depaiphq0/image/upload/v1775474472/pngtree-an-open-book-is-shown-with-a-yellow-and-blue-logo-png-image_15675075_f99kmp.png'

// --- Trạng thái Phân trang (Pagination State) ---
const first = ref(0) // Vị trí index bắt đầu (PrimeVue sử dụng)
const rows = ref(12) // Số lượng sách trên 1 trang (limit)
const totalRecords = ref(0) // Tổng số sách thỏa mãn điều kiện (Backend phải trả về số này)

// ---Trạng thái Bộ lọc (Filter State) ---
const currentFilters = ref({ types: [], authors: [], publishers: [] })

const validationSchema = yup.object({
  tenSach: yup.string().required('Tên sách là bắt buộc').min(2, 'Tên sách phải có ít nhất 2 ký tự'),
  tacGia: yup.string().required('Tác giả là bắt buộc').min(2, 'Tác giả phải có ít nhất 2 ký tự'),
  moTa: yup.string().required('Mô tả là bắt buộc').min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  theLoai: yup.string().required('Thể loại là bắt buộc'),
  donGia: yup.number().typeError('Giá sách phải là số').required('Giá sách là bắt buộc').min(0),
  soLuong: yup
    .number()
    .typeError('Số lượng phải là số')
    .required('Số lượng là bắt buộc')
    .integer('Số lượng phải là số nguyên')
    .min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  namXuatBan: yup.string().required('Năm xuất bản là bắt buộc'),
  idNXB: yup.string().required('Nhà xuất bản là bắt buộc'),
  biaSach: yup.mixed().test('required-cover', 'Bìa sách là bắt buộc', (value) => {
    if (value instanceof File) return true
    return Boolean(selectedBook.value?.biaSach)
  }),
  hinhAnh: yup.array().of(yup.mixed()).max(5, 'Chỉ được tải tối đa 5 ảnh liên quan').default([]),
})

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    tenSach: '',
    tacGia: '',
    theLoai: '',
    moTa: '',
    donGia: 0,
    soLuong: 0,
    namXuatBan: '',
    idNXB: '',
    biaSach: null,
    hinhAnh: [],
  },
})

const { value: tenSach, errorMessage: tenSachError } = useField('tenSach')
const { value: tacGia, errorMessage: tacGiaError } = useField('tacGia')
const { value: moTa, errorMessage: moTaError } = useField('moTa')
const { value: donGia, errorMessage: donGiaError } = useField('donGia')
const { value: soLuong, errorMessage: soLuongError } = useField('soLuong')
const { value: namXuatBan, errorMessage: namXuatBanError } = useField('namXuatBan')
const { value: idNXB, errorMessage: idNXBError } = useField('idNXB')
const { value: biaSach, errorMessage: biaSachError } = useField('biaSach')
const { value: hinhAnh, errorMessage: hinhAnhError } = useField('hinhAnh')
const { value: theLoai, errorMessage: theLoaiError } = useField('theLoai')

const displayedRelatedImages = computed(() => {
  return relatedPreviews.value || []
})

const formatPrice = (value) => {
  const number = Number(value || 0)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number)
}

const stockSeverity = (remaining) => {
  const value = Number(remaining || 0)
  if (value <= 0) return 'secondary'
  if (value <= 3) return 'danger'
  if (value <= 5) return 'warn'

  return 'success'
}

// Khi Paginator thay đổi trang
const onPageChange = (event) => {
  first.value = event.first // Cập nhật vị trí bắt đầu mới
  rows.value = event.rows
  fetchBooks() // Gọi lại API để lấy dữ liệu của trang mới
}

// Khi người dùng chọn bộ lọc mới
const handleFilter = () => {
  fetchBooks() // Gọi lại API với điều kiện lọc mới
}

// Xử lý tắt gợi ý khi click ra ngoài input
const hideSuggestions = () => {
  // Dùng setTimeout nhỏ để sự kiện click vào gợi ý kịp chạy trước khi input mất focus
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Xử lý khi user nhấn Enter để tìm kiếm toàn bộ
const onSearchEnter = () => {
  showSuggestions.value = false // Ẩn gợi ý
  first.value = 0
  fetchBooks() // Gọi hàm fetchBooks đầy đủ
}

const onCoverChange = (event) => {
  const file = event.target.files?.[0] || null
  biaSach.value = file
  coverPreview.value = file ? URL.createObjectURL(file) : selectedBook.value?.biaSach || ''
}

const onRelatedChange = (event) => {
  const files = Array.from(event.target.files || [])
  console.log('Selected related images:', files)
  hinhAnh.value = [...(hinhAnh.value || []), ...files]
  console.log('Updated hinhAnh value:', hinhAnh.value)
  // Update related previews
  relatedPreviews.value = [
    ...(relatedPreviews.value || []),
    ...files.map((file) => URL.createObjectURL(file)),
  ]
}

const handleRemoveBookCover = () => {
  biaSach.value = null
  coverPreview.value = ''
}

const handleRemoveRelatedImage = (index) => {
  hinhAnh.value.splice(index, 1)
  relatedPreviews.value.splice(index, 1)
}

const openDialog = (book) => {
  // console.log('Selected book for editing:', book)
  selectedBook.value = book

  if (book) {
    coverPreview.value = book.biaSach || ''
    relatedPreviews.value = book.hinhAnh || []
    setValues({
      tenSach: book.tenSach || '',
      tacGia: book.tacGia || '',
      moTa: book.moTa || '',
      theLoai: book.theLoai || '',
      donGia: Number(book.donGia || 0),
      soLuong: Number(book.soLuong || 0),
      namXuatBan: book.namXuatBan || '',
      idNXB: book.idNXB?._id || book.idNXB || '',
      biaSach: book.biaSach || null,
      hinhAnh: book.hinhAnh || [],
    })
  } else {
    coverPreview.value = ''
    resetForm()
  }

  visibleDialog.value = true
}

const closeDialog = () => {
  selectedBook.value = null
  visibleDialog.value = false
  coverPreview.value = ''
  relatedPreviews.value = []
  isLoadedReport.value = false
  bookReport.value = null
  // URL.revokeObjectURL()
  resetForm()
}

const handleFormSubmit = handleSubmit(async (formData) => {
  isLoading.value = true
  try {
    const payload = new FormData()
    payload.append('tenSach', formData.tenSach)
    payload.append('tacGia', formData.tacGia)
    payload.append('theLoai', formData.theLoai)
    payload.append('moTa', formData.moTa)
    payload.append('donGia', String(formData.donGia))
    payload.append('soLuong', String(formData.soLuong))
    payload.append('namXuatBan', formData.namXuatBan)
    payload.append('idNXB', formData.idNXB)
    payload.append(
      'hinhAnh',
      JSON.stringify(formData.hinhAnh.filter((item) => typeof item === 'string')),
    )
    if (formData.biaSach instanceof File) {
      payload.append('biaSach', formData.biaSach)
    }

    formData.hinhAnh
      .filter((file) => file instanceof File)
      .forEach((file) => {
        payload.append('newHinhAnh', file)
      })

    if (formData.soLuong == 0) {
      payload.append('conLai', '0')
    }
    // console.log('Payload for submission:', payload)
    if (!selectedBook.value) {
      await api.post('/books', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      addToast('success', 'Thành công', 'Thêm sách mới thành công')
    } else {
      await api.patch(`/books/${selectedBook.value._id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      addToast('success', 'Thành công', 'Cập nhật sách thành công')
    }

    closeDialog()
    await fetchBooks()
  } catch (error) {
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu thông tin sách')
  } finally {
    isLoading.value = false
  }
})

// Hàm gọi API lấy gợi ý (Debounce ngắn: 300ms)
const fetchSuggestions = () => {
  clearTimeout(suggestTimeout)

  if (!searchQuery.value.trim()) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  suggestTimeout = setTimeout(async () => {
    try {
      const response = await api.get(`/books/suggestions?keyword=${searchQuery.value}`)
      suggestions.value = response.data
      showSuggestions.value = true
    } catch (error) {
      console.error('Lỗi tải gợi ý:', error)
    }
  }, 300)
}

// --- 3. Hàm gọi API trung tâm ---
const fetchBooks = async () => {
  isLoading.value = true
  try {
    // Tính toán số trang (page) hiện tại. Backend thường dùng index bắt đầu từ 1.
    const currentPage = Math.floor(first.value / rows.value) + 1

    // Định nghĩa các Query Parameters sẽ gửi lên Express
    const params = {
      page: currentPage,
      limit: rows.value,
      // Nối các mảng thành chuỗi phân cách bằng dấu phẩy (ví dụ: "Tiểu thuyết,Khoa học")
      keyword: searchQuery.value.trim(),
      types: selectedType.value ? selectedType.value + ',' : '',
      authors: selectedAuthor.value ? selectedAuthor.value + ',' : '',
      publishers: selectedPublisher.value ? selectedPublisher.value + ',' : '',
    }

    // Axios sẽ tự động chuyển object params thành query string:
    // GET /books?page=1&limit=12&types=...
    const response = await api.get('/books', { params })

    // Cập nhật danh sách sách cho trang hiện tại và tổng số record
    books.value = response.data.books
    totalRecords.value = response.data.totalRecords // QUAN TRỌNG: Backend cần tính và trả về giá trị này

    // Chỉ cập nhật danh sách các bộ lọc (publishers, types, authors) trong lần render đầu tiên
    // Nếu BE của bạn tách riêng API lấy danh sách filter, bạn nên tách ra hàm riêng.
    if (types.value.length === 0) {
      publisherNames.value = response.data.publisherNames || []
      types.value = response.data.types || []
      authors.value = response.data.authors || []
      console.log('Loaded filter options:', {
        publisherNames: publisherNames.value,
        types: types.value,
        authors: authors.value,
      })
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu sách:', err)
  } finally {
    isLoading.value = false
  }
}

const loadReport = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}/report`)
    bookReport.value = response.data
    console.log('Loaded book report:', bookReport.value)

    addToast('success', 'Thành công', 'Báo cáo sách đã được tải')
    isLoadedReport.value = true
  } catch (err) {
    console.error('Lỗi khi tải báo cáo sách:', err)
    addToast('error', 'Lỗi', 'Không thể tải báo cáo sách')
  }
}

const loadPublishers = async () => {
  try {
    const response = await api.get('/publishers')
    publishers.value = response.data || []
    console.log('Loaded publishers:', publishers.value)
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu nhà xuất bản:', err)
  }
}

// Gọi data lần đầu khi component được mount
onMounted(async () => {
  await fetchBooks()
  await loadPublishers()
})
</script>

<template>
  <div class="">
    <div class="header flex items-center justify-between">
      <!-- header right side -->
      <div class="flex justify-center text-sm">
        <Select
          v-model="selectedPublisher"
          :options="publisherNames"
          placeholder="NXB"
          showClear
          class="w-[7.6rem] mx-1 !text-sm"
          @change="handleFilter"
        />
        <Select
          v-model="selectedAuthor"
          :options="authors"
          placeholder="Tác giả"
          showClear
          class="w-[7.6rem] mx-1 text-sm"
          @change="handleFilter"
        />
        <Select
          v-model="selectedType"
          :options="types"
          placeholder="Thể loại"
          showClear
          class="w-[7.6rem] mx-1 text-sm"
          @change="handleFilter"
        />
      </div>
      <!-- header left side -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end px-2">
        <!-- search bar -->
        <div class="flex items-center justify-center mt-3">
          <div class="relative w-[24rem] h-[3.2rem] text-sm">
            <input
              v-model="searchQuery"
              @input="fetchSuggestions"
              @keyup.enter="onSearchEnter"
              @focus="showSuggestions = suggestions.length > 0"
              @blur="hideSuggestions"
              type="text"
              placeholder="Tìm kiếm theo tên, tác giả..."
              class="w-full rounded-md border border-slate-300 px-4 py-2 text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
            />
            <span
              class="absolute right-3 top-2 text-slate-400 px-2 py-1 rounded-md hover:bg-slate-200 cursor-pointer"
              @click="fetchSuggestions"
              ><i class="pi pi-search"></i
            ></span>

            <ul
              v-if="showSuggestions && suggestions.length > 0"
              class="absolute left-0 top-full mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl z-50 divide-y divide-slate-100"
            >
              <li
                v-for="book in suggestions"
                :key="book._id"
                @mousedown.prevent="goToBookDetail(book._id)"
                class="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 transition-colors"
              >
                <div
                  class="h-12 w-8 flex-shrink-0 bg-slate-100 flex items-center justify-center overflow-hidden rounded-sm"
                >
                  <img
                    v-if="book.biaSach"
                    :src="book.biaSach"
                    alt="Bìa"
                    class="h-full object-cover"
                  />
                  <span v-else class="text-xs">📚</span>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ book.tenSach }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ book.tacGia }}</p>
                </div>
              </li>

              <li class="p-2 text-center border-t border-slate-100">
                <span class="text-xs text-slate-400">Nhấn Enter để xem tất cả kết quả</span>
              </li>
            </ul>
          </div>
        </div>

        <Button
          label="Thêm sách mới"
          icon="pi pi-plus"
          class="h-10 border-none bg-blue-600 text-white hover:bg-blue-500"
          @click="openDialog(null)"
        ></Button>
      </div>
    </div>

    <DataTable
      :value="books"
      dataKey="_id"
      stripedRows
      removableSort
      :loading="loading"
      class="overflow-hidden rounded-lg border border-slate-200"
      tableClass="text-sm"
      :rowHover="true"
    >
      <Column header="Bìa sách" style="width: 110px">
        <template #body="slotProps">
          <Image
            :src="slotProps.data.biaSach || fallbackCover"
            alt="Bia sach"
            imageClass="h-16 w-12 rounded object-cover border border-slate-200"
            preview
          />
        </template>
      </Column>

      <Column field="tenSach" header="Tên sách" sortable />
      <Column field="tacGia" header="Tác giả" sortable />
      <Column field="idNXB.tenNXB" header="Nhà xuất bản" sortable />

      <Column field="conLai" header="Còn lại" sortable style="width: 120px">
        <template #body="slotProps">
          <Tag :severity="stockSeverity(slotProps.data.conLai)">
            {{ slotProps.data.conLai }} / {{ slotProps.data.soLuong }}
          </Tag>
        </template>
      </Column>

      <Column field="donGia" header="Giá tiền" sortable style="width: 180px">
        <template #body="slotProps">
          <span class="font-semibold text-slate-700">{{ formatPrice(slotProps.data.donGia) }}</span>
        </template>
      </Column>

      <Column header="Hành động" style="width: 120px">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            severity="secondary"
            text
            rounded
            @click="openDialog(slotProps.data)"
          ></Button>
        </template>
      </Column>

      <template #empty>
        <div class="py-6 text-center text-sm text-slate-500">Không tìm thấy dữ liệu phù hợp.</div>
      </template>
    </DataTable>
    <div class="my-4 w-full flex justify-center" v-show="totalRecords > 0">
      <Paginator
        v-model:first="first"
        :rows="rows"
        :totalRecords="totalRecords"
        @page="onPageChange"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        class="w-full mx-6"
      />
    </div>

    <Dialog
      v-model:visible="visibleDialog"
      :header="selectedBook ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới'"
      modal
      class="w-full max-w-5xl"
      @hide="closeDialog"
    >
      <Tabs value="0">
        <TabList>
          <Tab value="0">Thông tin</Tab>
          <Tab v-if="selectedBook" value="1">Thống kê</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <form
              class="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]"
              @submit.prevent="handleFormSubmit"
            >
              <div class="space-y-4 border-r border-slate-200 pr-4">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">
                    Bìa sách <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
                    @change="onCoverChange"
                  />
                  <small v-if="biaSachError" class="text-red-500">{{ biaSachError }}</small>
                  <div v-if="coverPreview" class="mt-3 relative">
                    <Image
                      :src="coverPreview"
                      alt="Cover preview"
                      imageClass="h-44 w-full rounded border border-slate-200 object-cover"
                      preview
                    />
                    <span
                      @click="handleRemoveBookCover"
                      class="cursor-pointer text-red-600 absolute top-0 left-0 bg-white p-1 opacity-80 hover:opacity-100 transition rounded"
                    >
                      <i class="pi pi-trash"></i>
                    </span>
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700"
                    >Ảnh liên quan (tối đa 5)</label
                  >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-slate-600 file:px-3 file:py-2 file:text-white"
                    @change="onRelatedChange"
                  />
                  <small v-if="hinhAnhError" class="text-red-500">{{ hinhAnhError }}</small>

                  <div v-if="displayedRelatedImages.length" class="mt-3 grid grid-cols-3 gap-1">
                    <div
                      class="images-container relative"
                      v-for="(image, index) in displayedRelatedImages"
                      :key="index"
                    >
                      <Image
                        :key="`${image}-${index}`"
                        :src="image"
                        alt="Related preview"
                        imageClass="h-26 w-full rounded border border-slate-200 object-cover relative"
                        preview
                      />
                      <span
                        @click="handleRemoveRelatedImage(index)"
                        class="cursor-pointer text-red-600 absolute top-0 left-0 bg-white opacity-80 hover:opacity-100 rounded transition p-1"
                      >
                        <i class="pi pi-trash"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-3 flex flex-col justify-start gap-2">
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Tên sách <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="tenSach"
                      placeholder="Nhập tên sách"
                      :invalid="Boolean(tenSachError)"
                    />
                    <small v-if="tenSachError" class="text-red-500">{{ tenSachError }}</small>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Tác giả <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="tacGia"
                      placeholder="Nhập tác giả"
                      :invalid="Boolean(tacGiaError)"
                    />
                    <small v-if="tacGiaError" class="text-red-500">{{ tacGiaError }}</small>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-sm font-semibold text-slate-700"
                    >Mô tả <span class="text-red-500">*</span></label
                  >
                  <textarea
                    v-model="moTa"
                    rows="4"
                    class="w-full rounded border border-slate-300 px-3 py-2"
                    :class="{ 'border-red-500': moTaError }"
                    placeholder="Nhập mô tả sách"
                  ></textarea>
                  <small v-if="moTaError" class="text-red-500">{{ moTaError }}</small>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Giá <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="donGia"
                      type="number"
                      min="0"
                      placeholder="Nhập giá"
                      :invalid="Boolean(donGiaError)"
                    />
                    <small v-if="donGiaError" class="text-red-500">{{ donGiaError }}</small>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Số lượng <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="soLuong"
                      type="number"
                      min="0"
                      placeholder="Nhập số lượng"
                      :invalid="Boolean(soLuongError)"
                    />
                    <small v-if="soLuongError" class="text-red-500">{{ soLuongError }}</small>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <!-- the loai -->
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Thể loại <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="theLoai"
                      placeholder="Nhập thể loại"
                      :invalid="Boolean(theLoaiError)"
                    />
                    <small v-if="theLoaiError" class="text-red-500">{{ theLoaiError }}</small>
                  </div>
                  <!-- nha xuat ban -->
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Nhà xuất bản <span class="text-red-500">*</span></label
                    >
                    <select
                      v-model="idNXB"
                      class="rounded border border-slate-300 px-3 py-2"
                      :class="{ 'border-red-500': idNXBError }"
                    >
                      <option value="">Chọn nhà xuất bản</option>
                      <option
                        v-for="publisher in publishers"
                        :key="publisher._id"
                        :value="publisher._id"
                      >
                        {{ publisher.tenNXB }}
                      </option>
                    </select>
                    <small v-if="idNXBError" class="text-red-500">{{ idNXBError }}</small>
                  </div>
                  <!-- nam xuat ban -->
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700"
                      >Năm xuất bản <span class="text-red-500">*</span></label
                    >
                    <InputText
                      v-model="namXuatBan"
                      type="number"
                      min="1000"
                      :invalid="Boolean(namXuatBanError)"
                    />
                    <small v-if="namXuatBanError" class="text-red-500">{{ namXuatBanError }}</small>
                  </div>
                </div>

                <div class="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    label="Hủy"
                    severity="secondary"
                    @click="closeDialog"
                  ></Button>
                  <Button
                    type="submit"
                    :label="selectedBook ? 'Lưu thông tin' : 'Thêm sách'"
                    :loading="isLoading"
                    :disabled="isLoading"
                  ></Button>
                </div>
              </div>
            </form>
          </TabPanel>
          <TabPanel v-if="selectedBook" value="1">
            <div class="loan-infor-container">
              <div class="loan-info min-h-[300px]">
                <h2>Thống kê số lượng các trạng thái mượn của sách</h2>
                <Button
                  v-if="!isLoadedReport"
                  severity="success"
                  class="mt-4 mx-auto"
                  label="Tải báo cáo"
                  @click="loadReport(selectedBook._id)"
                ></Button>

                <div
                  v-if="isLoadedReport"
                  class="mt-4 rounded border border-slate-200 bg-slate-50 p-4"
                >
                  <p>
                    <span class="text-slate-700 font-bold">Số lượng đang mượn:</span>
                    {{ bookReport.borrowingQuantity }}
                  </p>
                  <p>
                    <span class="text-slate-700 font-bold">Số lượng quá hạn:</span>
                    {{ bookReport.overdueQuantity }}
                  </p>
                  <p>
                    <span class="text-slate-700 font-bold">Số lượng đang chờ duyệt:</span>
                    {{ bookReport.registerQuantity }}
                  </p>
                  <p>
                    <span class="text-slate-700 font-bold">Số lượng đang chờ nhận:</span>
                    {{ bookReport.waitingQuantity }}
                  </p>
                  <p>
                    <span class="text-slate-700 font-bold">Số lượng mượn:</span>
                    {{ bookReport.loanQuantity }}
                  </p>
                </div>
              </div>
              <Button type="button" label="Đóng" severity="secondary" @click="closeDialog"></Button>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>
  </div>
</template>
