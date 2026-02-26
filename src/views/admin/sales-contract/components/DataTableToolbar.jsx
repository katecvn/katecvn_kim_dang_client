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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'

const DataTableToolbar = ({ table, isMyContract }) => {
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

    const invalidStatusContracts = selectedContracts.filter(
      (contract) => !['confirmed'].includes(contract.status)
    )

    if (invalidStatusContracts.length > 0) {
      toast.warning('Chỉ có thể gửi nhắc giao hàng cho hợp đồng ở trạng thái chờ lấy hàng')
      return
    }

    setShowDeliveryReminderDialog(true)
  }

  if (isMobile) {
    return (
      <div className="flex items-center justify-between gap-2">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm..."
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-full text-sm"
          />
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
              selectedInvoices={table.getSelectedRowModel().rows.flatMap(row => {
                const contract = row.original
                if (contract.invoices && contract.invoices.length > 0) {
                  return contract.invoices.map(inv => ({
                    ...inv,
                    customer: contract.customer,
                    amount: contract.totalAmount, // Map to contract's amount since invoice only has ID
                    salesContract: contract
                  }))
                }
                return []
              })}
            />
          )}
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

        {/* Filter theo người tạo */}
        {users && !isMyContract && table.getColumn('user') && (
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
            options={statuses}
          />
        )}

        {table.getColumn('paymentStatus') && (
          <DataTableFacetedFilter
            column={table.getColumn('paymentStatus')}
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
        {selectedContracts.length > 0 && (
          <Can permission="SALES_CONTRACT_DELETE">
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="mr-2 size-4" aria-hidden="true" />
              Xóa ({selectedContracts.length})
            </Button>
          </Can>
        )}

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
            selectedInvoices={table.getSelectedRowModel().rows.flatMap(row => {
              const contract = row.original
              if (contract.invoices && contract.invoices.length > 0) {
                return contract.invoices.map(inv => ({
                  ...inv,
                  customer: contract.customer,
                  amount: contract.totalAmount, // Map to contract's amount since invoice only has ID
                  salesContract: contract
                }))
              }
              return []
            })}
          />
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
