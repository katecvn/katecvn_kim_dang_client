import { Button } from '@/components/custom/Button'
import { IconDownload } from '@tabler/icons-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default function DownloadStockExcelTemplate() {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('NhapKho')

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Nhóm hàng', key: 'group', width: 25 },
      { header: 'Mã hàng', key: 'productCode', width: 20 },
      { header: 'Mã vạch (serial)', key: 'barcode', width: 20 }, // sẽ để trống => null
      { header: 'Tên hàng hóa', key: 'productName', width: 35 },
      { header: 'ĐVT', key: 'unit', width: 12 },
      { header: 'SL tồn kho', key: 'stockQty', width: 15 },
      { header: 'Giá trị tồn', key: 'stockValue', width: 18 },
    ]

    // Header style
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { name: 'Times New Roman', size: 13, bold: true }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    // Add empty row template
    const emptyRow = sheet.addRow({
      stt: '',
      group: '',
      productCode: '',
      barcode: '', // => sẽ convert thành null khi import
      productName: '',
      unit: '',
      stockQty: '',
      stockValue: '',
    })

    emptyRow.eachCell((cell) => {
      cell.font = { name: 'Times New Roman', size: 13 }
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'mau_nhap_kho.xlsx')
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <IconDownload className="mr-2 size-4" />
      Tải mẫu Excel
    </Button>
  )
}
