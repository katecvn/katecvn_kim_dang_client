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

    worksheet.mergeCells('A1:X1')
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

    // Các cột cần gộp giống thông tin master (Hóa đơn)
    let mergeRows_B = [] // Mã HĐ
    let mergeRows_C = [] // Mã HĐ/Bán
    let mergeRows_D = [] // KH
    let mergeRows_E = [] // SĐT
    let mergeRows_F = [] // Địa chỉ
    let mergeRows_G = [] // Người tạo
    let mergeRows_M = [] // Tổng hóa đơn
    let mergeRows_O = [] // Giảm giá HD
    let mergeRows_P = [] // Chia DS
    let mergeRows_Q = [] // Tổng chia DS
    let mergeRows_R = [] // Người được chia
    let mergeRows_S = [] // Công nợ
    let mergeRows_T = [] // Thanh toán
    let mergeRows_U = [] // DS phiếu xuất
    let mergeRows_V = [] // Trạng thái
    let mergeRows_W = [] // Ngày T.Toán/HĐ
    let mergeRows_X = [] // Ngày tạo

    let previousInvoiceCode = null

    const doMerge = (rows, colLetter) => {
      if (rows.length > 1) {
        worksheet.mergeCells(`${colLetter}${rows[0]}:${colLetter}${rows[rows.length - 1]}`)
      }
    }

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
          mergeRows_B.push(excelRow.number)
          mergeRows_C.push(excelRow.number)
          mergeRows_D.push(excelRow.number)
          mergeRows_E.push(excelRow.number)
          mergeRows_F.push(excelRow.number)
          mergeRows_G.push(excelRow.number)
          mergeRows_M.push(excelRow.number)
          mergeRows_O.push(excelRow.number) // Assuming column indexing might shift, we will just merge specific structural end-columns based on their letter: 
          mergeRows_P.push(excelRow.number)
          mergeRows_Q.push(excelRow.number)
          mergeRows_R.push(excelRow.number)
          mergeRows_S.push(excelRow.number)
          mergeRows_T.push(excelRow.number)
          mergeRows_U.push(excelRow.number)
          mergeRows_V.push(excelRow.number)
          mergeRows_W.push(excelRow.number)
          mergeRows_X.push(excelRow.number)
        } else {
          // Thực hiện gộp ô nhóm trước đó
          doMerge(mergeRows_B, 'B')
          doMerge(mergeRows_C, 'C')
          doMerge(mergeRows_D, 'D')
          doMerge(mergeRows_E, 'E')
          doMerge(mergeRows_F, 'F')
          doMerge(mergeRows_G, 'G')
          doMerge(mergeRows_M, 'N') // Actually refers to N if columns shift, we map dynamically based on TableHead
          doMerge(mergeRows_O, 'O')
          doMerge(mergeRows_P, 'P')
          doMerge(mergeRows_Q, 'Q')
          doMerge(mergeRows_R, 'R')
          doMerge(mergeRows_S, 'S')
          doMerge(mergeRows_T, 'T')
          doMerge(mergeRows_U, 'U')
          doMerge(mergeRows_V, 'V')
          doMerge(mergeRows_W, 'W')
          doMerge(mergeRows_X, 'X')

          // Bắt đầu nhóm mới
          mergeRows_B = [excelRow.number]
          mergeRows_C = [excelRow.number]
          mergeRows_D = [excelRow.number]
          mergeRows_E = [excelRow.number]
          mergeRows_F = [excelRow.number]
          mergeRows_G = [excelRow.number]
          mergeRows_M = [excelRow.number]
          mergeRows_O = [excelRow.number]
          mergeRows_P = [excelRow.number]
          mergeRows_Q = [excelRow.number]
          mergeRows_R = [excelRow.number]
          mergeRows_S = [excelRow.number]
          mergeRows_T = [excelRow.number]
          mergeRows_U = [excelRow.number]
          mergeRows_V = [excelRow.number]
          mergeRows_W = [excelRow.number]
          mergeRows_X = [excelRow.number]
        }
        previousInvoiceCode = row[columnIndexForCheck]
      }
    })
    // Gộp ô nhóm cuối cùng
    doMerge(mergeRows_B, 'B')
    doMerge(mergeRows_C, 'C')
    doMerge(mergeRows_D, 'D')
    doMerge(mergeRows_E, 'E')
    doMerge(mergeRows_F, 'F')
    doMerge(mergeRows_G, 'G')
    doMerge(mergeRows_M, 'N')
    doMerge(mergeRows_O, 'O')
    doMerge(mergeRows_P, 'P')
    doMerge(mergeRows_Q, 'Q')
    doMerge(mergeRows_R, 'R')
    doMerge(mergeRows_S, 'S')
    doMerge(mergeRows_T, 'T')
    doMerge(mergeRows_U, 'U')
    doMerge(mergeRows_V, 'V')
    doMerge(mergeRows_W, 'W')
    doMerge(mergeRows_X, 'X')

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
      6, // STT
      22, // Mã HĐ
      22, // Mã HĐ/Bán
      25, // KH
      15, // SĐT
      35, // Địa chỉ
      20, // Người tạo
      30, // Sản phẩm
      8, // SL
      8, // Tặng
      10, // ĐVT
      15, // Giá
      15, // Thành tiền
      15, // Tổng hóa đơn
      15, // Thuế
      15, // Giảm giá
      15, // Chia DS
      15, // Tổng chia DS
      20, // Người được chia
      20, // Công nợ
      22, // Thanh toán
      28, // DS phiếu xuất
      15, // Trạng thái
      20, // Ngày HĐ
      20, // Ngày tạo
      30, // Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    const customColumnsAlignment = [2, 3, 4, 5, 6, 7, 8, 10, 23, 24, 25, 26]
    const customColumnConvertToNumber = [9, 10, 12, 13, 14, 15, 16, 17, 18, 20]

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
          // Remove dots (thousands separator in VN) before parsing
          const numValue = parseFloat(cell.value.replace(/\./g, '').replace(/,/g, '.'))

          if (!isNaN(numValue)) {
            cell.value = numValue // Chuyển thành số
          }
        }
      })
      col.numFmt = '#,##0'
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
                  <TableHead className="min-w-36">Mã HĐ/Bán</TableHead>
                  <TableHead className="min-w-40">KH</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Tên sản phẩm</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">Tặng</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-32">Giá</TableHead>
                  <TableHead className="min-w-32">Thành tiền</TableHead>
                  {/* Merge */}
                  <TableHead className="min-w-32">Tổng hóa đơn</TableHead>
                  <TableHead className="min-w-28">Thuế</TableHead>
                  <TableHead className="min-w-28">Giảm giá</TableHead>
                  <TableHead className="min-w-28">Chia DS</TableHead>
                  <TableHead className="min-w-28">Tổng chia DS</TableHead>
                  <TableHead className="min-w-28">Người được chia</TableHead>
                  <TableHead className="min-w-32">Công nợ</TableHead>
                  <TableHead className="min-w-36">Thanh toán</TableHead>
                  <TableHead className="min-w-40">DS phiếu xuất</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-28">Ngày HĐ</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((invoice) =>
                  invoice.invoiceItems.map((invoiceItem) => (
                    <TableRow key={`${invoice.id}-${invoiceItem.id}`}>
                      <TableCell>{indexTable++}</TableCell>
                      <TableCell>{invoice.code}</TableCell>
                      <TableCell>{invoice.salesContract?.code ?? '—'}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.customerPhone}</TableCell>
                      <TableCell>{invoice.customerAddress}</TableCell>
                      <TableCell>{invoice.user?.fullName}</TableCell>
                      <TableCell>{invoiceItem.productName}</TableCell>
                      <TableCell>{moneyFormat(invoiceItem.quantity, false)}</TableCell>
                      <TableCell>{moneyFormat(invoiceItem.giveaway, false)}</TableCell>
                      <TableCell>{invoiceItem.unitName}</TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.price, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.total, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoice.totalAmount || invoice.amount, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoice.taxAmount, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoice.discountAmount || invoice.discount, false)}
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
                        {(() => {
                          const paymentStatus = invoice.paymentStatus
                          const totalAmount = parseFloat(invoice.totalAmount || invoice.amount || 0)
                          const paidAmount = parseFloat(invoice.paidAmount || 0)
                          const remainingAmount = totalAmount - paidAmount

                          if (paymentStatus === 'paid') return 0
                          if (remainingAmount <= 0) return 0
                          return moneyFormat(remainingAmount, false)
                        })()}
                      </TableCell>
                      <TableCell>
                        {invoice.paymentStatus === 'paid'
                          ? 'Đã T.Toán'
                          : invoice.paymentStatus === 'partial'
                            ? `T.T 1 phần (${moneyFormat(invoice.paidAmount || 0, false)})`
                            : 'Chưa T.Toán'}
                      </TableCell>
                      <TableCell>
                        {invoice.warehouseReceipts?.length > 0
                          ? invoice.warehouseReceipts.map((wr) => wr.code).join(', ')
                          : invoice.salesContract?.warehouseReceipts?.length > 0
                            ? invoice.salesContract?.warehouseReceipts?.map((wr) => wr.code).join(', ')
                            : 'Không có'}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'delivered'
                          ? 'Hoàn thành'
                          : invoice.status === 'accepted'
                            ? 'Đã xác nhận'
                            : invoice.status === 'pending'
                              ? 'Chờ xác nhận'
                              : invoice.status === 'rejected'
                                ? 'Từ chối'
                                : invoice.status}
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceDate ? dateFormat(invoice.invoiceDate, false) : '—'}
                      </TableCell>
                      <TableCell>
                        {dateFormat(invoiceItem.createdAt, false)}
                      </TableCell>
                      <TableCell>{invoice.note || invoiceItem.note}</TableCell>
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
