import BaseService from './base.service.js'

class FavoriteService extends BaseService {
  constructor(baseURL = '/api/DanhSachYeuThich') {
    super(baseURL)
  }
}

export default new FavoriteService()
