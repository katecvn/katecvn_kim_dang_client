import { IconBrandVisa, IconCash, IconCircleCheck, IconCircleX, IconFileText } from '@tabler/icons-react'

const receiptStatus = [
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconFileText,
  },
  {
    value: 'completed',
    label: 'Đã thu',
    icon: IconCircleCheck,
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconCircleX
  },

]

const paymentMethods = [
  {
    value: 'cash',
    label: 'Tiền mặt',
    icon: IconCash,
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: IconBrandVisa,
  },
]

const debts = [
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    color: 'text-yellow-500',
  },
  {
    value: 'closed',
    label: 'Thanh toán toàn bộ',
    color: 'text-green-500',
  },
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    color: 'text-red-500',
  },
]

const paymentStatus = [
  {
    label: 'Đang chờ',
    color: 'text-yellow-500',
    value: 'pending',
  },
  {
    label: 'Đã thanh toán',
    color: 'text-green-500',
    value: 'success',
  },
]

export { paymentMethods, debts, paymentStatus, receiptStatus }
