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
  IconLogs,
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
        permission: 'SALES_CONTRACT_VIEW_ALL',
      },
      {
        title: 'Hợp đồng của tôi',
        href: '/sales-contract-user',
        icon: <IconReceiptRupee size={18} />,
        permission: ['SALES_CONTRACT_VIEW_OWN', 'SALES_CONTRACT_VIEW_ALL'],
      },
      {
        title: 'Phiếu thu',
        href: '/receipt',
        icon: <IconReceipt size={18} />,
        permission: 'RECEIPT_VIEW_ALL',
      },
      {
        title: 'Phiếu thu của tôi',
        href: '/receipt-user',
        icon: <IconReceiptRupee size={18} />,
        permission: 'RECEIPT_VIEW_OWN',
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
    permission: ['PURCHASE_ORDER_VIEW_ALL', 'PURCHASE_ORDER_VIEW_OWN'],
    sub: [
      {
        title: 'Đơn mua',
        href: '/purchase-order',
        icon: <IconReceiptDollar size={18} />,
        permission: 'PURCHASE_ORDER_VIEW_ALL',
      },
      {
        title: 'Đơn mua của tôi',
        href: '/purchase-order-user',
        icon: <IconReceiptPound size={18} />,
        permission: ['PURCHASE_ORDER_VIEW_OWN', 'PURCHASE_ORDER_VIEW_ALL'],
      },
      {
        title: 'Hợp đồng mua hàng',
        href: '/purchase-contracts',
        icon: <IconReceipt size={18} />,
        permission: 'PURCHASE_CONTRACT_VIEW_ALL',
      },
      {
        title: 'Hợp đồng của tôi',
        href: '/purchase-contract-user',
        icon: <IconReceiptRupee size={18} />,
        permission: ['PURCHASE_CONTRACT_VIEW_USER', 'PURCHASE_CONTRACT_VIEW_ALL'],
      },
      {
        title: 'Phiếu chi',
        href: '/payment',
        icon: <IconReceipt size={18} />,
        permission: 'PAYMENT_VIEW_ALL',
      },
      {
        title: 'Phiếu chi của tôi',
        href: '/payment-user',
        icon: <IconReceiptRupee size={18} />,
        permission: 'PAYMENT_VIEW_OWN',
      },

    ],
  },
  {
    title: 'Báo cáo',
    icon: <IconDatabaseDollar size={18} />,
    permission: ['GET_REPORT', 'REPORT_PURCHASE_VIEW', 'REPORT_UNDELIVERED_VIEW', 'REPORT_UNRECEIVED_VIEW'],
    sub: [
      {
        title: 'Doanh thu',
        href: '/revenue',
        icon: <IconDatabaseDollar size={18} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Báo cáo tiền mua',
        href: '/purchase-report',
        icon: <IconDatabaseDollar size={18} />,
        permission: 'REPORT_PURCHASE_VIEW',
      },
      {
        title: 'Đơn chưa giao',
        href: '/sales-backlog',
        icon: <IconReceipt size={18} />,
        permission: 'REPORT_UNDELIVERED_VIEW',
      },
      {
        title: 'Đơn chưa nhận',
        href: '/purchase-backlog',
        icon: <IconReceipt size={18} />,
        permission: 'REPORT_UNRECEIVED_VIEW',
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
      // {
      //   title: 'Kho sản phẩm',
      //   href: '/product-stock-snapshot',
      //   icon: <IconStack3Filled size={18} />,
      //   permission: 'GET_STOCK',
      // },
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
      'WAREHOUSE_IMPORT_VIEW_ALL',
    ],
    sub: [
      {
        title: 'Nhập kho',
        href: '/warehouse-in',
        icon: <IconBox size={18} />,
        permission: 'WAREHOUSE_IMPORT_VIEW_ALL',
      },
      {
        title: 'Xuất kho',
        href: '/warehouse-out',
        icon: <IconBox size={18} />,
        permission: 'WAREHOUSE_EXPORT_VIEW_ALL',
      },
      // {
      //   title: 'Lô',
      //   href: '/lots',
      //   icon: <IconBox size={18} />,
      //   permission: 'GET_STOCK',
      // },
      {
        title: ' Tổng hợp X-N-T',
        href: '/warehouse-report/summary',
        icon: <IconBox size={18} />,
        permission: 'INVENTORY_NXT_VIEW',
      },
      {
        title: 'Sổ chi tiết',
        href: '/warehouse-report/detail',
        icon: <IconBox size={18} />,
        permission: 'INVENTORY_LEDGER_VIEW',
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
        title: 'Nhật ký hệ thống',
        href: '/system-log',
        icon: <IconLogs size={18} />,
        permission: 'GET_AUDIT_LOG',
      },
      {
        title: 'Hệ thống',
        href: '/setting',
        icon: <IconSettings size={18} />,
        permission: 'GET_SETTING',
      },
    ],
  },
]
