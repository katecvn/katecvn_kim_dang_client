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

const ExportInvoiceView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const fromDate = dateFormat(props.fromDate)
  const toDate = dateFormat(props.toDate)

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Chi tiết hóa đơn', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportTable')

    worksheet.mergeCells('A1:V1')
    worksheet.getCell('A1').value =
      `Báo cáo danh sách hóa đơn từ ${fromDate} đến ${toDate}`

    const rows = table.querySelectorAll('tr')
    const data = []

    rows.forEach((row) => {
      const rowData = []
      row.querySelectorAll('td, th').forEach((cell) => {
        rowData.push(cell.innerText.trim())
      })
      data.push(rowData)
    })

    const columnIndexForCheck = 1 // Cột B (index 1) để kiểm tra nhóm dữ liệu

    let mergeRows_M = []
    let mergeRows_Q = []
    let previousInvoiceCode = null

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

        // Kiểm tra nếu Mã HĐ trùng
        if (row[columnIndexForCheck] === previousInvoiceCode) {
          mergeRows_M.push(excelRow.number)
          mergeRows_Q.push(excelRow.number)
        } else {
          // Thực hiện gộp ô nếu có nhóm trước đó
          if (mergeRows_M.length > 1) {
            worksheet.mergeCells(
              `M${mergeRows_M[0]}:M${mergeRows_M[mergeRows_M.length - 1]}`,
            )
          }
          if (mergeRows_Q.length > 1) {
            worksheet.mergeCells(
              `Q${mergeRows_Q[0]}:Q${mergeRows_Q[mergeRows_Q.length - 1]}`,
            )
          }

          // Bắt đầu nhóm mới
          mergeRows_M = [excelRow.number]
          mergeRows_Q = [excelRow.number]
        }
        previousInvoiceCode = row[columnIndexForCheck]
      }
    })
    // Kiểm tra gộp ô nhóm cuối cùng
    if (mergeRows_M.length > 1) {
      worksheet.mergeCells(
        `M${mergeRows_M[0]}:M${mergeRows_M[mergeRows_M.length - 1]}`,
      )
    }
    if (mergeRows_Q.length > 1) {
      worksheet.mergeCells(
        `Q${mergeRows_Q[0]}:Q${mergeRows_Q[mergeRows_Q.length - 1]}`,
      )
    }

    worksheet.getCell('A1').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }

    worksheet.pageSetup = {
      margins: {
        left: 0.5, // Lề trái 0.5 inch
        right: 0.5, // Lề phải 0.5 inch
        top: 0.75, // Lề trên 0.75 inch
        bottom: 0.75, // Lề dưới 0.75 inch
        header: 0.3, // Khoảng cách từ header tới nội dung là 0.3 inch
        footer: 0.3, // Khoảng cách từ footer tới nội dung là 0.3 inch
      },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    worksheet.getRow(1).height = 2 * 15

    // Chỉnh độ rộng của từng cột
    const customColumnWidths = [
      8, // STT
      22, // Mã HĐ
      25, // KH
      15, // SĐT
      35, // Địa chỉ
      20, // Người tạo
      30, // Sản phẩm
      10, // SL
      10, // Tặng
      10, // ĐVT
      15, // Giá
      15, // Tổng cộng
      15, // Tổng hóa đơn
      15, // Thuế
      15, // Giảm giá
      15, // Chia DS
      15, // Tổng chia DS
      20, // Người được chia
      20, // Công nợ
      15, // Trạng thái
      15, // Ngày tạo
      30, // Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    const customColumnsAlignment = [3, 5, 6, 7, 18, 22]
    const customColumnConvertToNumber = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

    customColumnsAlignment.forEach((column) => {
      // Canh trái các cột
      worksheet.getColumn(column).alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      }
    })

    // Chuyển thành số
    customColumnConvertToNumber.forEach((column) => {
      const col = worksheet.getColumn(column)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 2) {
          const numValue = parseFloat(cell.value.replace(/[^\d.-]/g, ''))

          if (!isNaN(numValue)) {
            cell.value = numValue // Chuyển thành số
          }
        }
        cell.numFmt = 'Number'
        cell.numFmt = '#,##0'
      })
    })

    // Định dang header
    worksheet.getRow(2).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 14,
        bold: true,
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    // Định dạng tiêu đề báo cáo
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo chi tiết hóa đơn từ ${fromDate} đến ${toDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    // Tắt model preview và date-picker
    onOpenChange()
    props.closeExport()
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
          <DialogTitle>Danh sách hóa đơn</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id={'exportTable'}>
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã HĐ</TableHead>
                  <TableHead className="min-w-20">KH</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Sản phẩm</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">Tặng</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-28">Giá</TableHead>
                  <TableHead className="min-w-28">Tổng cộng</TableHead>
                  {/* Merge */}
                  <TableHead className="min-w-28">Tổng hóa đơn</TableHead>
                  <TableHead className="min-w-28">Thuế</TableHead>
                  <TableHead className="min-w-28">Giảm giá</TableHead>
                  {/* Merge */}
                  <TableHead className="min-w-28">Chia DS</TableHead>
                  <TableHead className="min-w-28">Tổng chia DS</TableHead>
                  <TableHead className="min-w-28">Người được chia</TableHead>
                  <TableHead className="min-w-28">Công nợ</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                  <TableHead className="min-w-28">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((invoice) =>
                  invoice.invoiceItems.map((invoiceItem) => (
                    <TableRow key={indexTable}>
                      <TableCell>{indexTable++}</TableCell>
                      <TableCell>{invoice.code}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.customerPhone}</TableCell>
                      <TableCell>{invoice.customerAddress}</TableCell>
                      <TableCell>{invoice.user?.fullName}</TableCell>
                      <TableCell>{invoiceItem.productName}</TableCell>
                      <TableCell>{invoiceItem.quantity}</TableCell>
                      <TableCell>{invoiceItem.giveaway}</TableCell>
                      <TableCell>{invoiceItem.unitName}</TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.price, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.total, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoice.amount, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.taxAmount, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.discount, false)}
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceRevenueShare
                          ? invoice.invoiceRevenueShare?.sharePercentage * 100 +
                          '%'
                          : 0}
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceRevenueShare
                          ? moneyFormat(
                            invoice.invoiceRevenueShare?.amount,
                            false,
                          )
                          : 0}
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceRevenueShare?.user?.fullName ||
                          'Không có'}
                      </TableCell>
                      <TableCell>
                        {invoice.receipts.length
                          ? invoice.receipts[0]?.debt.status === 'closed'
                            ? 'Thanh toán toàn bộ'
                            : 'Thanh toán một phần'
                          : 'Chưa có phiếu thu'}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'accepted'
                          ? 'Đã duyệt'
                          : 'Chưa duyệt'}
                      </TableCell>
                      <TableCell>
                        {dateFormat(invoiceItem.createdAt, false)}
                      </TableCell>
                      <TableCell>{invoiceItem.note}</TableCell>
                    </TableRow>
                  )),
                )}
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

export default ExportInvoiceView
