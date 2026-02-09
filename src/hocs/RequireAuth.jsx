import ErrorPage from '@/views/error/ErrorPage'
import { Navigate } from 'react-router-dom'

const publicRoutes = [
  '/',
  '/forgot-password',
  '/reset-password',
  '/auth/google/callback',
  '*',
]

const privateRoutes = {
  '/dashboard': [],
  '/user': ['GET_USER'],
  '/customer': ['GET_CUSTOMER', 'GET_CUSTOMER_USER'],
  '/product': ['GET_PRODUCT'],
  '/tax': ['GET_TAX'],
  '/category': ['GET_CATEGORY'],
  '/school': ['GET_SCHOOL'],
  '/school-user': ['GET_SCHOOL_USER'],
  '/supplier': ['GET_SUPPLIER'],
  '/unit': ['GET_UNIT'],
  '/role-and-permissions': ['GET_ROLE'],
  '/invoice': ['GET_INVOICE'],
  '/invoice-user': ['GET_INVOICE_USER'],
  '/sales-contracts': ['SALES_CONTRACT_VIEW_ALL'],
  '/sales-contract-user': ['SALES_CONTRACT_VIEW_OWN', 'SALES_CONTRACT_VIEW_ALL'],
  '/purchase-order': ['PURCHASE_ORDER_VIEW_ALL'],
  '/purchase-order-user': ['PURCHASE_ORDER_VIEW_OWN', 'PURCHASE_ORDER_VIEW_ALL'],
  '/purchase-contracts': ['PURCHASE_CONTRACT_VIEW_ALL'],
  '/purchase-contract-user': ['PURCHASE_CONTRACT_VIEW_OWN', 'PURCHASE_CONTRACT_VIEW_ALL'],
  '/receipt': ['RECEIPT_VIEW_ALL'],
  '/receipt-user': ['RECEIPT_VIEW_OWN'],
  '/payment': ['PAYMENT_VIEW_ALL'],
  '/payment-user': ['PAYMENT_VIEW_OWN'],
  '/warehouse-in': ['WAREHOUSE_IMPORT_VIEW_ALL'],
  '/warehouse-out': ['WAREHOUSE_EXPORT_VIEW_ALL'],
  '/warehouse-report/summary': ['INVENTORY_NXT_VIEW'],
  '/warehouse-report/detail': ['INVENTORY_LEDGER_VIEW'],
  '/purchase-report': ['REPORT_PURCHASE_VIEW'],
  '/sales-backlog': ['REPORT_UNDELIVERED_VIEW'],
  '/purchase-backlog': ['REPORT_UNRECEIVED_VIEW'],
  '/system-log': ['GET_AUDIT_LOG'],
  '/ticket': ['GET_CUSTOMER_CARE'],
  '/task': ['GET_TASK'],
  '/attribute': ['GET_ATTRIBUTE'],
  '/setting': [],
  '/setting/general-information': ['GENERAL_SETTING'],
  '/setting/sharing-ratio': ['SHARING_RATIO_SETTING'],
  '/setting/system-information': ['SYSTEM_SETTING'],
  '/setting/access-log': ['SESSION_SETTING'],
  '/setting/notification': ['NOTIFICATION_SETTING'],
  '/setting/business-plan': [],
  '/revenue': ['GET_REPORT'],
  '/expiry': ['GET_EXPIRY', 'GET_EXPIRY_USER'],
  '/warranty': ['GET_WARRANTY'],
}

const RequireAuth = ({ component: Component, path, ...rest }) => {
  const isLoggedIn = !!localStorage.getItem('accessToken')
  const isPublicRoute = publicRoutes.includes(path)
  const userPermissions =
    JSON.parse(localStorage.getItem('permissionCodes')) || []

  if (!path) {
    return <Navigate to="/" />
  }

  const requiredPermissions = privateRoutes[path] || []
  if (!isPublicRoute && !isLoggedIn) {
    return <Navigate to="/" />
  }

  if (
    hasSufficientPermissions(userPermissions, requiredPermissions) ||
    isPublicRoute
  ) {
    return <Component {...rest} />
  }

  return (
    <ErrorPage
      code={403}
      message={'Từ chối truy cập'}
      description={'Opps!!! Có vẻ bạn đang cố truy cập tài nguyên trái phép 🙄'}
    />
  )
}

const hasSufficientPermissions = (userPermissions, requiredPermissions) => {
  if (requiredPermissions == null) return false

  if (Array.isArray(requiredPermissions)) {
    if (requiredPermissions.length === 0) return true
    return requiredPermissions.some((p) => userPermissions.includes(p)) // FIX
  }

  if (typeof requiredPermissions === 'string') {
    return requiredPermissions === ''
      ? true
      : userPermissions.includes(requiredPermissions)
  }

  return false
}

export default RequireAuth
