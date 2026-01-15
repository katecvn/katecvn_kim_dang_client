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
import UpdateTaskDialog from './UpdateTaskDialog'
import DeleteTaskDialog from './DeleteTaskDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false)
  const [showUpdateTaskDialog, setShowUpdateTaskDialog] = useState(false)

  const task = row.original
  return (
    <>
      {showUpdateTaskDialog && (
        <UpdateTaskDialog
          open={showUpdateTaskDialog}
          onOpenChange={setShowUpdateTaskDialog}
          taskId={task.id}
          showTrigger={false}
        />
      )}

      {showDeleteTaskDialog && (
        <DeleteTaskDialog
          open={showDeleteTaskDialog}
          onOpenChange={setShowDeleteTaskDialog}
          task={task}
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
          <Can permission="UPDATE_TASK">
            <DropdownMenuItem onSelect={() => setShowUpdateTaskDialog(true)}>
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_TASK">
            <DropdownMenuItem onSelect={() => setShowDeleteTaskDialog(true)}>
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
