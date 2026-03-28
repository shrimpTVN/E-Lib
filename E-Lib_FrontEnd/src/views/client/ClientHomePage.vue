<script setup></script>

<template>
  <section class="w-full min-h-screen">
    <div class="bg-sky-400 w-[99%] h-[calc(100vh-82px)] mx-auto mt-1 rounded-lg">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-center pt-40">MỖI QUYỂN SÁCH LÀ MỘT CÁNH CỬA</h1>
        <h1 class="text-4xl font-bold text-center pt-4">ĐƯA TA ĐẾN CHÂN TRỜI MỚI</h1>
        <p class="text-center w-80 mx-auto pt-6">
          “Người đọc sống hàng nghìn cuộc đời trước khi chết; người không bao giờ đọc chỉ sống một
          cuộc đời.” – George R.R. Martin
        </p>
      </div>

      <router-link
        to="/books"
        class="bg-white text-blue-800 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors mx-auto block mt-4 w-[268px] text-center"
      >
        Khám phá toàn bộ sách <i class="pi pi-arrow-right"></i>
      </router-link>
    </div>
  </section>
</template>
