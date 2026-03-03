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
} from '@/components/ui/dialog'
import ExcelJS from 'exceljs'
import { IconDownload } from '@tabler/icons-react'
import { useDispatch } from 'react-redux'
import { getSetting } from '@/stores/SettingSlice'

const STATUS_MAP = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  liquidated: 'Đã thanh lý',
  partial: 'Một phần',
}
const getStatusLabel = (s) => STATUS_MAP[s] ?? s ?? '—'

const PAYMENT_STATUS_MAP = {
  paid: 'Đã TT',
  partial: 'TT 1 phần',
  unpaid: 'Chưa TT',
}
const getPaymentLabel = (s) => PAYMENT_STATUS_MAP[s] ?? s ?? '—'

const ExportPurchaseContractView = ({
  open,
  onOpenChange,
  data = [],
  fromDate,
  toDate,
  closeExport,
}) => {
  const dispatch = useDispatch()
  const fromLabel = dateFormat(fromDate)
  const toLabel = dateFormat(toDate)

  const handleExport = async () => {
    const response = await dispatch(getSetting('general_information'))
    const { brandName, address, phone, email, website } = response?.payload?.payload || {}

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Hợp đồng mua', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportPurchaseContractTable')

    // === THÔNG TIN CÔNG TY ===
    const phoneEmail = []
    if (phone) phoneEmail.push(`SĐT: ${phone}`)
    if (email) phoneEmail.push(`Email: ${email}`)
    if (website) phoneEmail.push(`Website: ${website}`)

    worksheet.mergeCells('A1:R1')
    const companyCell = worksheet.getCell('A1')
    companyCell.value = {
      richText: [
        { font: { name: 'Times New Roman', size: 13, bold: true }, text: brandName ? brandName.toUpperCase() : 'TÊN CÔNG TY' },
        { font: { name: 'Times New Roman', size: 11 }, text: address ? `\nĐịa chỉ: ${address}` : '\nĐịa chỉ:' },
        { font: { name: 'Times New Roman', size: 11 }, text: phoneEmail.length > 0 ? `\n${phoneEmail.join(' - ')}` : '' },
      ],
    }
    companyCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    worksheet.getRow(1).height = 72

    // === TIÊU ĐỀ ===
    worksheet.mergeCells('A2:R2')
    worksheet.getCell('A2').value = `Báo cáo danh sách hợp đồng mua từ ${fromLabel} đến ${toLabel}`

    // === ĐỌC DỮ LIỆU TỪ TABLE HTML ===
    const rows = table.querySelectorAll('tr')
    const rowsData = []
    rows.forEach((row) => {
      const rowData = []
      row.querySelectorAll('td, th').forEach((cell) => {
        rowData.push(cell.innerText.trim())
      })
      rowsData.push(rowData)
    })

    rowsData.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row)
      if (rowIndex > 0) {
        excelRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          }
          cell.font = { name: 'Times New Roman', size: 12 }
          cell.alignment = { vertical: 'top', horizontal: 'right', wrapText: true }
        })
      }
    })

    // Style tiêu đề báo cáo
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 13, bold: true }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getRow(2).height = 26

    // In trang
    worksheet.pageSetup = {
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }

    // Độ rộng cột (18 cột: A–R)
    const colWidths = [
      6,   // A  STT
      22,  // B  Mã HĐ
      25,  // C  NCC/KH
      15,  // D  SĐT
      30,  // E  Địa chỉ
      20,  // F  Người tạo
      18,  // G  Ngày HĐ
      18,  // H  Hạn HĐ
      22,  // I  Tổng tiền
      18,  // J  Thuế
      18,  // K  Giảm giá
      18,  // L  Đã TT
      18,  // M  Công nợ
      20,  // N  Thanh toán
      20,  // O  Trạng thái
      25,  // P  DS đơn mua
      18,  // Q  Ngày tạo
      30,  // R  Ghi chú
    ]
    worksheet.columns.forEach((col, i) => { col.width = colWidths[i] || 15 })

    // Căn trái: B=2, C=3, D=4, E=5, F=6, P=16, R=18
    const leftAlignCols = [2, 3, 4, 5, 6, 16, 18]
    leftAlignCols.forEach((col) => {
      worksheet.getColumn(col).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
    })

    // Căn giữa STT (col 1)
    worksheet.getColumn(1).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      if (rowNumber > 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
      }
    })

    // Khôi phục company & title alignment
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }

    // Chuyển thành số: Tổng(9), Thuế(10), GG(11), Đã TT(12), Công nợ(13)
    const numberCols = [9, 10, 11, 12, 13]
    numberCols.forEach((col) => {
      worksheet.getColumn(col).eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 3) {
          const num = parseFloat(cell.value.replace(/\./g, '').replace(/,/g, '.'))
          if (!isNaN(num)) cell.value = num
        }
      })
      worksheet.getColumn(col).numFmt = '#,##0'
    })

    // Header row style
    worksheet.getRow(3).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      }
    })
    worksheet.getRow(3).height = 36

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo hợp đồng mua từ ${fromLabel} đến ${toLabel}.xlsx`
    document.body.appendChild(a)
    a.click()
    onOpenChange(false)
    closeExport?.()
  }

  let idx = 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Danh sách hợp đồng mua</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportPurchaseContractTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-36">Mã HĐ</TableHead>
                  <TableHead className="min-w-40">NCC/KH</TableHead>
                  <TableHead className="min-w-28">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-36">Người tạo</TableHead>
                  <TableHead className="min-w-28">Ngày HĐ</TableHead>
                  <TableHead className="min-w-28">Hạn HĐ</TableHead>
                  <TableHead className="min-w-32">Tổng tiền</TableHead>
                  <TableHead className="min-w-28">Thuế</TableHead>
                  <TableHead className="min-w-28">Giảm giá</TableHead>
                  <TableHead className="min-w-28">Đã TT</TableHead>
                  <TableHead className="min-w-28">Công nợ</TableHead>
                  <TableHead className="min-w-28">Thanh toán</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-40">DS đơn mua</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((contract) => {
                  const total = parseFloat(contract.totalAmount || 0)
                  const paid = parseFloat(contract.paidAmount || 0)
                  const debt = total - paid
                  const partner = contract.supplier || contract.customer

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>{idx++}</TableCell>
                      <TableCell>{contract.code}</TableCell>
                      <TableCell>
                        {contract.supplier?.name ?? contract.customer?.name ?? contract.supplierName ?? '—'}
                      </TableCell>
                      <TableCell>
                        {contract.supplier?.phone ?? contract.customer?.phone ?? contract.supplierPhone ?? '—'}
                      </TableCell>
                      <TableCell>
                        {contract.supplier?.address ?? contract.customer?.address ?? contract.supplierAddress ?? ''}
                      </TableCell>
                      <TableCell>{contract.createdByUser?.fullName ?? '—'}</TableCell>
                      <TableCell>{contract.contractDate ? dateFormat(contract.contractDate, false) : '—'}</TableCell>
                      <TableCell>{contract.validUntil ? dateFormat(contract.validUntil, false) : '—'}</TableCell>
                      <TableCell>{moneyFormat(total, false)}</TableCell>
                      <TableCell>{moneyFormat(parseFloat(contract.taxAmount || 0), false)}</TableCell>
                      <TableCell>{moneyFormat(parseFloat(contract.discountAmount || 0), false)}</TableCell>
                      <TableCell>{moneyFormat(paid, false)}</TableCell>
                      <TableCell>{debt > 0 ? moneyFormat(debt, false) : 0}</TableCell>
                      <TableCell>{getPaymentLabel(contract.paymentStatus)}</TableCell>
                      <TableCell>{getStatusLabel(contract.status)}</TableCell>
                      <TableCell>
                        {contract.purchaseOrders?.length > 0
                          ? contract.purchaseOrders.map(o => o.code).join(', ')
                          : '—'}
                      </TableCell>
                      <TableCell>{dateFormat(contract.createdAt, false)}</TableCell>
                      <TableCell>{contract.note || ''}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">Hủy</Button>
          </DialogClose>
          <Button onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportPurchaseContractView
