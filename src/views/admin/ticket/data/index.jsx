import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ArrowDown,
  Minus,
  ArrowUp,
  Phone,
  Mail,
  MessageSquare,
  Monitor
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
  { value: 'low', label: 'Thấp', icon: ArrowDown, color: 'text-green-600' },
  { value: 'normal', label: 'Trung bình', icon: Minus, color: 'text-blue-600' },
  { value: 'high', label: 'Cao', icon: ArrowUp, color: 'text-red-600' },
]

export const ticketChannels = [
  { value: 'phone', label: 'Điện thoại', icon: Phone, color: 'text-slate-600' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-slate-600' },
  { value: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-slate-600' },
  { value: 'portal', label: 'Portal', icon: Monitor, color: 'text-slate-600' },
]
