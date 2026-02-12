import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTablePagination } from './DataTablePagination'
import { Skeleton } from '@/components/ui/skeleton'
import ViewPurchaseContractDialog from './ViewPurchaseContractDialog'
import MobilePurchaseContractCard from './MobilePurchaseContractCard'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

const PurchaseContractDataTable = ({
  columns,
  data,
  loading,
  pagination = { page: 1, limit: 20, totalPages: 1 },
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  columnFilters = [], // Default to empty array if not provided
  onColumnFiltersChange // Function from parent
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  // const [columnFilters, setColumnFilters] = useState([]) // Controlled by parent now
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewId, setViewId] = useState(null)

  const table = useReactTable({
    data,
    columns,
    meta: {
      onView: (id) => setViewId(id),
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit
      }
    },
    pageCount: pagination.totalPages,
    manualPagination: true,
    manualFiltering: true, // Enable server-side filtering
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit
        })
        onPageChange?.(newState.pageIndex + 1)
        if (newState.pageSize !== pagination.limit) {
          onPageSizeChange?.(newState.pageSize)
        }
      } else {
        onPageChange?.(updater.pageIndex + 1)
        onPageSizeChange?.(updater.pageSize)
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange, // Use parent handler
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater)
      if (typeof updater !== 'function') {
        onSearchChange?.(updater)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })



  // Mobile View - Card List
  if (isMobile) {
    return (
      <div className="space-y-4">
        <DataTableToolbar table={table} />

        <div className="space-y-2">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <Skeleton className="h-[20px] w-1/3 rounded-md" />
                  <Skeleton className="h-[16px] w-2/3 rounded-md" />
                  <Skeleton className="h-[16px] w-1/2 rounded-md" />
                </div>
              ))}
            </>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <MobilePurchaseContractCard
                key={row.id}
                contract={row.original}
                isSelected={row.getIsSelected()}
                onSelectChange={(checked) => row.toggleSelected(checked)}
                onRowAction={() => { }}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có kết quả nào
            </div>
          )}
        </div>

        <DataTablePagination table={table} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      {/* Mobile Component injection could go here, but for now standard table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có kết quả nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      {/* View Dialog */}
      {viewId && (
        <ViewPurchaseContractDialog
          open={!!viewId}
          onOpenChange={(open) => {
            if (!open) setViewId(null)
          }}
          purchaseContractId={viewId}
          showTrigger={false}
        />
      )}
    </div>
  )
}

export default PurchaseContractDataTable
