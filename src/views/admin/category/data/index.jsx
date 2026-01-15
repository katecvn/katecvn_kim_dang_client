import { IconCircleCheck, IconLock } from '@tabler/icons-react'

export const statuses = [
  {
    value: 'published',
    label: 'Cho phép sử dụng',
    icon: IconCircleCheck,
  },
  {
    value: 'pending',
    label: 'Chưa sẵn dùng',
    icon: IconLock,
  },
]

export const types = [
  {
    value: 'company',
    label: 'Công ty',
  },
  {
    value: 'partner',
    label: 'Đối tác',
  },
]

export const PRODUCT_SOURCE = [
  { id: 1, value: 'company', name: 'Công ty' },
  { id: 2, value: 'partner', name: 'Đối tác' },
  { id: 3, value: 'other', name: 'Khác' },
]

export const PRODUCT_TYPE = [
  { id: 1, value: 'digital', name: 'Điện tử, kỹ thuật số' },
  { id: 2, value: 'physical', name: 'Vật lý' },
]
