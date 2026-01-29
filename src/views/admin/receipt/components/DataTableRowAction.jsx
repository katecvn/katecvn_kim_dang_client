import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconTrash, IconCircleX } from '@tabler/icons-react'
import { useState } from 'react'
import { DeleteReceiptDialog } from './DeleteReceiptDialog'
import { CancelReceiptDialog } from './CancelReceiptDialog'
import { useDispatch } from 'react-redux'
import { getReceiptQRCode } from '@/stores/ReceiptSlice'
import { toast } from 'sonner'
import { moneyFormat } from '@/utils/money-format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QrCode } from 'lucide-react'

const DataTableRowActions = ({ row }) => {
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)
  const [showCancelReceiptDialog, setShowCancelReceiptDialog] = useState(false)
  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const dispatch = useDispatch()

  const handleGenerateQR = async () => {
    const receipt = row.original
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

  return (
    <>
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

      {showDeleteReceiptDialog && (
        <DeleteReceiptDialog
          open={showDeleteReceiptDialog}
          onOpenChange={setShowDeleteReceiptDialog}
          receipt={row.original}
          showTrigger={false}
        />
      )}

      {showCancelReceiptDialog && (
        <CancelReceiptDialog
          open={showCancelReceiptDialog}
          onOpenChange={setShowCancelReceiptDialog}
          receipt={row.original}
          showTrigger={false}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {row.original.status === 'draft' && (
            <>
              <DropdownMenuItem onSelect={handleGenerateQR}>
                Tạo QR
                <DropdownMenuShortcut>
                  <QrCode className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => setShowDeleteReceiptDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}

          {row.original.status === 'completed' && (
            <DropdownMenuItem
              onSelect={() => setShowCancelReceiptDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              Hủy
              <DropdownMenuShortcut>
                <IconCircleX className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
