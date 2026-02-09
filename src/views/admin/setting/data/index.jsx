import {
  IconBusinessplan,
  IconInfoSquareRounded,
  IconLogs,
  IconNotification,
  IconPercentage,
  IconReceiptDollar,
  IconSettings2,
} from '@tabler/icons-react'

const settings = [
  {
    name: 'Cài đặt thông tin cơ bản',
    icon: <IconSettings2 />,
    link: '/setting/general-information',
    action: 'Thiết lập',
    description:
      'Cài đặt thông tin cơ bản cho hệ thống (bao gồm tên, email, số điện thoại, địa chỉ, mã số thuế...)',
  },
  // {
  //   name: 'Tỉ lệ hưởng doanh số',
  //   icon: <IconPercentage />,
  //   link: '/setting/sharing-ratio',
  //   action: 'Thiết lập',
  //   description:
  //     'Cài đặt tỉ lệ hưởng doanh số cho các thành viên trong hệ thống',
  // },
  {
    name: 'Lịch sử đăng nhập',
    icon: <IconLogs />,
    link: '/setting/access-log',
    action: 'Quản lý',
    description: 'Xem lịch sử đăng nhập của bản thân mình',
  },
  // {
  //   name: 'Cài đặt thông báo',
  //   icon: <IconNotification />,
  //   link: '/setting/notification',
  //   action: 'Thiết lập',
  //   description:
  //     'Cài đặt nhận thông báo qua tin nhắn Zalo khi có đơn hàng mới, thông qua tài khoản ZaloOA (Official Account) của bạn, cũng như các kênh khác',
  // },
  {
    name: 'Thông tin hệ thống',
    icon: <IconInfoSquareRounded />,
    link: '/setting/system-information',
    action: 'Xem',
    description: 'Cài đặt thông tin hệ thống',
  },
  // {
  //   name: 'Kế hoạch kinh doanh',
  //   icon: <IconBusinessplan />,
  //   link: '/setting/business-plan',
  //   action: 'Quản lý',
  //   description:
  //     'Cài đặt kế hoạch kinh doanh theo từng năm, phân kỳ theo tháng',
  // },
  // {
  //   name: 'Hóa đơn điện tử Viettel',
  //   icon: <IconReceiptDollar />,
  //   link: '/setting/s-invoice',
  //   action: 'Thiết lập',
  //   description: 'Cài đặt kế cấu hình hóa đơn điện tử Viettel',
  // },
]

export { settings }
