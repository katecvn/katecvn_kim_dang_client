
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const exportRevenueToExcel = async (data, dateRange) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Báo Cáo Doanh Thu')

    // 1. Headers Info
    worksheet.mergeCells('A1:F1')
    worksheet.getCell('A1').value = 'CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG'
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }

    worksheet.mergeCells('A2:F2')
    worksheet.getCell('A2').value = 'Số 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam.'
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 11 }

    worksheet.mergeCells('A4:F4')
    worksheet.getCell('A4').value = 'BÁO CÁO DOANH THU THÁNG'
    worksheet.getCell('A4').font = { name: 'Times New Roman', bold: true, size: 16, color: { argb: 'FFC00000' } } // Red color
    worksheet.getCell('A4').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A5:F5')
    const fDate = dateRange.fromDate ? new Date(dateRange.fromDate).toLocaleDateString('en-GB') : '...'
    const tDate = dateRange.toDate ? new Date(dateRange.toDate).toLocaleDateString('en-GB') : '...'
    worksheet.getCell('A5').value = `Từ ngày ${fDate} đến ${tDate}`
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.getCell('A5').font = { name: 'Times New Roman', bold: true, italic: true }

    // 2. Table Header
    const headerRow = 7

    const columns = [
      { header: 'STT', key: 'stt', width: 10 },
      { header: 'Ngày', key: 'period', width: 20 },
      { header: 'Số đơn hàng', key: 'orderCount', width: 15 },
      { header: 'Doanh số', key: 'totalSales', width: 20 },
      { header: 'Đã thanh toán', key: 'totalPaid', width: 20 },
      { header: 'Chưa thanh toán', key: 'unpaid', width: 20 },
    ]

    columns.forEach((col, index) => {
      const cell = worksheet.getCell(headerRow, index + 1)
      cell.value = col.header
      cell.font = { name: 'Times New Roman', bold: true }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      worksheet.getColumn(index + 1).width = col.width
    })

    // 3. Data Body
    // Calculate Totals
    const totals = (data || []).reduce((acc, item) => {
      const totalSales = Number(item.totalSales) || 0
      const totalPaid = Number(item.totalPaid) || 0
      const unpaid = totalSales - totalPaid
      return {
        orderCount: acc.orderCount + (Number(item.orderCount) || 0),
        totalSales: acc.totalSales + totalSales,
        totalPaid: acc.totalPaid + totalPaid,
        unpaid: acc.unpaid + unpaid,
      }
    }, {
      orderCount: 0,
      totalSales: 0,
      totalPaid: 0,
      unpaid: 0,
    })

    let currentRow = 8

    // "Cộng" Row
    worksheet.getCell(`B${currentRow}`).value = 'Cộng'
    worksheet.getCell(`C${currentRow}`).value = totals.orderCount
    worksheet.getCell(`D${currentRow}`).value = totals.totalSales
    worksheet.getCell(`E${currentRow}`).value = totals.totalPaid
    worksheet.getCell(`F${currentRow}`).value = totals.unpaid

    const rowTotal = worksheet.getRow(currentRow)
    rowTotal.font = { name: 'Times New Roman', bold: true, color: { argb: 'FFC00000' } }
    rowTotal.alignment = { vertical: 'middle', horizontal: 'center' }

    // Apply borders and format for Total row
    for (let c = 1; c <= 6; c++) {
      const cell = rowTotal.getCell(c)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      if (c >= 3) { // Number columns
        cell.numFmt = '#,##0'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
      if (c === 2) { // "Cộng" text alignment
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      }
    }

    currentRow = 9

    if (data && data.length > 0) {
      data.forEach((item, index) => {
        const row = worksheet.getRow(currentRow + index)
        row.font = { name: 'Times New Roman', size: 11 }

        const totalSales = Number(item.totalSales) || 0
        const totalPaid = Number(item.totalPaid) || 0
        const unpaid = totalSales - totalPaid

        row.getCell(1).value = index + 1
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(2).value = new Date(item.period).toLocaleDateString('en-GB')
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(3).value = Number(item.orderCount)
        row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(4).value = totalSales
        row.getCell(5).value = totalPaid
        row.getCell(6).value = unpaid

        // Borders and Number Format
        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c)
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          if (c >= 4) {
            cell.numFmt = '#,##0'
            cell.alignment = { horizontal: 'right', vertical: 'middle' }
          }
        }
      })
      currentRow += data.length
    }

    // 4. Footer
    const footerRow = currentRow + 2
    worksheet.getCell(`A${footerRow}`).value = 'Xác nhận nội dung trên là đúng'
    worksheet.getCell(`A${footerRow}`).font = { name: 'Times New Roman', bold: true }

    const signRow = footerRow + 1
    worksheet.getCell(`B${signRow}`).value = 'Người lập biểu'
    worksheet.getCell(`B${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`E${signRow}`).value = 'Giám đốc'
    worksheet.getCell(`E${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`E${signRow}`).alignment = { horizontal: 'center' }

    const signRow2 = signRow + 1
    worksheet.getCell(`B${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`B${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`B${signRow2}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`E${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`E${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`E${signRow2}`).alignment = { horizontal: 'center' }

    // 5. Generate File
    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = `Bao_Cao_Doanh_Thu_${new Date().getTime()}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất báo cáo.')
  }
}
