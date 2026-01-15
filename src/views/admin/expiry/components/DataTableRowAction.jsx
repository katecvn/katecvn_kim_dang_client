import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import ExpiryDetailDialog from './ExpiryDetailDialog'
import { DeleteExpiryDialog } from './DeleteExpiryDialog'
import UpdateExpiryDialog from './UpdateExpiryDialog'

const DataTableRowActions = ({ row }) => {
  const [showExpiryDetailDialog, setShowExpiryDetailDialog] = useState(false)
  const [showExpiryUpdateDialog, setShowExpiryUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
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
          <Can permission="UPDATE_EXPIRY">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setShowExpiryUpdateDialog(true)}
            >
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          {/* <Can permission="GET_EXPIRY_USER">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setShowExpiryDetailDialog(true)}
            >
              Xem chi tiết
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can> */}

          <Can permission="DELETE_EXPIRY">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-red-50"
              onSelect={() => setShowDeleteDialog(true)}
            >
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      {showExpiryDetailDialog && (
        <ExpiryDetailDialog
          account={row.original}
          open={showExpiryDetailDialog}
          onOpenChange={setShowExpiryDetailDialog}
          showTrigger={false}
        />
      )}

      {showExpiryUpdateDialog && (
        <UpdateExpiryDialog
          customerAccount={row.original}
          open={showExpiryUpdateDialog}
          onOpenChange={setShowExpiryUpdateDialog}
          showTrigger={false}
        />
      )}

      {showDeleteDialog && (
        <DeleteExpiryDialog
          accountData={row.original}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
