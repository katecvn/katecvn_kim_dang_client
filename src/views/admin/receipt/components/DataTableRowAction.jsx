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

const DataTableRowActions = ({ row }) => {
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)

  return (
    <>
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
          <DropdownMenuItem onSelect={() => setShowDeleteReceiptDialog(true)}>
            Xóa
            <DropdownMenuShortcut>
              <IconTrash className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
