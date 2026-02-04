import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { DeleteReceiptDialog } from './DeleteReceiptDialog'
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
import PaymentQRCodeDialog from './PaymentQRCodeDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)
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
      <PaymentQRCodeDialog
        open={openQrDialog}
        onOpenChange={setOpenQrDialog}
        qrCodeData={qrCodeData}
      />

      {showDeleteReceiptDialog && (
        <DeleteReceiptDialog
          open={showDeleteReceiptDialog}
          onOpenChange={setShowDeleteReceiptDialog}
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
            <DropdownMenuItem onSelect={handleGenerateQR}>
              Tạo QR
              <DropdownMenuShortcut>
                <QrCode className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {(row.original.status === 'draft' ||
            row.original.status === 'cancelled' ||
            row.original.status === 'canceled') && (
              <DropdownMenuItem
                onSelect={() => setShowDeleteReceiptDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
