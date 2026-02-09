import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { TruckIcon, EllipsisVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DeleteMultipleSalesContractsDialog } from './DeleteMultipleSalesContractsDialog'
import { deleteMultipleSalesContracts } from '@/stores/SalesContractSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import DeliveryReminderDialog from '../../invoice/components/DeliveryReminderDialog'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { statuses, paymentStatuses } from '../data'
import { toast } from 'sonner'
import { buildInstallmentData } from '../../invoice/helpers/BuildInstallmentData'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { useDispatch } from 'react-redux'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showDeliveryReminderDialog, setShowDeliveryReminderDialog] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [selectedContractIds, setSelectedContractIds] = useState([])
  const [selectedContracts, setSelectedContracts] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const dispatch = useDispatch()

  useEffect(() => {
    const contracts = selectedRows.map((row) => row.original)
    setSelectedContracts(contracts)
    setSelectedContractIds(contracts.map((inv) => inv.id))
  }, [selectedRows])

  const handleDelete = async () => {
    const selectedIds = selectedContracts.map((inv) => inv.id)
    // Filter out contracts that are not draft
    const invalidContracts = selectedContracts.filter(inv => inv.status !== 'draft')

    if (invalidContracts.length > 0) {
      toast.error('Chỉ có thể xóa các hợp đồng ở trạng thái Nháp')
      return
    }

    try {
      await dispatch(deleteMultipleSalesContracts(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleShowDeliveryReminderDialog = () => {
    if (selectedRows.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
      return
    }

    setShowDeliveryReminderDialog(true)
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search */}
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-full text-sm"
        />

        <div className="flex justify-between gap-2">
          {/* Filters can go here if needed, or simplified */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title="Trạng thái"
                options={statuses}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleShowDeliveryReminderDialog}
                  className="text-xs text-blue-500"
                >
                  <TruckIcon className="mr-2 h-3 w-3" />
                  Gửi nhắc giao hàng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
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

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">


        {/* Gửi nhắc giao hàng */}
        <Button
          className="text-blue-500 border-blue-500 hover:bg-blue-50"
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

        {selectedContracts.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa ({selectedContracts.length})
          </Button>
        )}

        <DeleteMultipleSalesContractsDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedContracts.length}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
