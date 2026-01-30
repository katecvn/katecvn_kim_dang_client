import {
  IconClockHour4,
  IconTruckDelivery,
  IconArchive,
} from '@tabler/icons-react'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'

const purchaseOrderStatuses = [
  {
    value: 'draft',
    label: 'Chờ xác nhận',
    icon: IconClockHour4,
    color: 'text-gray-500',
  },
  {
    value: 'confirmed',
    label: 'Đang giao hàng',
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


export { purchaseOrderStatuses }
