import { Cross2Icon } from '@radix-ui/react-icons'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import PaymentReminderDialog from './PaymentReminderDialog'
import { useState } from 'react'
import { BellIcon, QrCode } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { getReceiptQRCode } from '@/stores/ReceiptSlice'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { moneyFormat } from '@/utils/money-format'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getSelectedRowModel().rows
  const [openReminder, setOpenReminder] = useState(false)
  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const dispatch = useDispatch()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const canRemind = selectedRows.length === 1

  const handleGenerateQR = async () => {
    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) phiếu thu')
      return
    }

    const receipt = selectedRows[0].original

    if (receipt.status !== 'draft') {
      toast.warning('Chỉ có thể tạo mã QR cho phiếu thu nháp')
      return
    }

    try {
      setQrLoading(true)
      const qrData = await dispatch(getReceiptQRCode(receipt.id)).unwrap()
      setQrCodeData(qrData)
      setOpenQrDialog(true)
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
      toast.error('Không lấy được mã QR thanh toán')
    } finally {
      setQrLoading(false)
    }
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu thu..."
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 flex-1 text-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              disabled={!canRemind}
              onClick={() => setOpenReminder(true)}
              className="text-xs"
            >
              <BellIcon className="mr-2 h-3 w-3" />
              Nhắc hạn thanh toán
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={selectedRows.length !== 1 || selectedRows[0]?.original?.status !== 'draft'}
              onClick={handleGenerateQR}
              className="text-xs"
            >
              <QrCode className="mr-2 h-3 w-3" />
              Tạo QR thanh toán
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {canRemind && (
          <PaymentReminderDialog
            open={openReminder}
            onOpenChange={setOpenReminder}
            receipt={selectedRows[0].original}
          />
        )}

        <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mã QR Thanh Toán</DialogTitle>
              <DialogDescription>
                Quét mã QR để thanh toán {qrCodeData?.voucherCode}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-4 py-4">
              {qrCodeData?.qrLink ? (
                <>
                  <img
                    src={qrCodeData.qrLink}
                    alt="QR Code"
                    className="w-64 h-64 border rounded-lg"
                  />
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-primary">
                      {moneyFormat(qrCodeData.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {qrCodeData.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Đang tải mã QR...
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-center">
              <Button onClick={() => setOpenQrDialog(false)} className="w-full sm:w-auto">
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu thu..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

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

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!canRemind}
          onClick={() => setOpenReminder(true)}
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Nhắc hạn thanh toán
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={selectedRows.length !== 1 || selectedRows[0]?.original?.status !== 'draft'}
          onClick={handleGenerateQR}
          loading={qrLoading}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Tạo QR thanh toán
        </Button>
      </div>

      {canRemind && (
        <PaymentReminderDialog
          open={openReminder}
          onOpenChange={setOpenReminder}
          receipt={selectedRows[0].original}
        />
      )}

      <Dialog open={openQrDialog} onOpenChange={setOpenQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mã QR Thanh Toán</DialogTitle>
            <DialogDescription>
              Quét mã QR để thanh toán {qrCodeData?.voucherCode}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeData?.qrLink ? (
              <>
                <img
                  src={qrCodeData.qrLink}
                  alt="QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-primary">
                    {moneyFormat(qrCodeData.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {qrCodeData.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                Đang tải mã QR...
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setOpenQrDialog(false)} className="w-full sm:w-auto">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
