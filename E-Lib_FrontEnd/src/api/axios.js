import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_HOST || 'http://localhost:3000/api',
  withCredentials: true, // ✅ Gửi cookie cùng mỗi request
})

export default instance
