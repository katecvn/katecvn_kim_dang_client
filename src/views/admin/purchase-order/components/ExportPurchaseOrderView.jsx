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

// ─── Cấu trúc cột (21 cột) ──────────────────────────────────────────────────
// A  STT
// B  Mã ĐĐH
// C  Mã HĐ/NCC          ← MỚI
// D  NCC
// E  SĐT
// F  Địa chỉ
// G  Người tạo
// H  Tên sản phẩm
// I  SL
// J  ĐVT
// K  Giá
// L  Thành tiền
// M  Tổng đơn           ← merge
// N  Thuế               ← merge
// O  Giảm giá           ← merge
// P  Công nợ            ← merge
// Q  Thanh toán         ← merge
// R  DS phiếu nhập      ← merge
// S  Trạng thái         ← merge
// T  Ngày đặt hàng      ← MỚI + merge
// U  Ngày tạo           ← merge

const STATUS_MAP = {
  draft: 'Nháp',
  ordered: 'Đã đặt',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  partial: 'Nhập một phần',
}

const getStatusLabel = (status) => STATUS_MAP[status] ?? status ?? ''

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

    // Tiêu đề: A1:U1 (21 cột)
    worksheet.mergeCells('A1:U1')
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

    const columnIndexForCheck = 1 // Cột B – Mã ĐĐH

    // Các nhóm cột cần merge theo đơn (M→U)
    let mergeRows_M = []
    let mergeRows_N = []
    let mergeRows_O = []
    let mergeRows_P = []
    let mergeRows_Q = []
    let mergeRows_R = []
    let mergeRows_S = []
    let mergeRows_T = []
    let mergeRows_U = []

    let previousCode = null

    const doMerge = (rows, colLetter) => {
      if (rows.length > 1) {
        worksheet.mergeCells(
          `${colLetter}${rows[0]}:${colLetter}${rows[rows.length - 1]}`
        )
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
          cell.font = { name: 'Times New Roman', size: 12 }
          cell.alignment = {
            vertical: 'top',
            horizontal: 'right',
            wrapText: true,
          }
        })

        if (row[columnIndexForCheck] === previousCode) {
          mergeRows_M.push(excelRow.number)
          mergeRows_N.push(excelRow.number)
          mergeRows_O.push(excelRow.number)
          mergeRows_P.push(excelRow.number)
          mergeRows_Q.push(excelRow.number)
          mergeRows_R.push(excelRow.number)
          mergeRows_S.push(excelRow.number)
          mergeRows_T.push(excelRow.number)
          mergeRows_U.push(excelRow.number)
        } else {
          // Gộp nhóm trước
          doMerge(mergeRows_M, 'M')
          doMerge(mergeRows_N, 'N')
          doMerge(mergeRows_O, 'O')
          doMerge(mergeRows_P, 'P')
          doMerge(mergeRows_Q, 'Q')
          doMerge(mergeRows_R, 'R')
          doMerge(mergeRows_S, 'S')
          doMerge(mergeRows_T, 'T')
          doMerge(mergeRows_U, 'U')

          // Bắt đầu nhóm mới
          mergeRows_M = [excelRow.number]
          mergeRows_N = [excelRow.number]
          mergeRows_O = [excelRow.number]
          mergeRows_P = [excelRow.number]
          mergeRows_Q = [excelRow.number]
          mergeRows_R = [excelRow.number]
          mergeRows_S = [excelRow.number]
          mergeRows_T = [excelRow.number]
          mergeRows_U = [excelRow.number]
        }
        previousCode = row[columnIndexForCheck]
      }
    })

    // Gộp nhóm cuối
    doMerge(mergeRows_M, 'M')
    doMerge(mergeRows_N, 'N')
    doMerge(mergeRows_O, 'O')
    doMerge(mergeRows_P, 'P')
    doMerge(mergeRows_Q, 'Q')
    doMerge(mergeRows_R, 'R')
    doMerge(mergeRows_S, 'S')
    doMerge(mergeRows_T, 'T')
    doMerge(mergeRows_U, 'U')

    // Tiêu đề file
    worksheet.getCell('A1').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }

    // In trang
    worksheet.pageSetup = {
      margins: {
        left: 0.5, right: 0.5, top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3,
      },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    worksheet.getRow(1).height = 30

    // ── Độ rộng cột (21 cột) ──────────────────────────────────────────────
    const customColumnWidths = [
      6,  // A – STT
      22, // B – Mã ĐĐH
      22, // C – Mã HĐ/NCC       ← MỚI
      28, // D – NCC
      14, // E – SĐT
      35, // F – Địa chỉ
      20, // G – Người tạo
      30, // H – Tên sản phẩm
      8,  // I – SL
      10, // J – ĐVT
      18, // K – Giá
      18, // L – Thành tiền
      18, // M – Tổng đơn
      15, // N – Thuế
      15, // O – Giảm giá
      20, // P – Công nợ
      22, // Q – Thanh toán
      28, // R – DS phiếu nhập
      18, // S – Trạng thái
      18, // T – Ngày đặt hàng   ← MỚI
      20, // U – Ngày tạo
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // ── Căn trái ──────────────────────────────────────────────────────────
    // B=2, C=3, D=4, E=5, F=6, G=7, H=8, J=10, S=19, T=20, U=21
    const alignLeftCols = [2, 3, 4, 5, 6, 7, 8, 10, 19, 20, 21]
    alignLeftCols.forEach((colIdx) => {
      worksheet.getColumn(colIdx).alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      }
    })

    // ── Format số (I=9, K=11, L=12, M=13, N=14, O=15, P=16) ─────────────
    const numberCols = [9, 11, 12, 13, 14, 15, 16]
    numberCols.forEach((colIdx) => {
      const col = worksheet.getColumn(colIdx)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 2) {
          // Xóa dấu chấm (hàng nghìn) và đổi dấu phẩy (thập phân) thành dấu chấm cho parseFloat
          const rawString = cell.value.replace(/\./g, '').replace(/,/g, '.')
          const numValue = parseFloat(rawString)
          if (!isNaN(numValue)) cell.value = numValue
        }
      })
      col.numFmt = '#,##0'
    })

    // ── Header row style ─────────────────────────────────────────────────
    worksheet.getRow(2).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      }
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      }
    })
    worksheet.getRow(2).height = 36

    // ── Xuất file ────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
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
            <Table className="min-w-full" id="exportPOTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã ĐĐH</TableHead>
                  {/* ── CỘT MỚI ── */}
                  <TableHead className="min-w-36">Mã HĐ/NCC</TableHead>
                  <TableHead className="min-w-40">NCC</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Tên sản phẩm</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-32">Giá</TableHead>
                  <TableHead className="min-w-32">Thành tiền</TableHead>
                  <TableHead className="min-w-32">Tổng đơn</TableHead>
                  <TableHead className="min-w-28">Thuế</TableHead>
                  <TableHead className="min-w-28">Giảm giá</TableHead>
                  <TableHead className="min-w-32">Công nợ</TableHead>
                  <TableHead className="min-w-36">Thanh toán</TableHead>
                  <TableHead className="min-w-40">DS phiếu nhập</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  {/* ── CỘT MỚI ── */}
                  <TableHead className="min-w-28">Ngày đặt hàng</TableHead>
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
                      <TableRow key={`${order.id}-${item.id ?? itemIndex}`}>
                        {/* A – STT */}
                        <TableCell>{indexTable++}</TableCell>
                        {/* B – Mã ĐĐH */}
                        <TableCell>{order.code}</TableCell>
                        {/* C – Mã HĐ/NCC ← MỚI */}
                        <TableCell>
                          {order.purchaseContract?.code ?? '—'}
                        </TableCell>
                        {/* D – NCC */}
                        <TableCell>{order.supplier?.name}</TableCell>
                        {/* E – SĐT */}
                        <TableCell>{order.supplier?.phone}</TableCell>
                        {/* F – Địa chỉ */}
                        <TableCell>{order.supplier?.address ?? ''}</TableCell>
                        {/* G – Người tạo */}
                        <TableCell>
                          {order.createdByUser?.fullName ??
                            order.user?.fullName ??
                            order.createdBy}
                        </TableCell>
                        {/* H – Tên sản phẩm */}
                        <TableCell>
                          {item.productName ?? item.product?.name}
                        </TableCell>
                        {/* I – SL */}
                        <TableCell>
                          {moneyFormat(item.quantity, false)}
                        </TableCell>
                        {/* J – ĐVT */}
                        <TableCell>
                          {item.unitName ?? item.unit?.name}
                        </TableCell>
                        {/* K – Giá */}
                        <TableCell>
                          {moneyFormat(item.unitPrice, false)}
                        </TableCell>
                        {/* L – Thành tiền */}
                        <TableCell>
                          {moneyFormat(
                            item.totalAmount ??
                            item.quantity * item.unitPrice,
                            false
                          )}
                        </TableCell>
                        {/* M – Tổng đơn */}
                        <TableCell>
                          {moneyFormat(order.totalAmount, false)}
                        </TableCell>
                        {/* N – Thuế */}
                        <TableCell>
                          {moneyFormat(order.taxAmount, false)}
                        </TableCell>
                        {/* O – Giảm giá */}
                        <TableCell>
                          {moneyFormat(
                            order.discountAmount ?? order.discount ?? 0,
                            false
                          )}
                        </TableCell>
                        {/* P – Công nợ */}
                        <TableCell>
                          {order.paymentStatus === 'paid'
                            ? 0
                            : moneyFormat(debt, false)}
                        </TableCell>
                        {/* Q – Thanh toán */}
                        <TableCell>
                          {order.paymentStatus === 'paid'
                            ? 'Đã T.Toán'
                            : order.paymentStatus === 'partial'
                              ? `T.T 1 phần (${moneyFormat(paidAmount, false)})`
                              : 'Chưa T.Toán'}
                        </TableCell>
                        {/* R – DS phiếu nhập */}
                        <TableCell>
                          {order.warehouseReceipts?.length > 0
                            ? order.warehouseReceipts
                              .map((wr) => wr.code)
                              .join(', ')
                            : 'Không có'}
                        </TableCell>
                        {/* S – Trạng thái */}
                        <TableCell>{getStatusLabel(order.status)}</TableCell>
                        {/* T – Ngày đặt hàng ← MỚI */}
                        <TableCell>
                          {order.orderDate
                            ? dateFormat(order.orderDate, false)
                            : '—'}
                        </TableCell>
                        {/* U – Ngày tạo */}
                        <TableCell>
                          {dateFormat(order.createdAt, false)}
                        </TableCell>
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