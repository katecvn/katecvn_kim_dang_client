import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ViewLotDialog({ open, onOpenChange, lot }) {
  if (!lot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-screen max-w-[1200px] p-0 sm:h-[95vh]'>
        <DialogHeader className='flex flex-row items-center justify-between border-b px-6 py-4'>
          <DialogTitle className='text-xl'>
            Chi tiết lô hàng: <span className='text-primary'>{lot.code}</span>
          </DialogTitle>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => onOpenChange(false)}
          >
            <X className='h-4 w-4' />
          </Button>
        </DialogHeader>

        <div className='flex h-[calc(100vh-65px)] overflow-hidden sm:h-[calc(95vh-65px)]'>
          {/* Main Content */}
          <div className='flex-1 overflow-auto bg-muted/10 p-6'>
            <div className='mx-auto max-w-4xl space-y-6'>
              {/* Product Info */}
              <div className='rounded-lg border bg-card p-6 shadow-sm'>
                <h3 className='mb-4 text-lg font-semibold'>Thông tin sản phẩm</h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <span className='text-sm text-muted-foreground'>Tên sản phẩm</span>
                    <p className='font-medium'>{lot.product?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Mã sản phẩm</span>
                    <p className='font-medium'>{lot.product?.code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Lot Info */}
              <div className='rounded-lg border bg-card p-6 shadow-sm'>
                <h3 className='mb-4 text-lg font-semibold'>Thông tin lô</h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <span className='text-sm text-muted-foreground'>Số lượng ban đầu</span>
                    <p className='font-medium'>{lot.initialQuantity}</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Số lượng hiện tại</span>
                    <p className='font-medium'>{lot.currentQuantity}</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Ngày sản xuất</span>
                    <p className='font-medium'>
                      {lot.manufactureDate ? format(new Date(lot.manufactureDate), 'dd/MM/yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Hạn sử dụng</span>
                    <p className='font-medium'>
                      {lot.expiryDate ? format(new Date(lot.expiryDate), 'dd/MM/yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='w-[350px] border-l bg-card'>
            <ScrollArea className='h-full'>
              <div className='space-y-6 p-6'>
                {/* Meta Info */}
                <div>
                  <h4 className='mb-2 text-sm font-semibold text-muted-foreground'>
                    THÔNG TIN KHÁC
                  </h4>
                  <div className='rounded-lg border bg-muted/50 p-4 space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Ngày tạo</span>
                      <span className='font-medium'>
                        {lot.createdAt ? format(new Date(lot.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
