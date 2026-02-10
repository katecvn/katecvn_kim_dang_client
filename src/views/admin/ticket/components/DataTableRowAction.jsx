import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IconEdit, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Can from '@/utils/can'

import UpdateTicketDialog from './UpdateTicketDialog'
import DeleteTicketDialog from './DeleteTicketDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteTicketDialog, setShowDeleteTicketDialog] = useState(false)
  const [showUpdateTicketDialog, setShowUpdateTicketDialog] = useState(false)

  const ticket = row.original

  return (
    <>
      {showUpdateTicketDialog && (
        <UpdateTicketDialog
          open={showUpdateTicketDialog}
          onOpenChange={setShowUpdateTicketDialog}
          ticket={ticket}
          showTrigger={false}
        />
      )}

      {showDeleteTicketDialog && (
        <DeleteTicketDialog
          open={showDeleteTicketDialog}
          onOpenChange={setShowDeleteTicketDialog}
          ticket={ticket}
          showTrigger={false}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Mở menu thao tác"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <Can permission="GET_INVOICE">
            <DropdownMenuItem
              onSelect={() => setShowUpdateTicketDialog(true)}
              className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="GET_INVOICE">
            <DropdownMenuItem
              onSelect={() => setShowDeleteTicketDialog(true)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
