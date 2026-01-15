import {
  IconAdjustments,
  IconBox,
  IconBuildingStore,
  IconCalendar,
  IconCategory,
  IconDatabaseDollar,
  IconHeadset,
  IconLayoutDashboard,
  IconListCheck,
  IconReceipt,
  IconReceiptDollar,
  IconReceiptPound,
  IconReceiptRupee,
  IconReceiptTax,
  IconRulerMeasure2,
  IconSettings,
  IconShield,
  IconStack3Filled,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react'

export const sideLinks = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: <IconLayoutDashboard size={18} />,
    permission: 'GET_REPORT',
  },
  {
    title: 'Doanh thu',
    href: '/revenue',
    icon: <IconDatabaseDollar size={18} />,
    permission: 'GET_REPORT',
  },
  {
    title: 'Khách hàng & CSKH',
    icon: <IconUsers size={18} />,
    permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER', 'GET_CUSTOMER_CARE', 'GET_TASK'],
    sub: [
      {
        title: 'Danh sách khách hàng',
        href: '/customer',
        icon: <IconUsers size={18} />,
        permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER'],
      },
      {
        title: 'Phiếu hỗ trợ',
        href: '/ticket',
        icon: <IconHeadset size={18} />,
        permission: 'GET_CUSTOMER_CARE',
      },
      {
        title: 'Nhiệm vụ CSKH',
        href: '/task',
        icon: <IconListCheck size={18} />,
        permission: 'GET_TASK',
      },
    ],
  },

  {
    title: 'Sản phẩm & Kho',
    icon: <IconBox size={18} />,
    permission: [
      'GET_PRODUCT',
      'GET_STOCK',
      'GET_CATEGORY',
      'GET_ATTRIBUTE',
      'GET_UNIT',
      'GET_SUPPLIER',
    ],
    sub: [
      {
        title: 'Sản phẩm',
        href: '/product',
        icon: <IconBox size={18} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Kho sản phẩm',
        href: '/product-stock-snapshot',
        icon: <IconStack3Filled size={18} />,
        permission: 'GET_STOCK',
      },
      {
        title: 'Danh mục',
        href: '/category',
        icon: <IconCategory size={18} />,
        permission: 'GET_CATEGORY',
      },
      {
        title: 'Thuộc tính sản phẩm',
        href: '/attribute',
        icon: <IconAdjustments size={18} />,
        permission: 'GET_ATTRIBUTE',
      },
      {
        title: 'Đơn vị tính',
        href: '/unit',
        icon: <IconRulerMeasure2 size={18} />,
        permission: 'GET_UNIT',
      },
      {
        title: 'Nhà cung cấp',
        href: '/supplier',
        icon: <IconBuildingStore size={18} />,
        permission: 'GET_SUPPLIER',
      },
    ],
  },

  {
    title: 'Hóa đơn & Thu chi',
    icon: <IconReceiptDollar size={18} />,
    permission: ['GET_INVOICE', 'GET_RECEIPT', 'GET_TAX'],
    sub: [
      {
        title: 'Hóa đơn bán',
        href: '/invoice',
        icon: <IconReceiptDollar size={18} />,
        permission: 'GET_INVOICE',
      },
      {
        title: 'Hóa đơn của tôi',
        href: '/invoice-user',
        icon: <IconReceiptPound size={18} />,
        permission: ['GET_INVOICE_USER', 'GET_INVOICE'],
      },
      {
        title: 'Phiếu thu',
        href: '/receipt',
        icon: <IconReceipt size={18} />,
        permission: 'GET_RECEIPT',
      },
      {
        title: 'Phiếu thu của tôi',
        href: '/receipt-user',
        icon: <IconReceiptRupee size={18} />,
        permission: 'GET_RECEIPT_USER',
      },
      {
        title: 'Thuế',
        href: '/tax',
        icon: <IconReceiptTax size={18} />,
        permission: 'GET_TAX',
      },
    ],
  },

  {
    title: 'Sau bán hàng',
    icon: <IconShield size={18} />,
    permission: ['GET_WARRANTY', 'GET_EXPIRY_USER'],
    sub: [
      {
        title: 'Bảo hành',
        href: '/warranty',
        icon: <IconShield size={18} />,
        permission: 'GET_WARRANTY',
      },
      {
        title: 'Hạn sử dụng',
        href: '/expiry',
        icon: <IconCalendar size={18} />,
        permission: 'GET_EXPIRY_USER',
      },
    ],
  },

  {
    title: 'Người dùng & Phân quyền',
    icon: <IconUserCog size={18} />,
    permission: ['GET_USER', 'GET_ROLE', 'SESSION_SETTING'],
    sub: [
      {
        title: 'Danh sách người dùng',
        href: '/user',
        icon: <IconUserCog size={18} />,
        permission: 'GET_USER',
      },
      {
        title: 'Vai trò & Quyền',
        href: '/role-and-permissions',
        icon: <IconShield size={18} />,
        permission: 'GET_ROLE',
      },
      {
        title: 'Cài đặt hệ thống',
        href: '/setting',
        icon: <IconSettings size={18} />,
        permission: 'SESSION_SETTING',
      },
    ],
  },
]
