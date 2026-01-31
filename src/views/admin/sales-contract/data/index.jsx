import {
  IconRefreshDot,
  IconFileInvoiceFilled,
  IconClockHour4,
  IconTruckDelivery,
  IconArchive,
} from '@tabler/icons-react'
import { CheckCircleIcon, HandCoinsIcon, XCircleIcon } from 'lucide-react'

const statuses = [
  {
    value: 'draft',
    label: 'Chờ xác nhận',
    icon: IconClockHour4,
    color: 'text-gray-500',
  },
  {
    value: 'confirmed',
    label: 'Chờ lấy hàng',
    icon: IconTruckDelivery,
    color: 'text-blue-500',
  },
  {
    value: 'completed',
    label: 'Đã giao hàng',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircleIcon,
    color: 'text-red-500',
  },
  {
    value: 'liquidated',
    label: 'Đã thanh lý',
    icon: IconArchive,
    color: 'text-red-500',
  }
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
