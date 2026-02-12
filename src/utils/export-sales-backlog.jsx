
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const exportSalesBacklogToExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Đơn Bán Chưa Giao')

    // 1. Headers Info
    worksheet.mergeCells('A1:J1')
    worksheet.getCell('A1').value = 'CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG'
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }

    worksheet.mergeCells('A2:J2')
    worksheet.getCell('A2').value = 'Số 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam.'
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 11 }

    worksheet.mergeCells('A4:J4')
    worksheet.getCell('A4').value = 'DANH SÁCH ĐƠN BÁN CHƯA GIAO'
    worksheet.getCell('A4').font = { name: 'Times New Roman', bold: true, size: 16, color: { argb: 'FFC00000' } } // Red color
    worksheet.getCell('A4').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A5:J5')
    const date = new Date().toLocaleDateString('en-GB')
    worksheet.getCell('A5').value = `Ngày xuất báo cáo: ${date}`
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.getCell('A5').font = { name: 'Times New Roman', bold: true, italic: true }

    // 2. Table Header
    const headerRow = 7

    const columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Mã ĐH', key: 'code', width: 15 },
      { header: 'Khách hàng', key: 'customer', width: 25 },
      { header: 'SĐT', key: 'phone', width: 15 },
      { header: 'Sản phẩm', key: 'product', width: 30 },
      { header: 'SL Đặt', key: 'ordered', width: 10 },
      { header: 'SL Đã giao', key: 'delivered', width: 12 },
      { header: 'Ngày hẹn', key: 'date', width: 15 },
      { header: 'Tổng tiền', key: 'total', width: 18 },
      { header: 'Đã trả', key: 'paid', width: 18 },
      { header: 'Còn lại', key: 'remaining', width: 18 },
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
    // Prepare data: flatten contracts into items
    const flattenedData = []

    if (data && data.length > 0) {
      data.forEach(contract => {
        if (contract.items && contract.items.length > 0) {
          const contractTotal = Number(contract.totalAmount) || 0
          const contractPaid = Number(contract.paidAmount) || 0
          const itemCount = contract.items.length
          const itemTotal = contractTotal / itemCount
          const itemPaid = contractPaid / itemCount
          const itemRemaining = itemTotal - itemPaid

          contract.items.forEach(item => {
            flattenedData.push({
              ...item,
              contractCode: contract.code,
              buyerName: contract.buyerName,
              buyerPhone: contract.buyerPhone,
              deliveryDate: contract.deliveryDate,
              itemTotal,
              itemPaid,
              itemRemaining
            })
          })
        }
      })
    }

    // Calculate Totals
    const totals = flattenedData.reduce((acc, item) => {
      return {
        itemTotal: acc.itemTotal + (item.itemTotal || 0),
        itemPaid: acc.itemPaid + (item.itemPaid || 0),
        itemRemaining: acc.itemRemaining + (item.itemRemaining || 0),
      }
    }, {
      itemTotal: 0,
      itemPaid: 0,
      itemRemaining: 0,
    })

    let currentRow = 8

    // "Cộng" Row
    worksheet.getCell(`B${currentRow}`).value = 'Cộng'

    // Set Totals
    worksheet.getCell(`I${currentRow}`).value = totals.itemTotal
    worksheet.getCell(`J${currentRow}`).value = totals.itemPaid
    worksheet.getCell(`K${currentRow}`).value = totals.itemRemaining

    const rowTotal = worksheet.getRow(currentRow)
    rowTotal.font = { name: 'Times New Roman', bold: true, color: { argb: 'FFC00000' } }
    rowTotal.alignment = { vertical: 'middle', horizontal: 'center' }

    // Apply borders and format for Total row
    for (let c = 1; c <= 11; c++) {
      const cell = rowTotal.getCell(c)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      if (c >= 9) { // Money columns
        cell.numFmt = '#,##0'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
      if (c === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      }
    }

    currentRow = 9

    if (flattenedData.length > 0) {
      flattenedData.forEach((item, index) => {
        const row = worksheet.getRow(currentRow + index)
        row.font = { name: 'Times New Roman', size: 11 }

        const dateStr = item.promisedDeliveryDate
          ? new Date(item.promisedDeliveryDate).toLocaleDateString('en-GB')
          : item.deliveryDate
            ? new Date(item.deliveryDate).toLocaleDateString('en-GB')
            : '-'

        row.getCell(1).value = index + 1
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(2).value = item.contractCode
        row.getCell(3).value = item.buyerName
        row.getCell(4).value = item.buyerPhone
        row.getCell(5).value = item.productName

        row.getCell(6).value = Number(item.quantity) || 0 // SL Dat
        row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(7).value = Number(item.deliveredQuantity) || 0 // SL Da giao
        row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(8).value = dateStr
        row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(9).value = item.itemTotal
        row.getCell(10).value = item.itemPaid
        row.getCell(11).value = item.itemRemaining

        // Borders and Number Format
        for (let c = 1; c <= 11; c++) {
          const cell = row.getCell(c)
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          if (c >= 9) {
            cell.numFmt = '#,##0'
            cell.alignment = { horizontal: 'right', vertical: 'middle' }
          }
        }
      })
      currentRow += flattenedData.length
    }

    // 4. Footer
    const footerRow = currentRow + 2
    worksheet.getCell(`A${footerRow}`).value = 'Xác nhận nội dung trên là đúng'
    worksheet.getCell(`A${footerRow}`).font = { name: 'Times New Roman', bold: true }

    const signRow = footerRow + 1
    worksheet.getCell(`C${signRow}`).value = 'Người lập biểu'
    worksheet.getCell(`C${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`C${signRow}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`I${signRow}`).value = 'Giám đốc'
    worksheet.getCell(`I${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`I${signRow}`).alignment = { horizontal: 'center' }

    const signRow2 = signRow + 1
    worksheet.getCell(`C${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`C${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`C${signRow2}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`I${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`I${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`I${signRow2}`).alignment = { horizontal: 'center' }

    // 5. Generate File
    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = `Bao_Cao_Don_Ban_Chua_Giao_${new Date().getTime()}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất báo cáo.')
  }
}
