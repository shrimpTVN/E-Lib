<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios.js'
import { useAppToast } from '@/utils/useAppToast'
import Button from 'primevue/button'
import Column from 'primevue/column'
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

const { addToast } = useAppToast()

const books = ref([])
const publishers = ref([])
const loading = ref(false)
const localQuery = ref('')
const selectedBook = ref(null)
const visibleDialog = ref(false)
const isLoading = ref(false)
const coverPreview = ref('')
const relatedPreviews = ref([])

const fallbackCover =
  'https://res.cloudinary.com/depaiphq0/image/upload/v1775474472/pngtree-an-open-book-is-shown-with-a-yellow-and-blue-logo-png-image_15675075_f99kmp.png'

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

const normalizedBooks = computed(() =>
  books.value.map((book) => ({
    ...book,
    biaSach: book.biaSach || fallbackCover,
    tenNXB: book.idNXB?.tenNXB || 'N/A',
  })),
)

const filteredBooks = computed(() => {
  const keyword = localQuery.value.trim().toLowerCase()
  if (!keyword) return normalizedBooks.value

  return normalizedBooks.value.filter((book) =>
    [book.tenSach, book.tacGia, book.tenNXB, book.theLoai]
      .join(' ')
      .toLowerCase()
      .includes(keyword),
  )
})

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
    await loadBooks()
  } catch (error) {
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu thông tin sách')
  } finally {
    isLoading.value = false
  }
})

const loadBooks = async () => {
  try {
    loading.value = true
    const res = await api.get('/books')
    books.value = Array.isArray(res.data?.books) ? res.data.books : []
  } catch (error) {
    addToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tải danh sách sách')
  } finally {
    loading.value = false
  }
}

const loadPublishers = async () => {
  try {
    const res = await api.get('/publishers')
    publishers.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    addToast('error', 'Lỗi', 'Không thể tải danh sách nhà xuất bản')
  }
}

onMounted(async () => {
  await Promise.all([loadBooks(), loadPublishers()])
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end px-2">
      <span class="p-input-icon-left w-full sm:w-80">
        <InputText
          v-model="localQuery"
          class="h-10 w-full"
          placeholder="Tìm theo tên sách, tác giả, NXB..."
        />
      </span>

      <Button
        label="Thêm sách mới"
        icon="pi pi-plus"
        class="h-10 border-none bg-blue-600 text-white hover:bg-blue-500"
        @click="openDialog(null)"
      ></Button>
    </div>

    <DataTable
      :value="filteredBooks"
      dataKey="_id"
      paginator
      :rows="12"
      :rowsPerPageOptions="[12, 24, 36]"
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
            :src="slotProps.data.biaSach"
            alt="Bia sach"
            imageClass="h-16 w-12 rounded object-cover border border-slate-200"
            preview
          />
        </template>
      </Column>

      <Column field="tenSach" header="Tên sách" sortable />
      <Column field="tacGia" header="Tác giả" sortable />
      <Column field="tenNXB" header="Nhà xuất bản" sortable />

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
          <Tab v-if="selectedBook" value="1">Ghi nhận</Tab>
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
                <h2>Thông tin mượn sách</h2>
              </div>
              <Button type="button" label="Đóng" severity="secondary" @click="closeDialog"></Button>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>
  </div>
</template>
