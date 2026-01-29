import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import {
  postWarehouseReceipt,
} from '@/stores/WarehouseReceiptSlice'
import ViewWarehouseReceiptDialog from './ViewWarehouseReceiptDialog'
import { IconCheck, IconTrash, IconCircleX } from '@tabler/icons-react'
import { DeleteWarehouseReceiptDialog } from './DeleteWarehouseReceiptDialog'
import { CancelWarehouseReceiptDialog } from './CancelWarehouseReceiptDialog'

export function DataTableRowActions({ row }) {
  const dispatch = useDispatch()
  const receipt = row.original
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handlePost = async () => {
    if (receipt.status === 'posted') {
      return
    }

    // Validate lot allocations for export receipts (receiptType = 2)
    if (receipt.receiptType === 2) {
      // Check if receipt has details
      if (!receipt.details || receipt.details.length === 0) {
        alert('Phiếu xuất kho phải có ít nhất một sản phẩm')
        return
      }

      // Check if all details have lot allocations
      const missingAllocations = receipt.details.filter((detail) => {
        return !detail.lotAllocations || detail.lotAllocations.length === 0
      })

      if (missingAllocations.length > 0) {
        const productNames = missingAllocations
          .map((d) => d.productName)
          .join(', ')
        alert(
          `Vui lòng phân bổ lô cho các sản phẩm sau trước khi duyệt phiếu:\n${productNames}`
        )
        return
      }

      // Validate that total allocated quantity matches qtyActual for each detail
      const invalidAllocations = receipt.details.filter((detail) => {
        const totalAllocated = detail.lotAllocations.reduce(
          (sum, alloc) => sum + parseFloat(alloc.quantity || 0),
          0
        )
        return Math.abs(totalAllocated - parseFloat(detail.qtyActual)) > 0.001
      })

      if (invalidAllocations.length > 0) {
        const productNames = invalidAllocations
          .map((d) => d.productName)
          .join(', ')
        alert(
          `Tổng số lượng phân bổ lô không khớp với số lượng xuất cho:\n${productNames}`
        )
        return
      }
    }

    // Using window.confirm for now as I haven't created a confirm dialog for Post, but could be added later.
    // Ideally we should have a ConfirmPostDialog too, but sticking to the requested scope (delete & cancel).
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn duyệt phiếu kho này không? Sau khi duyệt sẽ không thể chỉnh sửa.'
    )
    if (confirm) {
      await dispatch(postWarehouseReceipt(receipt.id))
    }
  }

  return (
    <>
      <ViewWarehouseReceiptDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        receiptId={receipt.id}
        showTrigger={false}
      />

      {showDeleteDialog && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          receipt={receipt}
          showTrigger={false}
          contentClassName="z-[10002]"
          overlayClassName="z-[10001]"
        />
      )}

      {showCancelDialog && (
        <CancelWarehouseReceiptDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          receipt={receipt}
          showTrigger={false}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {receipt.status === 'draft' && (
            <>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}

          {receipt.status === 'posted' && (
            <DropdownMenuItem
              onClick={() => setShowCancelDialog(true)}
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
