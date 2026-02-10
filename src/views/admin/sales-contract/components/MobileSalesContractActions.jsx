import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { Trash2, Printer, FileCheck } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const MobileSalesContractActions = ({
  contract,
  isDesktop,
  handleLiquidate,
  handleCreateReceipt,
  handleCreateWarehouseReceipt,
  handlePrintContract,
  handleDeleteClick,
  onOpenChange,
  isExporting
}) => {
  const [open, setOpen] = useState(false)

  if (isDesktop || !contract) return null

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
            <SheetTitle>Thao tác hợp đồng</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-orange-600 text-white hover:bg-orange-700 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handleLiquidate)}
              >
                <FileCheck className="h-5 w-5" />
                <span className="text-xs">Thanh lý</span>
              </Button>

              <Button
                className="bg-green-600 text-white hover:bg-green-700 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handleCreateReceipt)}
              >
                <PlusIcon className="h-5 w-5" />
                <span className="text-xs">Tạo Phiếu Thu</span>
              </Button>

              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handleCreateWarehouseReceipt)}
              >
                <PlusIcon className="h-5 w-5" />
                <span className="text-xs">Tạo Phiếu Nhập Kho</span>
              </Button>

              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 h-auto py-3 flex-col gap-1"
                onClick={() => handleAction(handlePrintContract)}
                loading={isExporting}
              >
                <Printer className="h-5 w-5" />
                <span className="text-xs">In Hợp Đồng</span>
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full h-auto py-3 flex-col gap-1"
              onClick={() => handleAction(handleDeleteClick)}
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-xs">Xóa</span>
            </Button>

            <Separator />

            {/* Close Button */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobileSalesContractActions
