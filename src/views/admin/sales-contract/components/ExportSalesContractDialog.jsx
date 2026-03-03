import { Button } from '@/components/custom/Button'
import { DateRange } from '@/components/custom/DateRange'
import { endOfDay, endOfMonth, startOfDay, startOfMonth, format } from 'date-fns'
import { useState } from 'react'
import api from '@/utils/axios'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import ExportSalesContractView from './ExportSalesContractView'
import { IconPresentationAnalytics } from '@tabler/icons-react'

const ExportSalesContractDialog = ({
  open,
  onOpenChange,
  ...props
}) => {
  const current = new Date()
  const [showExportReview, setShowExportReview] = useState(false)
  const [exportData, setExportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    fromDate: startOfDay(startOfMonth(current)),
    toDate: endOfDay(endOfMonth(current)),
  })

  const handleReviewExport = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/sales-contracts', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
          toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
          limit: 100,
        },
      })

      const list = data?.data?.data || data?.data || []

      if (!list.length) {
        toast.warning('Danh sách hợp đồng bán trống')
        return
      }
      setExportData(list)
      setShowExportReview(true)
    } catch (error) {
      console.log('Export error: ', error)
      toast.error('Không thể tải dữ liệu hợp đồng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="md:h-auto md:w-[320px]">
        <DialogHeader>
          <DialogTitle>Xuất file Excel hợp đồng bán</DialogTitle>
          <DialogDescription>
            Chọn từ ngày đến ngày để xuất file
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <DateRange
            defaultValue={{
              from: filters?.fromDate,
              to: filters?.toDate,
            }}
            onChange={(range) => {
              const fromDate = range?.from
                ? startOfDay(range.from)
                : startOfDay(startOfMonth(current))
              const toDate = range?.to
                ? endOfDay(range.to)
                : endOfDay(endOfMonth(current))

              setFilters((prev) => ({
                ...prev,
                fromDate,
                toDate,
              }))
            }}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleReviewExport} loading={loading}>
            <IconPresentationAnalytics className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
        </DialogFooter>
      </DialogContent>

      {showExportReview && (
        <ExportSalesContractView
          open={showExportReview}
          onOpenChange={setShowExportReview}
          showTrigger={false}
          data={exportData}
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          closeExport={onOpenChange}
        />
      )}
    </Dialog>
  )
}

export default ExportSalesContractDialog
