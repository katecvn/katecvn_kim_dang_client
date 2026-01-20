import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import QRCode from 'qrcode'

/**
 * Export installment contract to Word document using template
 * @param {Object} data - Contract data
 * @param {string} filename - Output filename (default: hop-dong-tra-cham.docx)
 */
export async function exportInstallmentWord(data, filename = 'hop-dong-tra-cham.docx') {
  try {
    // 1. Load template file
    const templatePath = '/templates/hop-dong-tra-cham.docx'
    const response = await fetch(templatePath)
    
    if (!response.ok) {
      throw new Error(`Template not found: ${templatePath}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    
    // 2. Create PizZip instance
    const zip = new PizZip(arrayBuffer)
    
    // 3. Create Docxtemplater instance (NO image module)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    })
    
    // 4. Prepare data for template
    const templateData = prepareTemplateData(data)
    
    // 5. Set data
    doc.setData(templateData)
    
    // 6. Render document
    doc.render()
    
    // 7. Generate blob
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    })
    
    // 8. Download Word file
    saveAs(blob, filename)
    
    // 9. Also generate and download QR code image separately
    const qrData = generateQRCodeData(data)
    await downloadQRCodeImage(qrData, filename.replace('.docx', '-qr.png'))
    
    return true
  } catch (error) {
    console.error('Export Word error:', error)
    throw error
  }
}


/**
 * Generate QR Code as base64 data URL
 */
async function generateQRCodeBase64(data) {
  const contract = data?.contract || {}
  const customer = data?.customer || {}
  const items = data?.items || []
  
  // Create QR data object
  const qrData = {
    contractNo: contract.no || '',
    customerName: customer.name || '',
    customerPhone: customer.phone || '',
    customerId: customer.idCard || '',
    date: contract.date || new Date().toISOString(),
    itemCount: items.length,
    totalAmount: items.reduce((sum, item) => sum + (item.total || 0), 0),
  }
  
  // Convert to JSON string
  const qrString = JSON.stringify(qrData)
  
  // Generate QR code as data URL
  try {
    const dataUrl = await QRCode.toDataURL(qrString, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return dataUrl
  } catch (error) {
    console.error('QR Code generation error:', error)
    return null
  }
}

/**
 * Generate QR Code data for contract (text only)
 */
function generateQRCodeData(data) {
  const contract = data?.contract || {}
  const customer = data?.customer || {}
  const items = data?.items || []
  
  // Create QR data object
  const qrData = {
    contractNo: contract.no || '',
    customerName: customer.name || '',
    customerPhone: customer.phone || '',
    customerId: customer.idCard || '',
    date: contract.date || new Date().toISOString(),
    itemCount: items.length,
    totalAmount: items.reduce((sum, item) => sum + (item.total || 0), 0),
  }
  
  // Convert to JSON string
  return JSON.stringify(qrData)
}

/**
 * Download QR Code as separate PNG image
 */
async function downloadQRCodeImage(qrDataString, filename) {
  try {
    // Generate QR code as data URL
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, qrDataString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      saveAs(blob, filename)
    })
  } catch (error) {
    console.error('QR Code image generation error:', error)
  }
}

/**
 * Prepare data for Word template
 */
function prepareTemplateData(data) {
  const contract = data?.contract || {}
  const company = data?.company || {}
  const customer = data?.customer || {}
  const items = data?.items || []
  const payment = data?.payment || {}
  
  // Parse date
  const contractDate = parseDate(contract.date)
  
  // Calculate total
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0)
  
  return {
    // Contract info - match template placeholders
    contract_no: contract.no || 'Số:.........................',
    day: contractDate.day,
    month: contractDate.month,
    year: contractDate.year,
    
    // Customer info - match template placeholders
    customer_name: customer.name || '',
    customer_phone: customer.phone || '',
    id_number: customer.idCard || '',
    id_date: customer.idIssueDate || '',
    id_place: customer.idIssuePlace || '',
    customer_address: customer.address || '',
    
    // Items (for loop in template) - match template placeholders
    items: items.map((item, idx) => ({
      index: idx + 1,
      name: item.description || '',
      quantity: item.qty || '',
      price: formatMoney(item.price),
      total: formatMoney(item.total),
    })),
    
    // Totals - match template placeholders
    total_words: data?.amountText || '', // Số tiền bằng chữ
    
    // Payment info - match template placeholders
    delivery_date: payment.deliveryDate || '',
  }
}

/**
 * Parse date string to day/month/year
 */
function parseDate(value) {
  if (!value) {
    return { day: '...', month: '...', year: '...' }
  }
  
  const d = new Date(value)
  if (isNaN(d.getTime())) {
    return { day: '...', month: '...', year: '...' }
  }
  
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
}

/**
 * Format number to Vietnamese currency
 */
function formatMoney(n) {
  if (typeof n === 'number') {
    return n.toLocaleString('vi-VN')
  }
  return n || ''
}
