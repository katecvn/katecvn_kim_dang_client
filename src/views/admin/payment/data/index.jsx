import {
  IconCheck,
  IconCircleX,
  IconClock,
  IconFileText,
} from '@tabler/icons-react'

export const paymentStatus = [
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconFileText,
  },
  {
    value: 'completed',
    label: 'Đã chi',
    icon: IconCheck,
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconCircleX,
  },
]
