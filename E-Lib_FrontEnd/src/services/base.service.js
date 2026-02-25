import createApiClient from './api.service.js'

class BaseService {
  constructor(baseURL = '') {
    this.api = createApiClient(baseURL)
  }

  async create(data) {
    return (await this.api.post('/', data)).data
  }

  async getAll() {
    return (await this.api.get('/')).data
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data
  }

  async update(id, data) {
    return await this.api.put(`/${id}`, data)
  }

  async deleteAll() {
    return (await this.api.delete('/')).data
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data
  }
}

export default BaseService
