import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import UpdateLotDialog from './UpdateLotDialog'
import DeleteLotDialog from './DeleteLotDialog'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'

export function DataTableRowAction({ row }) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      {showUpdateDialog && (
        <UpdateLotDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          lot={row.original}
        />
      )}
      {showDeleteDialog && (
        <DeleteLotDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          lot={row.original}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <Can permission="UPDATE_LOT">
            <DropdownMenuItem
              onClick={() => setShowUpdateDialog(true)}
              className="text-blue-600"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconPencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_LOT">
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
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
