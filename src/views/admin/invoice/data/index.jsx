import {
  IconAlertTriangleFilled,
  IconExclamationCircle,
  IconFileInvoiceFilled,
  IconFilesOff,
  IconRefreshDot,
} from '@tabler/icons-react'
import { CheckCircleIcon, HandCoinsIcon, TruckIcon } from 'lucide-react'

const statuses = [
  {
    value: 'pending',
    label: 'Chờ duyệt',
    icon: IconRefreshDot,
    color: 'text-yellow-500',
  },
  {
    value: 'accepted',
    label: 'Đã duyệt',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    value: 'delivered',
    label: 'Đi đơn',
    icon: TruckIcon,
    color: 'text-blue-500',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: HandCoinsIcon,
    color: 'text-emerald-500',
  },
  // {
  //   value: 'rejected',
  //   label: 'Đã hủy',
  //   icon: XCircleIcon,
  //   color: 'text-red-500',
  // },
]

const attributes = {
  months: 'tháng',
  users: 'người dùng',
  orders: 'đơn hàng',
}

const eInvoiceStatuses = [
  {
    value: 'none',
    label: 'Chưa lập HĐĐT',
    icon: IconFilesOff,
    color: 'text-slate-400',
  },
  {
    value: 'draft',
    label: 'Nháp HĐĐT',
    icon: IconFileInvoiceFilled,
    color: 'text-blue-500',
  },
  {
    value: 'published',
    label: 'Đã phát hành HĐĐT',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    value: 'failed',
    label: 'Lập HĐĐT lỗi',
    icon: IconAlertTriangleFilled,
    color: 'text-red-500',
  },
  {
    value: 'canceled',
    label: 'HĐĐT đã hủy',
    icon: IconExclamationCircle,
    color: 'text-gray-500',
  },
]

const productTypeMap = {
  physical: 'vật lý',
  digital: 'phần mềm',
  service: 'dịch vụ',
}

export { statuses, attributes, eInvoiceStatuses, productTypeMap }
