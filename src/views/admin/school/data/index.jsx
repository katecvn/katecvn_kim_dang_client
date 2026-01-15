import {
  IconAsteriskSimple,
  IconCircleCheck,
  IconLock,
} from '@tabler/icons-react'

const SCHOOL_STATUS = {
  0: 'inactive',
  1: 'active',
  2: 'other',
}

export const statuses = [
  {
    value: SCHOOL_STATUS[0],
    label: 'Khóa',
    icon: IconLock,
  },
  {
    value: SCHOOL_STATUS[1],
    label: 'Hoạt động',
    icon: IconCircleCheck,
  },
  {
    value: SCHOOL_STATUS[2],
    label: 'Khác',
    icon: IconAsteriskSimple,
  },
]

export const parentRolePermissionData = {
  data: [
    {
      roleName: 'standard',
      permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
    {
      roleName: 'advanced',
      permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    },
  ],
}

export const fileSizeList = [
  {
    label: 'MB',
    value: 'MB',
  },
  {
    label: 'GB',
    value: 'GB',
  },
  {
    label: 'TB',
    value: 'TB',
  },
]
