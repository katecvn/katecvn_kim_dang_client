const taskPriorities = [
  { value: 'low', label: 'Thấp', variant: 'outline' },
  { value: 'normal', label: 'Trung bình', variant: 'secondary' },
  { value: 'high', label: 'Cao', variant: 'destructive' },
]

const taskStatuses = [
  { value: 'open', label: 'Mở', variant: 'default' },
  { value: 'in_progress', label: 'Đang xử lý', variant: 'secondary' },
  { value: 'done', label: 'Hoàn thành', variant: 'success' },
  { value: 'canceled', label: 'Hủy', variant: 'destructive' },
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
