import BaseService from './base.service.js'

class UserService extends BaseService {
  constructor(baseURL = '/api/DocGia') {
    super(baseURL)
  }
}

export default new UserService()
