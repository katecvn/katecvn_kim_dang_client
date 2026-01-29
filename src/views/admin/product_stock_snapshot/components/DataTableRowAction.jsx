import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconTrash, IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import Can from '@/utils/can'
import { DeleteProductStockSnapshotDialog } from './DeleteProductStockSnapshotDialog'
import { UpdateProductStockSnapshotDialog } from './UpdateProductStockSnapshotDialog'
import { FileSpreadsheet } from 'lucide-react'
import { exportDetailedLedgerToExcel } from '@/utils/export-detailed-ledger'

const DataTableRowActions = ({ row }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  const snapshot = row.original

  return (
    <>
      {showDeleteDialog && (
        <DeleteProductStockSnapshotDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          snapshot={snapshot}
          showTrigger={false}
        />
      )}

      {showUpdateDialog && (
        <UpdateProductStockSnapshotDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          snapshot={snapshot}
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
          {/* Sửa */}
          <Can permission="UPDATE_STOCK">
            <DropdownMenuItem onSelect={() => setShowUpdateDialog(true)}>
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* Xóa */}
          <Can permission="DELETE_STOCK">
            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* Sổ chi tiết */}
          <DropdownMenuItem onSelect={() => exportDetailedLedgerToExcel(snapshot, { fromDate: new Date(), toDate: new Date() })}>
            Sổ chi tiết
            <DropdownMenuShortcut>
              <FileSpreadsheet className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
