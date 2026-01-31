import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import InvoiceDialog from './InvoiceDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { toast } from 'sonner'
import CreateReceiptDialog from '../../receipt/components/CreateReceiptDialog'
import CreateSalesContractDialog from '../../sales-contract/components/CreateSalesContractDialog'
import PrintInvoiceView from './PrintInvoiceView'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { getUsers } from '@/stores/UserSlice'
import ExportInvoiceDialog from './ExportInvoiceDialog'
import { getCustomers } from '@/stores/CustomerSlice'
import { statuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical, TruckIcon } from 'lucide-react'
import DeliveryReminderDialog from './DeliveryReminderDialog'

const DataTableToolbar = ({ table, isMyInvoice }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false)

  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false)
  const [showCreateSalesContractDialog, setShowCreateSalesContractDialog] = useState(false)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([])
  const [selectedInvoices, setSelectedInvoices] = useState([])

  const [showDeliveryReminderDialog, setShowDeliveryReminderDialog] = useState(false)

  const navigate = useNavigate()

  // Auto-open invoice dialog when triggered from mobile cart button
  useEffect(() => {
    const shouldAutoOpen = localStorage.getItem('autoOpenInvoiceDialog')
    if (shouldAutoOpen === 'true') {
      setShowCreateInvoiceDialog(true)
      localStorage.removeItem('autoOpenInvoiceDialog')
    }
  }, [])

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const setting = useSelector((state) => state.setting.setting)
  const loading = useSelector((state) => state.setting.loading)
  const [invoice, setInvoice] = useState(null)

  const [showExportDialog, setShowExportDialog] = useState(false)

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
    dispatch(getCustomers())
  }, [dispatch])

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile Toolbar - Simplified
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search section */}
        <Input
          placeholder="Tìm mã HĐ hoặc tên KH"
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(e) => {
            table.getColumn('code')?.setFilterValue(e.target.value)
          }}
          className="h-8 w-full text-sm"
        />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Can permission={['CREATE_INVOICE']}>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setShowCreateInvoiceDialog(true)}
            >
              <PlusIcon className="mr-1 h-3 w-3" />
              Thêm
            </Button>
          </Can>

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setShowExportDialog(true)}
                className="text-xs"
              >
                <IconFileTypeXls className="mr-2 h-3 w-3" />
                Xuất file
              </DropdownMenuItem>

              {/* Gửi nhắc giao hàng */}
              <DropdownMenuItem
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                    return
                  }
                  setShowDeliveryReminderDialog(true)
                }}
                className="text-xs"
              >
                <TruckIcon className="mr-2 h-3 w-3" />
                Nhắc giao hàng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {showCreateInvoiceDialog && (
          <InvoiceDialog
            type="common_invoice"
            open={showCreateInvoiceDialog}
            onOpenChange={setShowCreateInvoiceDialog}
            showTrigger={false}
          />
        )}
        {showExportDialog && (
          <ExportInvoiceDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyInvoice={isMyInvoice}
          />
        )}
        {invoice && setting && (
          <PrintInvoiceView invoice={invoice} setting={setting} />
        )}
        {showCreateReceiptDialog && (
          <CreateReceiptDialog
            invoices={selectedInvoices}
            open={showCreateReceiptDialog}
            onOpenChange={setShowCreateReceiptDialog}
            showTrigger={false}
            table={table}
          />
        )}
        {showCreateSalesContractDialog && (
          <CreateSalesContractDialog
            invoiceIds={selectedInvoiceIds}
            open={showCreateSalesContractDialog}
            onOpenChange={setShowCreateSalesContractDialog}
            showTrigger={false}
            table={table}
          />
        )}

        {showDeliveryReminderDialog && (
          <DeliveryReminderDialog
            open={showDeliveryReminderDialog}
            onOpenChange={setShowDeliveryReminderDialog}
            selectedInvoices={table.getSelectedRowModel().rows.map((r) => r.original)}
          />
        )}
      </div>
    )
  }

  // Desktop Toolbar - Original
  return (
    <div className="space-y-3 w-full">
      {/* First row: Search inputs */}
      <div className="flex w-full flex-wrap items-center gap-2">
        <div className="flex items-center justify-center gap-1">
          <Input
            placeholder="Tìm theo mã HĐ"
            value={table.getColumn('code')?.getFilterValue() || ''}
            onChange={(e) =>
              table.getColumn('code')?.setFilterValue(e.target.value)
            }
            className="h-8 w-[100px] lg:w-[160px]"
          />
          <Input
            placeholder="Tìm theo tên KH, MST"
            value={table.getColumn('customer')?.getFilterValue() || ''}
            onChange={(event) =>
              table.getColumn('customer')?.setFilterValue(event.target.value)
            }
            className="h-8 w-[100px] lg:w-[200px]"
          />
        </div>
      </div>

      {/* Second row: Filters and actions */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {users && (
            <div className="flex gap-x-2">
              {table.getColumn('user') && (
                <DataTableFacetedFilter
                  column={table.getColumn('user')}
                  title="Người tạo"
                  options={users?.map((user) => ({
                    value: user?.id,
                    label: user?.fullName,
                  }))}
                />
              )}
            </div>
          )}

          {statuses && table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={statuses.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Đặt lại
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right side: Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 whitespace-nowrap">
          {/* Xuất Excel */}
          <Button
            className=""
            variant="outline"
            size="sm"
            loading={loading}
            onClick={() => setShowExportDialog(true)}
          >
            <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
            Xuất file Đơn Bán
          </Button>
          {showExportDialog && (
            <ExportInvoiceDialog
              open={showExportDialog}
              onOpenChange={setShowExportDialog}
              showTrigger={false}
              isMyInvoice={isMyInvoice}
            />
          )}

          {/* Gửi nhắc giao hàng */}
          <Button
            className=""
            variant="outline"
            size="sm"
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows
              if (selectedRows.length === 0) {
                toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                return
              }

              // Check if all selected invoices have salesContract
              const invoicesWithoutContract = selectedRows.filter(row => !row.original.salesContract)
              if (invoicesWithoutContract.length > 0) {
                toast.warning('Đơn hàng này không có sản phẩm cần giao')
                return
              }

              setShowDeliveryReminderDialog(true)
            }}
          >
            <TruckIcon className="mr-2 size-4" aria-hidden="true" />
            Gửi nhắc giao hàng
          </Button>

          {/* Tạo hóa đơn chung */}
          <Can permission={['CREATE_INVOICE']}>
            <Button
              className=""
              size="sm"
              onClick={() => setShowCreateInvoiceDialog(true)}
            >
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          </Can>

          {/* Dialog tạo hóa đơn chung */}
          {showCreateInvoiceDialog && (
            <InvoiceDialog
              type="common_invoice"
              open={showCreateInvoiceDialog}
              onOpenChange={setShowCreateInvoiceDialog}
              showTrigger={false}
            />
          )}

          {/* Dialog tạo phiếu thu */}
          {showCreateReceiptDialog && (
            <CreateReceiptDialog
              invoices={selectedInvoices}
              open={showCreateReceiptDialog}
              onOpenChange={setShowCreateReceiptDialog}
              showTrigger={false}
              table={table}
            />
          )}

          {/* Dialog tạo hợp đồng */}
          {showCreateSalesContractDialog && (
            <CreateSalesContractDialog
              invoiceIds={selectedInvoiceIds}
              open={showCreateSalesContractDialog}
              onOpenChange={setShowCreateSalesContractDialog}
              showTrigger={false}
              table={table}
            />
          )}

          {/* Dialog gửi nhắc giao hàng */}
          {showDeliveryReminderDialog && (
            <DeliveryReminderDialog
              open={showDeliveryReminderDialog}
              onOpenChange={setShowDeliveryReminderDialog}
              selectedInvoices={table.getSelectedRowModel().rows.map((r) => r.original)}
            />
          )}

          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}

export { DataTableToolbar }
