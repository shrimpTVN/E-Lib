import BaseService from './base.service.js'

class PublisherService extends BaseService {
  constructor(baseURL = '/api/NhaXuatBan') {
    super(baseURL)
  }
}

export default new PublisherService()
