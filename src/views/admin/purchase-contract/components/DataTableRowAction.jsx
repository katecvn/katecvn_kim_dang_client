import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconReceiptRefund,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeletePurchaseContractDialog from './DeletePurchaseContractDialog'
import UpdatePurchaseContractDialog from './UpdatePurchaseContractDialog'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import LiquidatePurchaseContractDialog from './LiquidatePurchaseContractDialog'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showLiquidationDialog, setShowLiquidationDialog] = useState(false)

  // Check if editable based on status (assuming same logic as sales: only draft)
  const canEdit = contract.status === 'draft'
  const canDelete = contract.status === 'draft'
  const canLiquidate = contract.status === 'confirmed' // Only confirmed contracts can be liquidated

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">

          <DropdownMenuItem
            onClick={() => setShowViewDialog(true)}
          >
            Xem chi tiết
            <DropdownMenuShortcut>
              <IconEye className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <Can permission={'UPDATE_PURCHASE_CONTRACT'}>
            <DropdownMenuItem
              onClick={() => setShowUpdateDialog(true)}
              className={`text-blue-600 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canEdit}
            >
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission={'UPDATE_PURCHASE_CONTRACT'}>
            <DropdownMenuItem
              onClick={() => setShowLiquidationDialog(true)}
              className={`text-orange-600 ${!canLiquidate ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canLiquidate}
            >
              Thanh lý
              <DropdownMenuShortcut>
                <IconReceiptRefund className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <DropdownMenuSeparator />

          <Can permission={'DELETE_PURCHASE_CONTRACT'}>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className={`text-red-600 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canDelete}
            >
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showViewDialog && (
        <ViewPurchaseContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseContractId={contract.id}
          showTrigger={false}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {showLiquidationDialog && (
        <LiquidatePurchaseContractDialog
          open={showLiquidationDialog}
          onOpenChange={setShowLiquidationDialog}
          contractId={contract.id}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
        />
      )}

      {showUpdateDialog && canEdit && (
        <UpdatePurchaseContractDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          contractId={contract.id}
        />
      )}

      {showDeleteDialog && canDelete && (
        <DeletePurchaseContractDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          contractId={contract.id}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
