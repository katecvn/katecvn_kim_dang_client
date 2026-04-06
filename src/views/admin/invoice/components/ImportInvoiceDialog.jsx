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
  onSuccess,
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
          const cell = row.getCell(idx)
          let val = cell.value

          if (val === null || val === undefined) return ''

          // Handle Formulas
          if (typeof val === 'object' && val.result !== undefined) {
            val = val.result
          }

          // Handle Rich Text
          if (val.richText) {
            val = val.richText.map((rt) => rt.text).join('')
          }

          // Handle Hyperlinks
          if (val.hyperlink) {
            val = val.text || val.hyperlink
          }

          return String(val).trim()
        }

        const getDateVal = (idx) => {
          const val = row.getCell(idx).value
          const date = val?.result instanceof Date ? val.result : (val instanceof Date ? val : null)
          return parseDate(date)
        }
        const getBoolVal = (idx) => getVal(idx).toUpperCase() === 'TRUE'
        const getNumVal = (idx) => {
          const val = getVal(idx)
          return val ? Number(val.replace(/[^0-9.-]+/g, '')) : 0
        }

        // Updated Mapping (20 Columns):
        // 1. Mã nhóm đơn (Group Code)
        // 2. CCCD (Identity Card) (*)
        // 3. Tên khách hàng (Customer Name) (*)
        // 4. Số điện thoại (Phone) (*)
        // 5. Email
        // 6. Địa chỉ (Address)
        // 7. Ngày cấp (Identity Date)
        // 8. Nơi cấp (Identity Place)
        // 9. Ngày đặt hàng (Order Date) (*)
        // 10. Loại giao dịch (Transaction Type) (*)
        // 11. Ghi chú (Note)
        // 12. In hợp đồng (Print Contract)
        // 13. Ngày dự kiến giao hàng (Expected Delivery Date) (*)
        // 14. Mã sản phẩm (Product Code) (*)
        // 15. Mã đơn vị (Unit Code) (*)
        // 16. Thuế (Tax)
        // 17. Số lượng (Quantity) (*)
        // 18. Đơn giá (Price) (*)
        // 19. Giảm giá (Discount)
        // 20. Tạo hợp đồng cho item (Create Contract for Item)

        rows.push({
          rowNumber,
          groupCode: getVal(1),
          identityCard: getVal(2),
          customerName: getVal(3),
          phone: getVal(4),
          email: getVal(5),
          address: getVal(6),
          identityDate: getDateVal(7),
          identityPlace: getVal(8),
          orderDate: getDateVal(9),
          transactionType: getVal(10) || 'RETAIL',
          note: getVal(11),
          isPrintContract: getBoolVal(12),
          expectedDeliveryDate: getDateVal(13),
          // Product Info
          productCode: getVal(14),
          unitCode: getVal(15),
          taxAmount: getNumVal(16),
          quantity: getNumVal(17),
          price: getNumVal(18),
          discount: getNumVal(19),
          isContractItem: getBoolVal(20),
        })
      })

      if (rows.length === 0) {
        toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
        return
      }

      // Grouping Logic: Group by groupCode (preferred) OR Key (IdentityCard + OrderDate)
      const invoicesMap = new Map()
      let currentKey = null

      rows.forEach((row) => {
        // Determine if this is a "Header Row" (starts a new group)
        const hasGroupCode = row.groupCode && row.groupCode !== 'undefined' && row.groupCode !== 'null'
        const hasIdentity = row.identityCard && row.identityCard !== 'undefined' && row.identityCard !== 'null'

        if (hasGroupCode) {
          currentKey = row.groupCode
        } else if (hasIdentity) {
          currentKey = `${row.identityCard}_${row.orderDate || 'nodate'}`
        }

        // If we still don't have a currentKey (e.g. first row is invalid), skip
        if (!currentKey) return

        if (!invoicesMap.has(currentKey)) {
          // Initialize Invoice Header
          invoicesMap.set(currentKey, {
            identityCard: row.identityCard,
            newCustomer: {
              name: row.customerName,
              phone: row.phone,
              email: row.email,
              address: row.address,
              identityCard: row.identityCard,
              identityDate: row.identityDate,
              identityPlace: row.identityPlace,
            },
            orderDate: row.orderDate,
            transactionType: row.transactionType,
            note: row.note,
            items: [],
            isPrintContract: row.isPrintContract,
            hasPrintInvoice: true,
            hasPrintQuotation: true,
            expectedDeliveryDate: row.expectedDeliveryDate,
          })
        }

        const invoice = invoicesMap.get(currentKey)

        // If this row has header info, update the invoice header (case where multiple rows have info but same group)
        if (hasIdentity) {
          invoice.identityCard = row.identityCard
          invoice.newCustomer = {
            name: row.customerName,
            phone: row.phone,
            email: row.email,
            address: row.address,
            identityCard: row.identityCard,
            identityDate: row.identityDate,
            identityPlace: row.identityPlace,
          }
          invoice.orderDate = row.orderDate
          invoice.transactionType = row.transactionType
          invoice.note = row.note
          invoice.isPrintContract = row.isPrintContract
          if (row.expectedDeliveryDate) {
            invoice.expectedDeliveryDate = row.expectedDeliveryDate
          }
        }

        const lineSubTotal = (row.quantity * row.price)
        const lineTotal = lineSubTotal - row.discount

        if (row.productCode) {
          invoice.items.push({
            productCode: row.productCode,
            unitCode: row.unitCode,
            quantity: row.quantity,
            price: row.price,
            taxAmount: row.taxAmount || 0,
            subTotal: lineSubTotal,
            discount: row.discount,
            total: lineTotal,
            isContractItem: row.isContractItem,
          })
        }
      })

      const payload = {
        items: Array.from(invoicesMap.values()),
      }

      if (payload.items.length === 0) {
        toast.warning('Không tạo được hóa đơn nào từ dữ liệu.')
        return
      }

      const result = await dispatch(importInvoice(payload)).unwrap()

      if (result?.data?.failed?.length > 0) {
        const failures = result.data.failed.map((f) => ({
          row: f.row,
          errors: [
            {
              field: 'Chi tiết',
              message: typeof f.error === 'string' ? f.error : JSON.stringify(f.error),
            },
          ],
        }))
        setErrorList(failures)
        toast.warning(result.message || `Có ${result.data.failed.length} dòng bị lỗi`)
      } else {
        toast.success(result.message || `Đã import thành công ${payload.items.length} hóa đơn`)
        onOpenChange(false)
        setFile(null)
        if (onSuccess) onSuccess()
      }

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
          <DialogTitle>Import Excel Đơn Bán</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách đơn bán.
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
