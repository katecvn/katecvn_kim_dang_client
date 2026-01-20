import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'

export const statuses = [
  {
    value: 'pending',
    label: 'Chờ duyệt',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    value: 'approved',
    label: 'Đã duyệt',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    value: 'received',
    label: 'Đã nhận hàng',
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
