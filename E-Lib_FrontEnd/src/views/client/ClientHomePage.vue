<script setup></script>

<template>
  <section
    class="w-full min-h-screen bg-[url(https://res.cloudinary.com/depaiphq0/image/upload/v1775465864/BookXcess-by-Le-Yien-for-unsplash_z0r3qn.png)] mx-auto my-1 rounded-lg"
  >
    <div class="flex justify-center items-center h-full">
      <div class="mt-[10%] text-center bg-blue-950 bg-opacity-70 rounded-lg m-auto w-[50%] py-12">
        <h1 class="text-4xl font-bold text-center text-white">MỖI QUYỂN SÁCH LÀ MỘT CÁNH CỬA</h1>
        <h1 class="text-4xl font-bold text-center pt-4 text-white">ĐƯA TA ĐẾN CHÂN TRỜI MỚI</h1>
        <p class="text-center w-80 mx-auto pt-6 text-white">
          “Người đọc sống hàng nghìn cuộc đời trước khi chết; người không bao giờ đọc chỉ sống một
          cuộc đời.” – George R.R. Martin
        </p>
        <router-link
          to="/books"
          class="text-lg bg-white text-blue-800 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors mx-auto block mt-4 w-[38%] text-center"
        >
          <span> Khám phá toàn bộ sách</span>
          <i class="ml-2 pi pi-arrow-circle-right"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>
