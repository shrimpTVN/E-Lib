import { createRouter, createWebHistory } from 'vue-router'

import NotFoundPage from '@/views/NotFoundPage.vue'
import ClientLayout from '@/views/client/ClientLayout.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegistorForm.vue'

const clientRouter = [
  {
    path: '/',
    name: 'client-layout',
    component: ClientLayout,
    children: [
      {
        path: 'books',
        name: 'book-list-page',
        component: () => import('@/views/client/BookListPage.vue'),
      },
      {
        path: '',
        name: 'home-page',
        component: () => import('@/views/client/ClientHomePage.vue'),
      },
      {
        path: 'books/:id',
        name: 'book-detail-page',
        component: () => import('@/views/client/BookDetailPage.vue'),
      },
      {
        path: 'favorite',
        name: 'book-favorite-page',
        component: () => import('@/views/client/BookFavoritePage.vue'),
      },
      {
        path: 'borrow-history',
        name: 'borrow-history-page',
        component: () => import('@/views/client/BorrowHistoryPage.vue'),
      },
      {
        path: 'users/:id',
        name: 'user-infor-page',
        component: () => import('@/views/client/UserInforPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    props: {
      title: 'Đăng nhập',
      desc: 'Bạn cần tài khoản CTU để đăng nhập.',
      formType: LoginForm,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Login.vue'),
    props: {
      title: 'Đăng ký',
      desc: 'Trang này giúp bạn tạo tài khoản. Vui lòng cung cấp đầy đủ thông tin.',
      formType: RegisterForm,
    },
  },
]

const adminRouter = [
  {
    path: '/admin/dashboard',
    name: 'admin-home-page',
    component: () => import('../views/admin/DashBoard.vue'),
    children: [],
  },
]

const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found-page',
    component: NotFoundPage,
  },
  ...clientRouter,
  ...adminRouter,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})
export default router
