import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import { DeleteCustomerDialog } from './DeleteCustomerDialog'
import UpdateCustomerDialog from './UpdateCustomerDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteCustomerDialog, setShowDeleteCustomerDialog] =
    useState(false)

  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)

  return (
    <>
      {showDeleteCustomerDialog && (
        <DeleteCustomerDialog
          open={showDeleteCustomerDialog}
          onOpenChange={setShowDeleteCustomerDialog}
          customer={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateCustomerDialog && (
        <UpdateCustomerDialog
          open={showUpdateCustomerDialog}
          onOpenChange={setShowUpdateCustomerDialog}
          customer={row.original}
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
          <Can permission="UPDATE_CUSTOMER">
            <DropdownMenuItem
              onSelect={() => setShowUpdateCustomerDialog(true)}
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_CUSTOMER">
            <DropdownMenuItem
              onSelect={() => setShowDeleteCustomerDialog(true)}
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
