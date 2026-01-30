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
    title: 'Sản phẩm',
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
    title: 'Kho',
    icon: <IconBox size={18} />,
    permission: [
      'GET_STOCK',
    ],
    sub: [
      {
        title: 'Nhập kho',
        href: '/warehouse-in',
        icon: <IconBox size={18} />,
        permission: 'GET_WAREHOUSE_RECEIPT',
      },
      {
        title: 'Xuất kho',
        href: '/warehouse-out',
        icon: <IconBox size={18} />,
        permission: 'GET_WAREHOUSE_RECEIPT',
      },
      {
        title: 'Lô',
        href: '/lots',
        icon: <IconBox size={18} />,
        permission: 'GET_STOCK',
      },
    ],
  },

  {
    title: 'Đơn bán & Thu',
    icon: <IconReceiptDollar size={18} />,
    permission: ['GET_INVOICE', 'GET_RECEIPT', 'GET_TAX', 'GET_SALES_CONTRACT'],
    sub: [
      {
        title: 'Đơn bán',
        href: '/invoice',
        icon: <IconReceiptDollar size={18} />,
        permission: 'GET_INVOICE',
      },
      {
        title: 'Đơn bán của tôi',
        href: '/invoice-user',
        icon: <IconReceiptPound size={18} />,
        permission: ['GET_INVOICE_USER', 'GET_INVOICE'],
      },
      {
        title: 'Hợp đồng bán hàng',
        href: '/sales-contracts',
        icon: <IconReceipt size={18} />,
        permission: 'GET_SALES_CONTRACT',
      },
      {
        title: 'Hợp đồng của tôi',
        href: '/sales-contract-user',
        icon: <IconReceiptRupee size={18} />,
        permission: ['GET_SALES_CONTRACT_USER', 'GET_SALES_CONTRACT'],
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
    title: 'Đơn mua & Chi',
    icon: <IconReceiptDollar size={18} />,
    permission: ['GET_PURCHASE_ORDER', 'GET_PURCHASE_ORDER_USER'],
    sub: [
      {
        title: 'Đơn mua',
        href: '/purchase-order',
        icon: <IconReceiptDollar size={18} />,
        permission: 'GET_PURCHASE_ORDER',
      },
      {
        title: 'Đơn mua của tôi',
        href: '/purchase-order-user',
        icon: <IconReceiptPound size={18} />,
        permission: ['GET_PURCHASE_ORDER_USER', 'GET_PURCHASE_ORDER'],
      },
      {
        title: 'Hợp đồng mua hàng',
        href: '/purchase-contracts',
        icon: <IconReceipt size={18} />,
        permission: 'GET_PURCHASE_CONTRACT',
      },
      {
        title: 'Hợp đồng của tôi',
        href: '/purchase-contract-user',
        icon: <IconReceiptRupee size={18} />,
        permission: ['GET_PURCHASE_CONTRACT_USER', 'GET_PURCHASE_CONTRACT'],
      },
      {
        title: 'Phiếu chi',
        href: '/payment',
        icon: <IconReceipt size={18} />,
        permission: 'GET_RECEIPT',
      },
      {
        title: 'Phiếu chi của tôi',
        href: '/payment-user',
        icon: <IconReceiptRupee size={18} />,
        permission: 'GET_RECEIPT_USER',
      },
    ],
  },

  {
    title: 'Cài đặt',
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
        title: 'Hệ thống',
        href: '/setting',
        icon: <IconSettings size={18} />,
        permission: 'SESSION_SETTING',
      },
    ],
  },
]
