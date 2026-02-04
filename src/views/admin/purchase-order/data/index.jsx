import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import { IconBrandVisa, IconCash } from '@tabler/icons-react'

const attributes = {
  months: 'tháng',
  users: 'người dùng',
  orders: 'đơn hàng',
}

const purchaseOrderStatuses = [
  {
    value: 'draft',
    label: 'Chờ xác nhận',
    icon: Circle,
    color: 'text-gray-500',
  },
  {
    value: 'ordered',
    label: 'Đã đặt',
    icon: CheckCircle2,
    color: 'text-blue-500',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    color: 'text-red-500',
  },
]

const purchaseOrderPaymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    icon: XCircle,
    color: 'text-red-500',
  },
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    icon: Clock,
    color: 'text-yellow-500',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
]

const productTypeMap = {
  physical: 'vật lý',
  digital: 'phần mềm',
  service: 'dịch vụ',
}

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

export { attributes, purchaseOrderStatuses, purchaseOrderPaymentStatuses, productTypeMap, paymentMethods }