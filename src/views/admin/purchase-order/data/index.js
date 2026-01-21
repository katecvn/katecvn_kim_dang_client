import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'

const attributes = {
  months: 'tháng',
  users: 'người dùng',
  orders: 'đơn hàng',
}

const statuses = [
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
    value: 'partial',
    label: 'Nhận một phần',
    icon: Clock,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    value: 'received',
    label: 'Đã nhận đủ',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-300',
  },
]

const productTypeMap = {
  physical: 'vật lý',
  digital: 'phần mềm',
  service: 'dịch vụ',
}

export { attributes, statuses, productTypeMap }