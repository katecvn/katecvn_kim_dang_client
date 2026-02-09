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
import { DeletePaymentDialog } from './DeletePaymentDialog'
import PaymentFormDialog from './PaymentDialog'
import { Pencil } from 'lucide-react'

const DataTableRowActions = ({ row }) => {
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false)
  const [showUpdatePaymentDialog, setShowUpdatePaymentDialog] = useState(false)

  return (
    <>
      {showDeletePaymentDialog && (
        <DeletePaymentDialog
          open={showDeletePaymentDialog}
          onOpenChange={setShowDeletePaymentDialog}
          payment={row.original}
          showTrigger={false}
        />
      )}

      {showUpdatePaymentDialog && (
        <PaymentFormDialog
          open={showUpdatePaymentDialog}
          onOpenChange={setShowUpdatePaymentDialog}
          payment={row.original}
          contentClassName="z-[100060]"
          overlayClassName="z-[100059]"
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
          {/* Placeholder View/Edit actions can remain if needed, or remove if unused effectively */}

          {row.original.status === 'draft' && (
            <DropdownMenuItem
              onSelect={() => setShowUpdatePaymentDialog(true)}
            >
              Chỉnh sửa
              <DropdownMenuShortcut>
                <Pencil className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {(row.original.status === 'draft' || row.original.status === 'cancelled') && (
            <DropdownMenuItem
              onSelect={() => setShowDeletePaymentDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              Xóa
              <DropdownMenuShortcut>
                <IconTrash className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
