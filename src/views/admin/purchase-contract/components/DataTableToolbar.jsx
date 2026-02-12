import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseContractStatuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { TruckIcon, EllipsisVertical, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useRef } from 'react'
import { DeleteMultiplePurchaseContractsDialog } from './DeleteMultiplePurchaseContractsDialog'
import { deleteMultiplePurchaseContracts } from '@/stores/PurchaseContractSlice'
import ContractReminderDialog from './ContractReminderDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getUsers } from '@/stores/UserSlice'
import { purchaseContractPaymentStatuses } from '../data'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  // const isMobile = useMediaQuery('(max-width: 768px)') 
  // Mobile layout in SalesContract was explicit but here we might just want responsive flex. 
  // The user asked to make it "like sales contract". Sales contract has explicit mobile check.
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [showReminderDialog, setShowReminderDialog] = useState(false)
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

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const handleDelete = async () => {
    const selectedIds = selectedContracts.map((inv) => inv.id)
    // Filter out contracts that are not draft
    const invalidContracts = selectedContracts.filter(inv => inv.status !== 'draft')

    if (invalidContracts.length > 0) {
      toast.error('Chỉ có thể xóa các hợp đồng ở trạng thái Nháp')
      return
    }

    try {
      await dispatch(deleteMultiplePurchaseContracts(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  // Sales Contract Mobile Layout
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
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {table.getColumn('status') && (
              <DataTableFacetedFilter
                column={table.getColumn('status')}
                title="Trạng thái"
                options={purchaseContractStatuses}
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
                  onClick={() => {
                    const selectedRows = table.getSelectedRowModel().rows
                    if (selectedRows.length === 0) {
                      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
                      return
                    }
                    setShowReminderDialog(true)
                  }}
                  className="text-xs text-blue-500"
                >
                  <TruckIcon className="mr-2 h-3 w-3" />
                  Gửi nhắc hàng
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const selectedRows = table.getSelectedRowModel().rows
                    if (selectedRows.length === 0) {
                      toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
                      return
                    }
                    const invalidContracts = selectedRows.filter(row => row.original.status !== 'draft')
                    if (invalidContracts.length > 0) {
                      toast.warning('Chỉ có thể xóa các hợp đồng ở trạng thái Nháp')
                      return
                    }
                    setShowDeleteDialog(true)
                  }}
                  className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <TrashIcon className="mr-2 h-3 w-3" />
                  Xóa ({table.getSelectedRowModel().rows.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showReminderDialog && (
              <ContractReminderDialog
                open={showReminderDialog}
                onOpenChange={setShowReminderDialog}
                selectedContracts={table.getSelectedRowModel().rows.map(r => r.original)}
              />
            )}

            <DeleteMultiplePurchaseContractsDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={handleDelete}
              count={table.getSelectedRowModel().rows.length}
            />
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ''} // Changed to global filter to match Sales Contract
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Filter theo người tạo */}
        {users && table.getColumn('user') && (
          <DataTableFacetedFilter
            column={table.getColumn('user')}
            title="Người tạo"
            options={users?.map((user) => ({
              value: user?.id,
              label: user?.fullName,
            }))}
          />
        )}

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={purchaseContractStatuses}
          />
        )}

        {table.getColumn('paymentStatus') && (
          <DataTableFacetedFilter
            column={table.getColumn('paymentStatus')}
            title="Thanh toán"
            options={purchaseContractPaymentStatuses}
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
        <Button
          className="text-blue-500 border-blue-500 hover:bg-blue-50"
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows
            if (selectedRows.length === 0) {
              toast.warning('Vui lòng chọn ít nhất 1 hợp đồng')
              return
            }
            setShowReminderDialog(true)
          }}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc hàng
        </Button>
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

        <DeleteMultiplePurchaseContractsDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedContracts.length}
        />

        <DataTableViewOptions table={table} />

        {showReminderDialog && (
          <ContractReminderDialog
            open={showReminderDialog}
            onOpenChange={setShowReminderDialog}
            selectedContracts={table.getSelectedRowModel().rows.map(r => r.original)}
          />
        )}
      </div>
    </div>
  )
}

export { DataTableToolbar }
