import CategoryPage from '@/views/admin/category/CategoryPage'
import CustomerPage from '@/views/admin/customer/CustomerPage'
import DashboardPage from '@/views/admin/dashboard/DashboardPage'
import ExpiryPage from '@/views/admin/expiry/ExpiryPage'
import GoogleDriveCallback from '@/views/admin/google_drive/GoogleDriveCallback'
import InvoicePage from '@/views/admin/invoice/InvoicePage'
import MyInvoicePage from '@/views/admin/invoice/MyInvoicePage'
import SalesContractPage from '@/views/admin/sales-contract/SalesContractPage'
import MySalesContractPage from '@/views/admin/sales-contract/MySalesContractPage'
import PurchaseOrderPage from '@/views/admin/purchase-order/PurchaseOrderPage'
import MyPurchaseOrderPage from '@/views/admin/purchase-order/MyPurchaseOrderPage'
import ProductPage from '@/views/admin/product/ProductPage'
import MyReceiptPage from '@/views/admin/receipt/MyReceiptPage'
import ReceiptPage from '@/views/admin/receipt/ReceiptPage'
import PaymentPage from '@/views/admin/payment/PaymentPage'
import MyPaymentPage from '@/views/admin/payment/MyPaymentPage'
import RevenuePage from '@/views/admin/revenue/RevenuePage'
import RolePage from '@/views/admin/role/RolePage'
import AccessLogPage from '@/views/admin/setting/access-log/AccessLogPage'
import BusinessPlanPage from '@/views/admin/setting/business-plan/BusinessPlanPage'
import GeneralSettingPage from '@/views/admin/setting/general/GeneralSettingPage'
import NotificationPage from '@/views/admin/setting/notification/NotificationPage'
import SettingPage from '@/views/admin/setting/SettingPage'
import SharingRatioPage from '@/views/admin/setting/sharing-ratio/SharingRatioPage'
import SystemInformationPage from '@/views/admin/setting/system-information/SystemInformationPage'
import SupplierPage from '@/views/admin/supplier/SupplierPage'
import TaxPage from '@/views/admin/tax/TaxPage'
import UnitPage from '@/views/admin/unit/UnitPage'
import UserPage from '@/views/admin/user/UserPage'
import CallbackGoogle from '@/views/auth/components/CallbackGoogle'
import ForgotPasswordPage from '@/views/auth/ForgotPasswordPage'
import LoginPage from '@/views/auth/LoginPage'
import ResetPasswordPage from '@/views/auth/ResetPasswordPage'
import ErrorPage from '@/views/error/ErrorPage'
import AdminLayout from '@/views/layouts/AdminLayout'
import AuthLayout from '@/views/layouts/AuthLayout'
import ErrorLayout from '@/views/layouts/ErrorLayout'
import WarrantyPage from '@/views/admin/warranty/WarrantyPage'
import ProductStockSnapshotPage from '@/views/admin/product_stock_snapshot/ProductStockSnapshotPage'
import SInvoiceSettingPage from '@/views/admin/setting/s-invoice/SInvoiceSettingPage'
import AttributePage from '@/views/admin/attribute/AttributePage'
import TicketPage from '@/views/admin/ticket/TicketPage'
import TaskPage from '@/views/admin/task/TaskPage'
import WarehouseInPage from '@/views/admin/warehouse-receipt/WarehouseInPage'
import WarehouseOutPage from '@/views/admin/warehouse-receipt/WarehouseOutPage'

const routes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: AdminLayout,
  },
  {
    path: '/user',
    element: UserPage,
    layout: AdminLayout,
  },
  {
    path: '/customer',
    element: CustomerPage,
    layout: AdminLayout,
  },
  {
    path: '/category',
    element: CategoryPage,
    layout: AdminLayout,
  },
  {
    path: '/tax',
    element: TaxPage,
    layout: AdminLayout,
  },
  {
    path: '/supplier',
    element: SupplierPage,
    layout: AdminLayout,
  },
  {
    path: '/unit',
    element: UnitPage,
    layout: AdminLayout,
  },
  {
    path: '/product',
    element: ProductPage,
    layout: AdminLayout,
  },
  {
    path: '/product-stock-snapshot',
    element: ProductStockSnapshotPage,
    layout: AdminLayout,
  },
  {
    path: '/invoice',
    element: InvoicePage,
    layout: AdminLayout,
  },
  {
    path: '/sales-contracts',
    element: SalesContractPage,
    layout: AdminLayout,
  },
  {
    path: '/sales-contract-user',
    element: MySalesContractPage,
    layout: AdminLayout,
  },
  {
    path: '/invoice-user',
    element: MyInvoicePage,
    layout: AdminLayout,
  },
  {
    path: '/purchase-order',
    element: PurchaseOrderPage,
    layout: AdminLayout,
  },
  {
    path: '/purchase-order-user',
    element: MyPurchaseOrderPage,
    layout: AdminLayout,
  },
  {
    path: '/receipt',
    element: ReceiptPage,
    layout: AdminLayout,
  },
  {
    path: '/receipt-user',
    element: MyReceiptPage,
    layout: AdminLayout,
  },
  {
    path: '/payment',
    element: PaymentPage,
    layout: AdminLayout,
  },
  {
    path: '/payment-user',
    element: MyPaymentPage,
    layout: AdminLayout,
  },
  {
    path: '/expiry',
    element: ExpiryPage,
    layout: AdminLayout,
  },
  {
    path: '/warranty',
    element: WarrantyPage,
    layout: AdminLayout,
  },
  {
    path: '/auth/lesson-plan/google/callback',
    element: GoogleDriveCallback,
    layout: AdminLayout,
  },
  {
    path: '/revenue',
    element: RevenuePage,
    layout: AdminLayout,
  },
  {
    path: '/role-and-permissions',
    element: RolePage,
    layout: AdminLayout,
  },
  {
    path: '/attribute',
    element: AttributePage,
    layout: AdminLayout,
  },
  {
    path: '/ticket',
    element: TicketPage,
    layout: AdminLayout,
  },
  {
    path: '/task',
    element: TaskPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-in',
    element: WarehouseInPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-out',
    element: WarehouseOutPage,
    layout: AdminLayout,
  },
  {
    path: '/setting',
    element: SettingPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/general-information',
    element: GeneralSettingPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/sharing-ratio',
    element: SharingRatioPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/system-information',
    element: SystemInformationPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/access-log',
    element: AccessLogPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/notification',
    element: NotificationPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/business-plan',
    element: BusinessPlanPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/s-invoice',
    element: SInvoiceSettingPage,
    layout: AdminLayout,
  },
  {
    path: '/forgot-password',
    element: ForgotPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/reset-password',
    element: ResetPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/auth/google/callback',
    element: CallbackGoogle,
    layout: AuthLayout,
  },
  {
    path: '/',
    element: LoginPage,
    layout: AuthLayout,
  },
  {
    path: '*',
    element: ErrorPage,
    layout: ErrorLayout,
  },
]

export default routes
