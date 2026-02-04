import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { IconPlus } from '@tabler/icons-react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import { Separator } from '@/components/ui/separator'

const MobileInvoiceActions = ({
  invoice,
  isDesktop,
  canDelete,
  onEdit,
  handleCreateReceipt,
  handleCreateWarehouseReceipt,
  handlePrintInvoice,
  handlePrintAgreement,
  handlePrintContract,
  handleDeleteInvoice,
}) => {
  const [open, setOpen] = useState(false)

  if (isDesktop || !invoice) return null

  const handleAction = (action) => {
    setOpen(false)
    action()
  }

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg !z-[100020]"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="!z-[100020] px-4 pb-6 pt-4 rounded-t-xl max-h-[80vh] overflow-y-auto"
          overlayClassName="!z-[100019]"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Thao tác đơn hàng</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            {/* Receipt & Warehouse Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-green-600 text-white hover:bg-green-700 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handleCreateReceipt)}
              >
                <IconPlus className="h-5 w-5" />
                <span className="text-xs">Tạo Phiếu Thu</span>
              </Button>
              <Button
                className="bg-orange-600 text-white hover:bg-orange-700 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handleCreateWarehouseReceipt)}
              >
                <IconPlus className="h-5 w-5" />
                <span className="text-xs">Tạo Phiếu Xuất Kho</span>
              </Button>
            </div>

            <Separator />

            {/* Print Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">In ấn</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintInvoice)}
                >
                  In Hóa Đơn
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintAgreement)}
                >
                  In Thỏa Thuận
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintContract)}
                >
                  In Hợp Đồng
                </Button>
              </div>
            </div>

            <Separator />

            {/* Edit/Delete Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  if (invoice.status !== 'pending') {
                    toast.warning('Chỉ có thể sửa đơn hàng ở trạng thái chờ duyệt')
                    return
                  }
                  handleAction(onEdit)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Sửa
              </Button>

              {canDelete && (
                invoice.status === 'pending' ? (
                  <ConfirmActionButton
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa đơn bán này?"
                    confirmText="Xóa"
                    onConfirm={() => handleAction(handleDeleteInvoice)}
                    contentClassName="z-[100020]"
                    overlayClassName="z-[100019]"
                    confirmBtnVariant="destructive"
                  >
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </ConfirmActionButton>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => toast.warning('Chỉ có thể xóa đơn hàng ở trạng thái chờ duyệt')}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                )
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobileInvoiceActions
