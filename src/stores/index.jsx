import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './AuthSlice'
import userReducer from './UserSlice'
import roleReducer from './RoleSlice'
import customerReducer from './CustomerSlice'
import productReducer from './ProductSlice'
import invoiceReducer from './InvoiceSlice'
import salesContractReducer from './SalesContractSlice'
import purchaseOrderReducer from './PurchaseOrderSlice'
import receiptReducer from './ReceiptSlice'
import categoryReducer from './CategorySlice'
import unitReducer from './UnitSlice'
import attributeReducer from './AttributeSlice'
import settingReducer from './SettingSlice'
import supplierReducer from './SupplierSlice'
import creditNoteReducer from './CreditNoteSlice'
import expiryReducer from './ExpirySlice'
import paymentReducer from './PaymentSlice'
import warrantyReducer from './WarrantySlice'
import productStockSnapshotReducer from './ProductStockSnapshotSlice'
import ticketReducer from './TicketSlice'
import ticketMessageReducer from './TicketMessageSlice'
import customerNoteReducer from './CustomerNoteSlice'
import customerTimelineReducer from './CustomerTimelineSlice'
import taxReducer from './TaxSlice'
import businessPlanReducer from './BusinessPlanSlice'
import crmReportReducer from './CrmReportSlice'
import statisticReducer from './StatisticSlice'
import notificationReducer from './NotificationSlice'
import taskReducer from './TaskSlice'
import schoolReducer from './SchoolSlice'
import positionReducer from './PositionSlice'
import permissionReducer from './PermissionSlice'
import parentRolePermissionReducer from './ParentAccountRolePermissionSlice'
import warehouseReceiptReducer from './WarehouseReceiptSlice'
import lotReducer from './LotSlice'

const persistConfig = { key: 'katec-vn', storage }

const persistedUserReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedUserReducer,
    user: userReducer,
    product: productReducer,
    position: positionReducer,
    role: roleReducer,
    supplier: supplierReducer,
    unit: unitReducer,
    customer: customerReducer,
    school: schoolReducer,
    category: categoryReducer,
    tax: taxReducer,
    attribute: attributeReducer,
    permission: permissionReducer,
    setting: settingReducer,
    parentRolePermission: parentRolePermissionReducer,
    invoice: invoiceReducer,
    salesContract: salesContractReducer,
    purchaseOrder: purchaseOrderReducer,
    receipt: receiptReducer,
    statistic: statisticReducer,
    payment: paymentReducer,
    businessPlan: businessPlanReducer,
    expiry: expiryReducer,
    notification: notificationReducer,
    creditNote: creditNoteReducer,
    warranty: warrantyReducer,
    productStockSnapshot: productStockSnapshotReducer,
    ticket: ticketReducer,
    ticketMessage: ticketMessageReducer,
    customerNote: customerNoteReducer,
    task: taskReducer,
    customerTimeline: customerTimelineReducer,
    crmReport: crmReportReducer,
    warehouseReceipt: warehouseReceiptReducer,
    lot: lotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
