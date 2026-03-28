import { createRouter, createWebHistory } from 'vue-router'

import AdminHomePage from '@/views/admin/AdminHomePage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import ClientLayout from '@/views/client/ClientLayout.vue'

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
]

const adminRouter = [
  {
    path: '/admin',
    name: 'admin-home-page',
    component: AdminHomePage,
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
