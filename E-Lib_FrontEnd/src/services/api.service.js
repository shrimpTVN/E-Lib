import axios from 'axios'

const commonConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

export default (baseURL) => {
  const apiOrigin = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return axios.create({
    baseURL: `${apiOrigin}${baseURL}`,
    ...commonConfig,
  })
}
