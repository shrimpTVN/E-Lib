import axios from 'axios'

const commonConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_HOST || 'http://localhost:3000/api',
  ...commonConfig,
  withCredentials: true, // ✅ Gửi cookie cùng mỗi request
})

export default instance
