import BaseService from './base.service.js'

class BookService extends BaseService {
  constructor(baseURL = '/api/Sach') {
    super(baseURL)
  }
}

export default new BookService()
