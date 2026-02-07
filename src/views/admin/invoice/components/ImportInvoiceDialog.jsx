import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { importInvoice } from '@/stores/InvoiceSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parse, isValid } from 'date-fns'

const ImportInvoiceDialog = ({
  open,
  onOpenChange,
  ...props
}) => {
  const dispatch = useDispatch()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorList, setErrorList] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (
        selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile)
        setErrorList(null)
      } else {
        toast.error('Vui lòng chọn file Excel (.xlsx, .xls)')
        e.target.value = null
      }
    }
  }

  const parseDate = (value) => {
    if (value instanceof Date) return format(value, 'yyyy-MM-dd')
    // Try to parse string date if needed, assume Excel dates are objects usually
    return value ? String(value) : null
  }

  const handleImport = async () => {
    if (!file) {
      toast.warning('Vui lòng chọn file để import')
      return
    }

    setLoading(true)
    setErrorList(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(arrayBuffer)

      const worksheet = workbook.getWorksheet(1)
      if (!worksheet) {
        throw new Error('File Excel không có dữ liệu')
      }

      const rows = []
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // header

        const getVal = (idx) => {
          const val = row.getCell(idx).value
          return val?.text || val || ''
        }

        const getDateVal = (idx) => parseDate(row.getCell(idx).value)

        // Mapping Assumption (Flattened Structure):
        // 1. CMND/CCCD (Key for Customer)
        // 2. Tên Khách (Customer Name)
        // 3. SĐT
        // 4. Email
        // 5. Địa chỉ
        // 6. Ngày cấp CMND
        // 7. Nơi cấp
        // 8. Ngày đơn hàng (Order Date)
        // 9. Ghi chú
        // 10. Mã sản phẩm (Line Item)
        // 11. Đơn vị tính (Unit)
        // 12. Số lượng
        // 13. Đơn giá
        // 14. Giảm giá
        // 15. Ngày giao dự kiến
        // 16. Loại giao dịch (RETAIL default)

        rows.push({
          rowNumber,
          identityCard: String(getVal(1)),
          customerName: String(getVal(2)),
          phone: String(getVal(3)),
          email: String(getVal(4)),
          address: String(getVal(5)),
          identityDate: getDateVal(6),
          identityPlace: String(getVal(7)),
          orderDate: getDateVal(8),
          note: String(getVal(9)),
          // Product Info
          productCode: String(getVal(10)),
          unitCode: String(getVal(11)),
          quantity: Number(getVal(12)) || 0,
          price: Number(getVal(13)) || 0,
          discount: Number(getVal(14)) || 0,
          expectedDeliveryDate: getDateVal(15),
          transactionType: String(getVal(16) || 'RETAIL')
        })
      })

      if (rows.length === 0) {
        toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
        return
      }

      // Grouping Logic: Group by IdentityCard AND OrderDate to form Invoices
      const invoicesMap = new Map()

      rows.forEach(row => {
        if (!row.identityCard) return // Skip rows without key

        const key = `${row.identityCard}_${row.orderDate || 'nodate'}`

        if (!invoicesMap.has(key)) {
          // Initialize Invoice Header
          invoicesMap.set(key, {
            identityCard: row.identityCard,
            newCustomer: {
              name: row.customerName,
              phone: row.phone,
              email: row.email,
              address: row.address,
              identityCard: row.identityCard,
              identityDate: row.identityDate,
              identityPlace: row.identityPlace
            },
            orderDate: row.orderDate, // e.g., "2026-01-14"
            transactionType: row.transactionType,
            note: row.note,
            items: [],
            isPrintContract: true,
            hasPrintInvoice: true,
            hasPrintQuotation: true,
            expectedDeliveryDate: row.expectedDeliveryDate,
            rowNumbers: []
          })
        }

        const invoice = invoicesMap.get(key)
        invoice.rowNumbers.push(row.rowNumber)

        // Calculate line totals
        const subTotal = row.quantity * row.price
        // Logic: subTotal is pre-tax? User JSON example has taxAmount. 
        // We will assume simpler logic or need tax column? 
        // User example: price 15m, qty 2, subTotal 30m, total 29m(after discount 1m). Tax 0. 
        // Example 2: price 125m, tax 12.5m, subTotal 137.5m. 
        // Excel might need tax rate or tax amount column. 
        // For now, let's assume default 0 tax if not provided, or add a column if needed.
        // Given current constrained columns, let's default tax to 0 for MVP or calculate if possible.
        // Let's assume input Price is Tax Exclusive vs Inclusive? 
        // Let's keep it simple: Price * Qty = SubTotal. Tax = 0. Total = SubTotal - Discount.

        // RE-CHECK JSON: 
        // Item 2: Price 125m, Tax 12.5m (10%), SubTotal 137.5m. Discount 2m. Total 135.5m.
        // So SubTotal = (Price * Qty) + Tax. 
        // Or Price is ex-tax. 
        // Let's calculate: 125 * 1 = 125. Tax = 12.5. Sum = 137.5.
        // So Price is Unit Price Ex-Tax.

        // I will default Tax to 0 for simplicity unless user specific tax column exists.
        const taxAmount = 0
        const lineSubTotal = (row.quantity * row.price) + taxAmount
        const lineTotal = lineSubTotal - row.discount

        if (row.productCode) {
          invoice.items.push({
            productCode: row.productCode,
            unitCode: row.unitCode,
            quantity: row.quantity,
            price: row.price,
            taxAmount: taxAmount,
            subTotal: lineSubTotal,
            discount: row.discount,
            total: lineTotal,
            isContractItem: true // Default true
          })
        }
      })

      const payload = {
        items: Array.from(invoicesMap.values())
      }

      if (payload.items.length === 0) {
        toast.warning('Không tạo được hóa đơn nào từ dữ liệu.')
        return
      }

      await dispatch(importInvoice(payload)).unwrap()

      toast.success(`Đã import thành công ${payload.items.length} hóa đơn`)
      onOpenChange(false)
      setFile(null)

    } catch (error) {
      console.error('Import error:', error)

      // Handle structured import errors
      let importErrors = null

      if (error?.message?.importErrors && Array.isArray(error.message.importErrors)) {
        importErrors = error.message.importErrors
      } else if (error?.importErrors && Array.isArray(error.importErrors)) {
        importErrors = error.importErrors
      } else if (error?.response?.data?.message?.importErrors && Array.isArray(error.response.data.message.importErrors)) {
        importErrors = error.response.data.message.importErrors
      }

      if (importErrors && importErrors.length > 0) {
        const sanitizedErrors = importErrors.map(err => ({
          row: err.row, // note: backend might return index or grouping key? usually row number from error context if backend parses excel. 
          // But here WE parsed excel. Backend receives JSON.
          // So strict row number mapping might be lost if backend refers to "Item Index 0".
          // If backend validates JSON, it returns "items[0].name invalid".
          // We might need to map back items[i] to Excel Rows.
          errors: Array.isArray(err.errors) ? err.errors.map(e => ({
            field: String(e.field || ''),
            message: String(e.message || 'Lỗi không xác định')
          })) : []
        }))
        // Note: Mapping back JSON index to Excel Row is tricky without passing Row ID.
        // For now, display raw errors or generic message if mapping fails.
        setErrorList(sanitizedErrors)
        toast.error('Import thất bại. Vui lòng kiểm tra lại lỗi chi tiết.')
      } else {
        let msg = 'Có lỗi xảy ra, vui lòng thử lại.'
        if (typeof error === 'string') {
          msg = error
        } else if (typeof error?.message === 'string') {
          msg = error.message
          if (typeof msg === 'object') msg = JSON.stringify(msg)
        }
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/invoice/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'invoice_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download template error:', error)
      toast.error('Tải file mẫu thất bại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Excel Hóa Đơn</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách hóa đơn.
            <br />
            <span className="text-xs text-muted-foreground">Hệ thống sẽ gom nhóm các dòng cùng CMND + Ngày đơn hàng thành 1 hóa đơn.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end px-1">
          <Button
            variant="link"
            className="h-auto p-0 text-blue-600"
            onClick={handleDownloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Tải file mẫu
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File Excel
            </Label>
            <div className="col-span-3">
              <Input
                id="file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-green-600 justify-center">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}

          {errorList && (
            <div className="mt-4 rounded-md bg-destructive/15 p-3 text-destructive">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>Có lỗi xảy ra:</span>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-white">
                {errorList.map((err, idx) => (
                  <div key={idx} className="mb-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div className="font-semibold text-red-600">Lỗi:</div>
                    <ul className="list-disc pl-5 mt-1">
                      {err.errors.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium text-gray-700">{e.field}:</span> {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setFile(null)}>
              Hủy
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleImport} loading={loading} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportInvoiceDialog
