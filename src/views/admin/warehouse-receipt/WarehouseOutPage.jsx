import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WarehouseReceiptDataTable } from './components/WarehouseReceiptDataTable'
import { columns } from './components/Column'

const WarehouseOutPage = () => {
  const dispatch = useDispatch()
  const warehouseReceipts = useSelector(
    (state) => state.warehouseReceipt.warehouseReceipts,
  )
  const loading = useSelector((state) => state.warehouseReceipt.loading)

  // Filter only warehouse-out receipts (receiptType = 2)
  const warehouseOutReceipts = Array.isArray(warehouseReceipts)
    ? warehouseReceipts.filter((receipt) => receipt.receiptType === 2)
    : warehouseReceipts?.data
      ? warehouseReceipts.data.filter((receipt) => receipt.receiptType === 2)
      : []

  useEffect(() => {
    document.title = 'Danh sách phiếu xuất kho'
    dispatch(getWarehouseReceipts())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách phiếu xuất kho
            </h2>
            <p className="text-muted-foreground">
              Quản lý phiếu xuất kho cho khách hàng
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {warehouseOutReceipts && (
            <WarehouseReceiptDataTable
              data={warehouseOutReceipts}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default WarehouseOutPage
