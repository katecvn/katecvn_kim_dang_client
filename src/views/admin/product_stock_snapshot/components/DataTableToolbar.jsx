import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import DownloadStockExcelTemplate from './DownloadStockExcelTemplate'
import UploadStockExcel from './UploadStockExcel'
import Can from '@/utils/can'

const DataTableToolbar = ({ table }) => {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      {/* Search */}
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm sản phẩm..."
          value={table.getColumn('productName')?.getFilterValue() || ''}
          onChange={(e) =>
            table.getColumn('productName')?.setFilterValue(e.target.value)
          }
          className="h-8 w-[200px] lg:w-[350px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Can permission={'GET_STOCK'}>
          <DownloadStockExcelTemplate />
          <UploadStockExcel snapshotDate={today} />
        </Can>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
