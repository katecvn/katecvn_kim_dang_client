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
    label: 'Nháp',
    icon: Circle,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  {
    value: 'ordered',
    label: 'Đã đặt',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
]

const purchaseOrderPaymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
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