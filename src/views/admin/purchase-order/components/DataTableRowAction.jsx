import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeletePurchaseOrderDialog from './DeletePurchaseOrderDialog'
import UpdatePurchaseOrderDialog from './UpdatePurchaseOrderDialog'
import ViewPurchaseOrderDialog from './ViewPurchaseOrderDialog'

const DataTableRowActions = ({ row }) => {
  const purchaseOrder = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  return (
    <>
      {showDeleteDialog && (
        <DeletePurchaseOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          purchaseOrder={row.original}
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
          <Can permission="GET_PURCHASE_ORDER">
            <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
              Xem chi tiết
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {row?.original?.status === 'pending' && (
            <Can permission="UPDATE_PURCHASE_ORDER">
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <Can permission="DELETE_PURCHASE_ORDER">
            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showUpdateDialog && (
        <UpdatePurchaseOrderDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          purchaseOrderId={row.original.id}
          showTrigger={false}
        />
      )}

      {showViewDialog && (
        <ViewPurchaseOrderDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseOrderId={row.original.id}
          showTrigger={false}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
