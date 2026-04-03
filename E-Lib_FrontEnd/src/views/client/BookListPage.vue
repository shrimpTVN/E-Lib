<script setup>
import BookFilter from '@/components/BookFilter.vue'
import BookList from '@/components/BookList.vue'
import BookService from '@/services/book.service'
import IsLoading from '@/components/IsLoading.vue'
import { ref, onMounted } from 'vue'

const books = ref([])
const filteredBooks = ref([])
const publisherNames = ref([])
const types = ref([])
const authors = ref([])

const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await BookService.getAll()
    books.value = response.data
    filteredBooks.value = response.data
    publisherNames.value = response.publisherNames
    types.value = response.types
    authors.value = response.authors
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value = false
  }
})

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const handleFilter = ({ types = [], authors = [], publishers = [] }) => {
  filteredBooks.value = books.value.filter((book) => {
    const normalizedType = normalizeText(book.theLoai)
    const normalizedAuthor = normalizeText(book.tacGia)
    const normalizedPublisher = normalizeText(book.idNXB?.tenNXB || book.tenNXB || book.nhaXuatBan)

    const matchedType =
      !types.length || types.some((type) => normalizeText(type) === normalizedType)
    const matchedAuthor =
      !authors.length || authors.some((author) => normalizeText(author) === normalizedAuthor)
    const matchedPublisher =
      !publishers.length ||
      publishers.some((publisher) => normalizeText(publisher) === normalizedPublisher)

    return matchedType && matchedAuthor && matchedPublisher
  })
}
</script>

<template>
  <IsLoading v-if="isLoading"></IsLoading>
  <section v-else class="grid grid-cols-[20%_80%]">
    <BookFilter
      :publisher-names="publisherNames"
      :types="types"
      :authors="authors"
      @filter="handleFilter"
    >
    </BookFilter>
    <BookList class="border-l border-black" :books="filteredBooks"> </BookList>
  </section>
</template>
