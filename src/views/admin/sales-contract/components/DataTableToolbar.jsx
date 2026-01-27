import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { TruckIcon } from 'lucide-react'
import { useState } from 'react'
import DeliveryReminderDialog from '../../invoice/components/DeliveryReminderDialog'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses, paymentStatuses } from '../data'
import { toast } from 'sonner'
import { IconFileTypePdf } from '@tabler/icons-react'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import InstallmentPreviewDialog from '../../invoice/components/InstallmentPreviewDialog'
import { exportInstallmentWord } from '../../invoice/helpers/ExportInstallmentWord'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showDeliveryReminderDialog, setShowDeliveryReminderDialog] = useState(false)
  const [installmentData, setInstallmentData] = useState(null)
  const [installmentFileName, setInstallmentFileName] = useState('hop-dong-ban-hang.docx')
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false)
  const [installmentExporting, setInstallmentExporting] = useState(false)

  const handleShowDeliveryReminderDialog = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
      return
    }

    setShowDeliveryReminderDialog(true)
  }

  const handlePrintContract = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) hợp đồng để in')
      return
    }

    const contract = selectedRows[0].original

    // Chỉ cho phép in khi status = 'confirmed' (Đã xác nhận)
    if (contract.status !== 'confirmed') {
      toast.warning('Chỉ có thể in hợp đồng khi trạng thái là "Đã xác nhận"')
      return
    }

    try {
      // Get first invoice from the selected contract
      if (!contract.invoices || contract.invoices.length === 0) {
        toast.warning('Hợp đồng này không có hóa đơn')
        return
      }

      // Use the first invoice data to build installment data
      const invoiceData = {
        ...contract.invoices[0],
        salesContract: contract
      }

      const baseInstallmentData = await buildInstallmentData(invoiceData)

      setInstallmentData(baseInstallmentData)
      setInstallmentFileName(`hop-dong-ban-hang-${contract.code || 'contract'}.docx`)
      setShowInstallmentPreview(true)
    } catch (error) {
      console.error('Load installment data error:', error)
      toast.error('Không lấy được dữ liệu hợp đồng bán hàng')
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={statuses}
          />
        )}

        {table.getColumn('invoices') && (
          <DataTableFacetedFilter
            column={table.getColumn('invoices')}
            title="Thanh toán"
            options={paymentStatuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* In Hợp Đồng Bán Hàng */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={handlePrintContract}
          loading={installmentExporting}
        >
          <IconFileTypePdf className="mr-2 size-4" aria-hidden="true" />
          In Hợp Đồng Bán Hàng
        </Button>

        {installmentData && (
          <InstallmentPreviewDialog
            open={showInstallmentPreview}
            onOpenChange={(open) => {
              if (!open) {
                setShowInstallmentPreview(false)
              }
            }}
            initialData={installmentData}
            onConfirm={async (finalData) => {
              try {
                setInstallmentExporting(true)
                await exportInstallmentWord(finalData, installmentFileName)
                toast.success('Đã xuất hợp đồng bán hàng thành công')
                setShowInstallmentPreview(false)
                table.resetRowSelection()
              } catch (error) {
                console.error('Export installment error:', error)
                toast.error('Xuất hợp đồng bán hàng thất bại')
              } finally {
                setInstallmentExporting(false)
              }
            }}
          />
        )}

        {/* Gửi nhắc giao hàng */}
        <Button
          className=""
          variant="outline"
          size="sm"
          onClick={handleShowDeliveryReminderDialog}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc giao hàng
        </Button>

        {showDeliveryReminderDialog && (
          <DeliveryReminderDialog
            open={showDeliveryReminderDialog}
            onOpenChange={setShowDeliveryReminderDialog}
            selectedInvoices={table.getSelectedRowModel().rows.flatMap(row => 
              row.original.invoices.map(inv => ({
                ...inv,
                customer: row.original.customer,
                amount: inv.totalAmount,
                salesContract: row.original
              }))
            )}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
