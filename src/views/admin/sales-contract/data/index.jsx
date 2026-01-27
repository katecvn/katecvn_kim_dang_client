import {
  IconRefreshDot,
  IconFileInvoiceFilled,
} from '@tabler/icons-react'
import { CheckCircleIcon, HandCoinsIcon, TruckIcon, XCircleIcon } from 'lucide-react'

const statuses = [
  {
    value: 'draft',
    label: 'Đang chờ',
    icon: IconRefreshDot,
    color: 'text-gray-500',
  },
  {
    value: 'confirmed',
    label: 'Đã xác nhận',
    icon: IconFileInvoiceFilled,
    color: 'text-blue-500',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircleIcon,
    color: 'text-red-500',
  },
]

const paymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    icon: IconRefreshDot,
    color: 'text-yellow-500',
  },
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    icon: HandCoinsIcon,
    color: 'text-blue-500',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
]

export { statuses, paymentStatuses }
