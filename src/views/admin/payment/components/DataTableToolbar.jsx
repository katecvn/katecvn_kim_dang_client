import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { deleteMultiplePayments } from '@/stores/PaymentSlice'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { DeleteMultiplePaymentVouchersDialog } from './DeleteMultiplePaymentVouchersDialog'
import { paymentStatus as paymentStatuses } from '../data'


export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedPaymentIds, setSelectedPaymentIds] = useState([])
  const [selectedPayments, setSelectedPayments] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const dispatch = useDispatch()

  useEffect(() => {
    const payments = selectedRows.map((row) => row.original)
    setSelectedPayments(payments)
    setSelectedPaymentIds(payments.map((inv) => inv.id))
  }, [selectedRows])

  const handleDelete = async () => {
    const selectedIds = selectedPayments.map((inv) => inv.id)
    // Filter out payments that are not draft or cancelled
    const invalidPayments = selectedPayments.filter(inv => !['draft', 'cancelled'].includes(inv.status))

    if (invalidPayments.length > 0) {
      toast.error('Chỉ có thể xóa các phiếu ở trạng thái Nháp hoặc Đã hủy')
      return
    }

    try {
      await dispatch(deleteMultiplePayments(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-0 sm:p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu chi..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-8 flex-1 lg:flex-none lg:w-[250px]"
        />

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
        {selectedPayments.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Xóa ({selectedPayments.length})
          </Button>
        )}

        <DeleteMultiplePaymentVouchersDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedPayments.length}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}


