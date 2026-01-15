const PRODUCT_SOURCE = [
  { id: 1, value: 'company', name: 'Công ty' },
  { id: 2, value: 'partner', name: 'Đối tác' },
  { id: 3, value: 'other', name: 'Khác' },
]

const PRODUCT_TYPE = [
  { id: 1, value: 'digital', name: 'Điện tử, kỹ thuật số' },
  { id: 2, value: 'physical', name: 'Vật lý' },
  { id: 3, value: 'service', name: 'Dịch vụ' },
]

const SALARY_COEFFICIENT_TYPE = [
  {
    id: 1,
    value: 'percentage',
    description: 'Theo phần trăm (%)',
  },
  {
    id: 2,
    value: 'multiplier',
    description: 'Theo cấp số nhân',
  },
]

const TAX_STATUS = {
  PUBLISHED: 'published',
  PENDING: 'pending',
  DRAFT: 'draft',
}

const CATEGORY_STATUS = {
  PUBLISHED: 'published',
  PENDING: 'pending',
  DRAFT: 'draft',
}

const matchAttributes = {
  none: 'không có đơn vị',
  pcs: 'cái',
  box: 'hộp',
  set: 'bộ',
  pack: 'gói',
  bottle: 'chai',
  roll: 'cuộn',
  kg: 'kg',
  g: 'gram',
  mg: 'miligram',
  l: 'lít',
  ml: 'mililít',
  m: 'mét',
  cm: 'centimét',
  mm: 'milimét',
  m2: 'mét vuông',
  m3: 'mét khối',
  hour: 'giờ',
  minute: 'phút',
  second: 'giây',
  percent: 'phần trăm (%)',
  slot: 'chỗ',
  months: 'tháng',
  years: 'năm',
  users: 'người dùng',
  orders: 'đơn hàng',
}

export {
  PRODUCT_SOURCE,
  PRODUCT_TYPE,
  SALARY_COEFFICIENT_TYPE,
  TAX_STATUS,
  CATEGORY_STATUS,
  matchAttributes,
}
