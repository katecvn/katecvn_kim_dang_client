import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DataTablePagination = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1

  const canPreviousPage = page > 1
  const canNextPage = page < totalPages

  const handleChangePageSize = (value) => {
    const newSize = Number(value)
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
    // Khi đổi pageSize thường sẽ quay về trang 1
    if (onPageChange) {
      onPageChange(1)
    }
  }

  const goToFirstPage = () => {
    if (canPreviousPage && onPageChange) {
      onPageChange(1)
    }
  }

  const goToPreviousPage = () => {
    if (canPreviousPage && onPageChange) {
      onPageChange(page - 1)
    }
  }

  const goToNextPage = () => {
    if (canNextPage && onPageChange) {
      onPageChange(page + 1)
    }
  }

  const goToLastPage = () => {
    if (canNextPage && onPageChange) {
      onPageChange(totalPages)
    }
  }

  return (
    <div className="flex items-center justify-between overflow-auto px-2">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {totalItems} hàng
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">
            Hàng trên mỗi trang
          </p>
          <Select value={`${pageSize}`} onValueChange={handleChangePageSize}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 30, 50, 100, 250, 500].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[130px] items-center justify-center text-sm font-medium">
          Trang {page} trong {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goToFirstPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={goToPreviousPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={goToNextPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goToLastPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DataTablePagination }
