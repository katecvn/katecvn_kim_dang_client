import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from 'lucide-react'

export const ticketStatuses = [
  {
    value: 'open',
    label: 'Đang mở',
    variant: 'default',
    icon: Circle,
    color: 'text-blue-500',
  },
  {
    value: 'in_progress',
    label: 'Đang xử lý',
    variant: 'outline',
    icon: Loader2,
    color: 'text-yellow-500',
  },
  {
    value: 'resolved',
    label: 'Đã xử lý',
    variant: 'secondary',
    icon: CheckCircle2,
    color: 'text-green-500',
  },
  {
    value: 'closed',
    label: 'Đã đóng',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-gray-500',
  },
]

export const ticketPriorities = [
  { value: 'low', label: 'Thấp', variant: 'outline' },
  { value: 'normal', label: 'Trung bình', variant: 'secondary' },
  { value: 'high', label: 'Cao', variant: 'default' },
]

export const ticketChannels = [
  { value: 'phone', label: 'Điện thoại', variant: 'outline' },
  { value: 'email', label: 'Email', variant: 'outline' },
  { value: 'chat', label: 'Chat', variant: 'outline' },
  { value: 'portal', label: 'Portal', variant: 'outline' },
]
