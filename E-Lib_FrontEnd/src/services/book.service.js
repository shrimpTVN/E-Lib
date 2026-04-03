import BaseService from './base.service.js'

class BookService extends BaseService {
  constructor(baseURL = '/api/books') {
    super(baseURL)
  }
}

export default new BookService()
