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
  IconFileInvoice,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteSalesContractDialog from './DeleteSalesContractDialog'
import UpdateSalesContractDialog from './UpdateSalesContractDialog'
import ViewSalesContractDialog from './ViewSalesContractDialog'

const DataTableRowActions = ({ row }) => {
  const contract = row?.original || {}
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

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
          <Can permission={'GET_SALES_CONTRACT'}>
            <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
              Xem
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission={'UPDATE_SALES_CONTRACT'}>
            <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="text-blue-600">
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission={'DELETE_SALES_CONTRACT'}>
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showViewDialog && (
        <ViewSalesContractDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          contractId={contract.id}
        />
      )}

      {showUpdateDialog && (
        <UpdateSalesContractDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          contractId={contract.id}
        />
      )}

      {showDeleteDialog && (
        <DeleteSalesContractDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          contractId={contract.id}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
