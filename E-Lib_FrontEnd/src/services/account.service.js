import BaseService from './base.service.js'

class AccountService extends BaseService {
  constructor(baseURL = '/api/TaiKhoan') {
    super(baseURL)
  }
}

export default new AccountService()
