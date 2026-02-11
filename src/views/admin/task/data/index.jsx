const taskPriorities = [
  { value: 'low', label: 'Thấp', variant: 'outline' },
  { value: 'normal', label: 'Trung bình', variant: 'secondary' },
  { value: 'high', label: 'Cao', variant: 'destructive' },
]

import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from 'lucide-react'

const taskStatuses = [
  {
    value: 'open',
    label: 'Mở',
    variant: 'default',
    icon: Circle,
    color: 'text-blue-500',
  },
  {
    value: 'in_progress',
    label: 'Đang xử lý',
    variant: 'secondary',
    icon: Loader2,
    color: 'text-yellow-500',
  },
  {
    value: 'done',
    label: 'Hoàn thành',
    variant: 'success',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    value: 'canceled',
    label: 'Hủy',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-gray-500',
  },
]

const priorityOptions = [
  { value: 'low', label: 'Thấp' },
  { value: 'normal', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
]

const statusOptions = [
  { value: 'open', label: 'Mở' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'canceled', label: 'Hủy' },
]

const channelOptions = [
  { value: 'phone', label: 'Điện thoại' },
  { value: 'email', label: 'Email' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'direct', label: 'Trực tiếp' },
]

export {
  taskPriorities,
  taskStatuses,
  priorityOptions,
  statusOptions,
  channelOptions,
}
