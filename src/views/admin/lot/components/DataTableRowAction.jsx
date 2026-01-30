import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import ViewLotDialog from './ViewLotDialog'

export function DataTableRowAction({ row }) {
  const [openView, setOpenView] = useState(false)

  return (
    <>
      <ViewLotDialog
        open={openView}
        onOpenChange={setOpenView}
        lot={row.original}
      />
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
          <DropdownMenuItem onClick={() => setOpenView(true)}>
            Xem chi tiết
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
