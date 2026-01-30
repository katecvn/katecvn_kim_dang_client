import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import ExcelJS from 'exceljs'
import { IconDownload } from '@tabler/icons-react'

const ExportPurchaseOrderView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const fromDate = dateFormat(props.fromDate)
  const toDate = dateFormat(props.toDate)

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Chi tiết đơn mua hàng', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportPOTable')

    worksheet.mergeCells('A1:Q1')
    worksheet.getCell('A1').value =
      `Báo cáo danh sách đơn mua hàng từ ${fromDate} đến ${toDate}`

    const rows = table.querySelectorAll('tr')
    const data = []

    rows.forEach((row) => {
      const rowData = []
      row.querySelectorAll('td, th').forEach((cell) => {
        rowData.push(cell.innerText.trim())
      })
      data.push(rowData)
    })

    const columnIndexForCheck = 1 // Cột B (Mã ĐĐH) để kiểm tra nhóm dữ liệu

    let mergeRows_M = [] // Cột Tổng đơn
    let mergeRows_N = [] // Cột Thuế
    let mergeRows_O = [] // Cột Giảm giá
    let mergeRows_P = [] // Cột Công nợ
    let mergeRows_Q = [] // Cột Trạng thái 

    let previousCode = null

    data.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row)
      if (rowIndex > 0) {
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
          cell.font = {
            name: 'Times New Roman',
            size: 12,
          }
          cell.alignment = {
            vertical: 'top',
            horizontal: 'right',
            wrapText: true,
          }
        })

        // Kiểm tra nếu Mã ĐĐH trùng
        if (row[columnIndexForCheck] === previousCode) {
          mergeRows_M.push(excelRow.number)
          mergeRows_N.push(excelRow.number)
          mergeRows_O.push(excelRow.number)
          mergeRows_P.push(excelRow.number)
          mergeRows_Q.push(excelRow.number)
        } else {
          // Thực hiện gộp ô nếu có nhóm trước đó
          const merge = (rows, colLetter) => {
            if (rows.length > 1) {
              worksheet.mergeCells(`${colLetter}${rows[0]}:${colLetter}${rows[rows.length - 1]}`)
            }
          }

          merge(mergeRows_M, 'M')
          merge(mergeRows_N, 'N')
          merge(mergeRows_O, 'O')
          merge(mergeRows_P, 'P')
          merge(mergeRows_Q, 'Q')

          // Bắt đầu nhóm mới
          mergeRows_M = [excelRow.number]
          mergeRows_N = [excelRow.number]
          mergeRows_O = [excelRow.number]
          mergeRows_P = [excelRow.number]
          mergeRows_Q = [excelRow.number]
        }
        previousCode = row[columnIndexForCheck]
      }
    })

    // Gộp nhóm cuối cùng
    const mergeLast = (rows, colLetter) => {
      if (rows.length > 1) {
        worksheet.mergeCells(`${colLetter}${rows[0]}:${colLetter}${rows[rows.length - 1]}`)
      }
    }
    mergeLast(mergeRows_M, 'M')
    mergeLast(mergeRows_N, 'N')
    mergeLast(mergeRows_O, 'O')
    mergeLast(mergeRows_P, 'P')
    mergeLast(mergeRows_Q, 'Q')


    worksheet.getCell('A1').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }

    worksheet.pageSetup = {
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    worksheet.getRow(1).height = 30

    // Widths
    const customColumnWidths = [
      8, // STT
      22, // Mã ĐĐH
      25, // NCC
      15, // SĐT
      35, // Địa chỉ
      20, // Người tạo
      30, // Sản phẩm
      10, // SL
      10, // ĐVT
      15, // Giá
      15, // Thành tiền
      15, // Tổng đơn
      15, // Thuế
      15, // Giảm giá
      20, // Công nợ
      15, // Trạng thái
      20, // Ngày tạo
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // Align Left specific columns: Code, Supplier, Phone, Address, Creator, Product, Unit, Status, Date
    const alignLeftCols = [2, 3, 4, 5, 6, 7, 9, 16, 17]
    alignLeftCols.forEach((colIdx) => {
      worksheet.getColumn(colIdx).alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      }
    })

    // Format Numbers
    const numberCols = [8, 10, 11, 12, 13, 14, 15] // Qty, Price, Amount, Total, Tax, Discount, Debt...
    numberCols.forEach((colIdx) => {
      const col = worksheet.getColumn(colIdx)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 2) {
          const numValue = parseFloat(cell.value.replace(/[^\d.-]/g, ''))
          if (!isNaN(numValue)) cell.value = numValue
        }
        col.numFmt = '#,##0'
      })
    })

    // Header Style
    worksheet.getRow(2).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo đơn mua hàng từ ${fromDate} đến ${toDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    onOpenChange(false)
    props.closeExport?.()
  }

  let indexTable = 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Danh sách đơn mua hàng</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id={'exportPOTable'}>
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã ĐĐH</TableHead>
                  <TableHead className="min-w-40">NCC</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Sản phẩm</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-28">Giá</TableHead>
                  <TableHead className="min-w-28">Thành tiền</TableHead>
                  {/* Merge fields */}
                  <TableHead className="min-w-28">Tổng đơn</TableHead>
                  <TableHead className="min-w-28">Thuế</TableHead>
                  <TableHead className="min-w-28">Giảm giá</TableHead>
                  <TableHead className="min-w-28">Công nợ</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((order) => {
                  const items = order.items || []
                  return items.map((item, itemIndex) => {
                    const paidAmount = parseFloat(order.paidAmount || 0)
                    const totalAmount = parseFloat(order.totalAmount || 0)
                    const debt = totalAmount - paidAmount

                    return (
                      <TableRow key={`${order.id}-${item.id || itemIndex}`}>
                        <TableCell>{indexTable++}</TableCell>
                        <TableCell>{order.code}</TableCell>
                        <TableCell>{order.supplier?.name}</TableCell>
                        <TableCell>{order.supplier?.phone}</TableCell>
                        <TableCell>{order.supplier?.address || ''}</TableCell>
                        <TableCell>{order.createdByUser?.fullName || order.user?.fullName || order.createdBy}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitName}</TableCell>
                        <TableCell>{moneyFormat(item.unitPrice, false)}</TableCell>
                        <TableCell>{moneyFormat(item.totalAmount || (item.quantity * item.unitPrice), false)}</TableCell>

                        <TableCell>{moneyFormat(order.totalAmount, false)}</TableCell>
                        <TableCell>{moneyFormat(order.taxAmount, false)}</TableCell>
                        <TableCell>{moneyFormat(order.discount, false)}</TableCell>
                        <TableCell>
                          {order.paymentStatus === 'paid' ? 0 : moneyFormat(debt, false)}
                        </TableCell>
                        <TableCell>
                          {/* Simple Status Translation */}
                          {order.status === 'draft' ? 'Nháp' :
                            order.status === 'ordered' ? 'Đã đặt' :
                              order.status === 'completed' ? 'Hoàn thành' :
                                order.status === 'cancelled' ? 'Đã hủy' : order.status}
                        </TableCell>
                        <TableCell>{dateFormat(order.createdAt, false)}</TableCell>
                      </TableRow>
                    )
                  })
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>

          <Button onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportPurchaseOrderView
