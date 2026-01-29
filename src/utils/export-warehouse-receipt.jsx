
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { toVietnamese } from './money-format'

export const exportWarehouseReceiptToExcel = async (receipt, templatePath = '/templates/xuatkho.xlsx') => {
  try {
    // 1. Load the template
    const response = await fetch(templatePath)
    if (!response.ok) throw new Error('Failed to load template')
    const arrayBuffer = await response.arrayBuffer()

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    const worksheet = workbook.getWorksheet(1)

    // 2. Prepare Data
    const day = new Date(receipt.receiptDate).getDate()
    const month = new Date(receipt.receiptDate).getMonth() + 1
    const year = new Date(receipt.receiptDate).getFullYear()
    const dateString = `Ngày ${day} tháng ${month} năm ${year}`
    
    const partner = receipt.receiptType === 1 ? receipt.supplier : receipt.customer
    const partnerName = partner?.name || ''
    // Address logic: prioritize partner address
    const address = partner?.address || '' 
    const reason = receipt.reason || ''
    // Warehouse info might be static or inferred
    const warehouse = 'Kho Cần Thơ' // Placeholder or from receipt if available
    
    // 3. Find and Replace Header Info
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.value && typeof cell.value === 'string') {
          // Date
          if (cell.value.includes('Ngày....tháng....năm')) {
            cell.value = cell.value.replace(/Ngày\.*tháng\.*năm\.*/i, dateString)
            // Or just overwrite if the line is exactly that format
            if (cell.value.trim() === dateString) return // Already set
             // Regex replacement is safer for variations like "Ngày... tháng..."
             cell.value = `Ngày ${day} tháng ${month} năm ${year}`
          }
           // Better approach: Check strict startsWith or includes
           if (cell.value.includes('Ngày') && cell.value.includes('tháng') && cell.value.includes('năm')) {
              cell.value = `                  Ngày ${day} tháng ${month} năm ${year}` // Indent manually if needed
           }

          // Code
          if (cell.value.includes('Số:')) {
             // The template has "Số: ............."
             cell.value = `Số: ${receipt.code}`
          }

          // Receiver Name
          if (cell.value.includes('Họ và tên người nhận hàng:')) {
            cell.value = `Họ và tên người nhận hàng: ${partnerName}`
            // Also Address often shares the line or is next to it?
            // Image: "Họ và tên...       Địa chỉ..."
            // If they are in the same cell:
             if (cell.value.includes('Địa chỉ')) {
                // It's a single cell string. Hard to split accurately without fixed width font assumptions.
                // Or maybe simple string replacement
                // "Họ và tên người nhận hàng: ........................... Địa chỉ (bộ phận)...................."
                const parts = cell.value.split('Địa chỉ')
                if (parts.length > 1) {
                    cell.value = `Họ và tên người nhận hàng: ${partnerName}          Địa chỉ (bộ phận): ${address}`
                }
             }
          }
          
           // Fallback for separate Address cell if not found above
          if (cell.value.includes('Địa chỉ (bộ phận):') && !cell.value.includes('Họ và tên')) {
             cell.value = `Địa chỉ (bộ phận): ${address}`
          }

          // Reason
          if (cell.value.includes('Lý do xuất kho:')) {
            cell.value = `Lý do xuất kho: ${reason}`
          }

          // Warehouse
          if (cell.value.includes('Xuất tại kho')) {
             cell.value = `Xuất tại kho: ${warehouse}                          Địa điểm: Cần Thơ`
          }
        }
      })
    })

    // 4. Fill Table Details
    // User requested to start from row 15
    const startRow = 15
    
    // Insert rows strictly
    if (receipt.details.length > 0) {
        worksheet.insertRows(startRow, receipt.details.map((_, i) => []))
    }

    // Write data
    receipt.details.forEach((item, index) => {
        const currentRow = startRow + index
        const row = worksheet.getRow(currentRow)
        
        // Styles
        row.font = { name: 'Times New Roman', size: 11 }
        row.alignment = { vertical: 'middle', wrapText: true }

        // STT (Merge A and B)
        try {
           worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
        } catch (e) {
          // Ignore if already merged
        }
        
        // Custom borders to avoid internal line
        // Cell 1: Left, Top, Bottom (No Right)
        row.getCell(1).value = index + 1
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
        row.getCell(1).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' }
        }
        
        // Cell 2: Top, Right, Bottom (No Left) - ensuring the box closes on the far right
        row.getCell(2).value = ''
        row.getCell(2).border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' }, 
          right: { style: 'thin' }
        }

        // Name (C)
        row.getCell(3).value = item.productName || '' 
        row.getCell(3).border = borderStyle
        
        // Code (D)
        row.getCell(4).value = item.productCode || '' 
        row.getCell(4).border = borderStyle

        // Unit (E)
        row.getCell(5).value = item.unitName || '' 
        row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }
        row.getCell(5).border = borderStyle

        // Qty Doc (F)
        row.getCell(6).value = '' 
        row.getCell(6).border = borderStyle
        
        // Qty Real (G)
        row.getCell(7).value = item.qtyActual 
        row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
        row.getCell(7).border = borderStyle

        // Price (H)
        row.getCell(8).value = item.price 
        row.getCell(8).numFmt = '#,##0'
        row.getCell(8).border = borderStyle

        // Amount (I)
        row.getCell(9).value = item.totalAmount 
        row.getCell(9).numFmt = '#,##0'
        row.getCell(9).border = borderStyle
        
        row.commit()
    })
    
    // 5. Total and Text
    let totalRowIndex = -1
    const totalAmount = receipt.totalAmount || 0
    
    worksheet.eachRow((row, rowNumber) => {
        // "Cộng" usually in Description column (C)
        const cellC = row.getCell(3)
        if (cellC.value && cellC.value.toString().includes('Cộng')) {
            totalRowIndex = rowNumber
            // Write Total to Col I (9)
             const totalCell = row.getCell(9) 
             totalCell.value = totalAmount
             totalCell.numFmt = '#,##0'
        }
        
        // Text
        const firstCell = row.getCell(1) // A
        if (firstCell.value && firstCell.value.toString().includes('Tổng số tiền (viết bằng chữ):')) {
             firstCell.value = `Tổng số tiền (viết bằng chữ): ${toVietnamese(totalAmount)}`
        }
    })
    
    // 6. Save
    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = `Phieu_Xuat_Kho_${receipt.code}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất Excel. Vui lòng thử lại.')
  }
}

const borderStyle = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}
