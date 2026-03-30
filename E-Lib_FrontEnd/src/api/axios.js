import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_HOST,
})

// Trước khi gửi request, kiểm tra localStorage có token không
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
