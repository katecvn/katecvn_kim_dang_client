
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const exportPurchaseBacklogToExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Đơn Mua Chưa Nhận')

    // 1. Headers Info
    worksheet.mergeCells('A1:K1')
    worksheet.getCell('A1').value = 'CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG'
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }

    worksheet.mergeCells('A2:K2')
    worksheet.getCell('A2').value = 'Số 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam.'
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 11 }

    worksheet.mergeCells('A4:K4')
    worksheet.getCell('A4').value = 'DANH SÁCH ĐƠN MUA CHƯA NHẬN'
    worksheet.getCell('A4').font = { name: 'Times New Roman', bold: true, size: 16, color: { argb: 'FFC00000' } } // Red color
    worksheet.getCell('A4').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A5:K5')
    const date = new Date().toLocaleDateString('en-GB')
    worksheet.getCell('A5').value = `Ngày xuất báo cáo: ${date}`
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.getCell('A5').font = { name: 'Times New Roman', bold: true, italic: true }

    // 2. Table Header
    const headerRow = 7

    const columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Mã ĐH', key: 'code', width: 15 },
      { header: 'Nhà cung cấp', key: 'supplier', width: 25 },
      { header: 'SĐT', key: 'phone', width: 15 },
      { header: 'Sản phẩm', key: 'product', width: 30 },
      { header: 'SL Đặt', key: 'ordered', width: 10 },
      { header: 'SL Đã nhận', key: 'delivered', width: 12 },
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
    // Prepare data: flatten items
    const flattenedData = []

    if (data && data.length > 0) {
      data.forEach(record => {
        // Case 1: Direct items
        if (record.items && record.items.length > 0) {
          record.items.forEach(item => {
            const total = Number(item.totalAmount) || 0
            const receivedQty = Number(item.receivedQuantity) || 0
            const orderedQty = Number(item.quantity) || 0
            const unitPrice = Number(item.unitPrice) || 0
            const receivedAmount = receivedQty * unitPrice // Approximate paid amount for item based on received qty logic? 
            // Or if API gives specific paid amount per item, better. 
            // In PurchaseBacklogPage, it calculates:
            // receivedAmount = receivedQty * unitPrice
            // remainingAmount = (orderedQty - receivedQty) * unitPrice
            // It seems "Paid" corresponds to "Value of Received Goods" context here or actual payment?
            // Looking at the Page code: 
            // Cell "Đã trả" (Green) -> moneyFormat(receivedAmount) which is receivedQty * unitPrice
            // Cell "Còn lại" (Red) -> moneyFormat(remainingAmount) which is (orderedQty - receivedQty) * unitPrice

            // So for Export, we follow the Page logic:
            const paid = receivedAmount
            const remaining = (orderedQty - receivedQty) * unitPrice

            flattenedData.push({
              ...item,
              orderCode: record.code,
              supplierName: record.supplierName,
              supplierPhone: record.supplierPhone,
              deliveryDate: item.expectedDeliveryDate,
              itemTotal: total,
              itemPaid: paid,
              itemRemaining: remaining
            })
          })
        }
        // Case 2: Nested purchaseOrders
        else if (record.purchaseOrders && record.purchaseOrders.length > 0) {
          record.purchaseOrders.forEach(order => {
            if (order.items && order.items.length > 0) {
              order.items.forEach(item => {
                const total = Number(item.totalAmount) || 0
                const receivedQty = Number(item.receivedQuantity) || 0
                const orderedQty = Number(item.quantity) || 0
                const unitPrice = Number(item.unitPrice) || 0

                const paid = receivedQty * unitPrice
                const remaining = (orderedQty - receivedQty) * unitPrice

                flattenedData.push({
                  ...item,
                  orderCode: order.code,
                  supplierName: record.supplierName,
                  supplierPhone: record.supplierPhone,
                  deliveryDate: item.expectedDeliveryDate,
                  itemTotal: total,
                  itemPaid: paid,
                  itemRemaining: remaining
                })
              })
            }
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

        const dateStr = item.deliveryDate
          ? new Date(item.deliveryDate).toLocaleDateString('en-GB')
          : '-'

        row.getCell(1).value = index + 1
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(2).value = item.orderCode
        row.getCell(3).value = item.supplierName
        row.getCell(4).value = item.supplierPhone
        row.getCell(5).value = item.productName

        row.getCell(6).value = Number(item.quantity) || 0 // SL Dat
        row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }

        row.getCell(7).value = Number(item.receivedQuantity) || 0 // SL Da nhan
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
    const fileName = `Bao_Cao_Don_Mua_Chua_Nhan_${new Date().getTime()}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất báo cáo.')
  }
}
