import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSliceReducer from './AuthSlice'
import userSliceReducer from './UserSlice'
import productSliceReducer from './ProductSlice'
import positionSliceReducer from './PositionSlice'
import roleSliceReducer from './RoleSlice'
import supplierSliceReducer from './SupplierSlice'
import unitSliceReducer from './UnitSlice'
import customerSliceReducer from './CustomerSlice'
import schoolSliceReducer from './SchoolSlice'
import categorySliceReducer from './CategorySlice'
import taxSliceReducer from './TaxSlice'
import attributeSliceReducer from './AttributeSlice'
import permissionSliceReducer from './PermissionSlice'
import settingSliceReducer from './SettingSlice'
import parentRolePermissionSliceReducer from './ParentAccountRolePermissionSlice'
import invoiceSliceReducer from './InvoiceSlice'
import receiptSliceReducer from './ReceiptSlice'
import statisticSliceReducer from './StatisticSlice'
import paymentSliceReducer from './PaymentSlice'
import businessPlansSliceReducer from './BusinessPlanSlice'
import expirySliceReducer from './ExpirySlice'
import notificationSliceReducer from './NotificationSlice'
import creditNoteSliceReducer from './CreditNoteSlice'
import warrantySliceReducer from './WarrantySlice'
import productStockSnapshotSlice from './ProductStockSnapshotSlice'
// ===== CRM slices =====
import ticketSliceReducer from './TicketSlice'
import ticketMessageSliceReducer from './TicketMessageSlice'
import customerNoteSliceReducer from './CustomerNoteSlice'
import taskSliceReducer from './TaskSlice'
import customerTimelineSliceReducer from './CustomerTimelineSlice'
import crmReportSliceReducer from './CrmReportSlice'

const persistConfig = { key: 'katec-vn', storage }

const persistedUserReducer = persistReducer(persistConfig, authSliceReducer)

export const store = configureStore({
  reducer: {
    auth: persistedUserReducer,
    user: userSliceReducer,
    product: productSliceReducer,
    position: positionSliceReducer,
    role: roleSliceReducer,
    supplier: supplierSliceReducer,
    unit: unitSliceReducer,
    customer: customerSliceReducer,
    school: schoolSliceReducer,
    category: categorySliceReducer,
    tax: taxSliceReducer,
    attribute: attributeSliceReducer,
    permission: permissionSliceReducer,
    setting: settingSliceReducer,
    parentRolePermission: parentRolePermissionSliceReducer,
    invoice: invoiceSliceReducer,
    receipt: receiptSliceReducer,
    statistic: statisticSliceReducer,
    payment: paymentSliceReducer,
    businessPlan: businessPlansSliceReducer,
    expiry: expirySliceReducer,
    notification: notificationSliceReducer,
    creditNote: creditNoteSliceReducer,
    warranty: warrantySliceReducer,
    productStockSnapshot: productStockSnapshotSlice,
    ticket: ticketSliceReducer,
    ticketMessage: ticketMessageSliceReducer,
    customerNote: customerNoteSliceReducer,
    task: taskSliceReducer,
    customerTimeline: customerTimelineSliceReducer,
    crmReport: crmReportSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
