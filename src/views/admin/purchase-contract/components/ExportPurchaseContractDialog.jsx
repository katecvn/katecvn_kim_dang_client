import { Button } from '@/components/custom/Button'
import { DateRange } from '@/components/custom/DateRange'
import { endOfDay, endOfMonth, startOfDay, startOfMonth, format } from 'date-fns'
import { useState } from 'react'
import api from '@/utils/axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
import { IconPresentationAnalytics } from '@tabler/icons-react'
import ExportPurchaseContractView from './ExportPurchaseContractView'

const ExportPurchaseContractDialog = ({
  open,
  onOpenChange,
  ...props
}) => {
  const current = new Date()
  const [showExportReview, setShowExportReview] = useState(false)
  const [exportData, setExportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [partnerType, setPartnerType] = useState('all') // 'all'=Tất cả, 'customer'=KH, 'supplier'=NCC
  const [filters, setFilters] = useState({
    fromDate: startOfDay(startOfMonth(current)),
    toDate: endOfDay(endOfMonth(current)),
  })

  const handleReviewExport = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/purchase-contracts', {
        params: {
          fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
          toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
          type: partnerType !== 'all' ? partnerType : undefined,
          limit: 1000,
          page: 1,
        },
      })

      const list = data?.data?.data || data?.data || []

      if (!list.length) {
        toast.warning('Danh sách hợp đồng mua trống')
        return
      }
      setExportData(list)
      setShowExportReview(true)
    } catch (error) {
      console.log('Export error: ', error)
      toast.error('Không thể tải dữ liệu hợp đồng mua')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="md:h-auto md:w-[360px]">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo hợp đồng mua</DialogTitle>
          <DialogDescription>
            Chọn từ ngày đến ngày để xuất file
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Loại đối tác</Label>
              <Select value={partnerType} onValueChange={setPartnerType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="supplier">Nhà cung cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        <ExportPurchaseContractView
          open={showExportReview}
          onOpenChange={setShowExportReview}
          data={exportData}
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          closeExport={onOpenChange}
        />
      )}
    </Dialog>
  )
}

export default ExportPurchaseContractDialog
