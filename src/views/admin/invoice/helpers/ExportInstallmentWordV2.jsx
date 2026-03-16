import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import ImageModule from 'docxtemplater-image-module-free'

/**
 * Export installment contract to Word document using template V2
 * @param {Object} data - Contract data
 * @param {string} filename - Output filename (default: hop_dong_ban_hang.docx)
 */
export async function exportInstallmentWordV2(data, filename = 'hop_dong_ban_hang.docx') {
  try {
    // 1. Load template file
    const templatePath = '/templates/hop_dong_ban_hang.docx'
    const response = await fetch(templatePath)

    if (!response.ok) {
      throw new Error(`Template not found: ${templatePath}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // 2. Create PizZip instance
    const zip = new PizZip(arrayBuffer)

    // 3. Configure ImageModule for QR code embedding
    const imageOpts = {
      centered: false,
      getImage: (tagValue) => {
        return dataURLtoBuffer(tagValue)
      },
      getSize: () => {
        return [100, 100]
      }
    }

    // 4. Create Docxtemplater instance with ImageModule
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
      modules: [new ImageModule(imageOpts)]
    })

    // 5. Prepare data for template (including QR code)
    const templateData = await prepareTemplateData(data)

    // 6. Set data
    doc.setData(templateData)

    // 7. Render document
    doc.render()

    // 8. Generate blob
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    })

    // 9. Download Word file
    saveAs(blob, filename)

    return true
  } catch (error) {
    console.error('Export Word error:', error)
    throw error
  }
}

/**
 * Prepare data for Word template
 */
async function prepareTemplateData(data) {
  const contract = data?.contract || {}
  const customer = data?.customer || {}
  const items = data?.items || []
  const totals = data?.totals || {}
  const payment = data?.payment || {}

  // Extract day, month, year from contract date
  const contractDateObj = parseDateForWord(contract.date)

  return {
    contract_no: contract.no || '',

    // Date fields used by docx template
    day: contractDateObj.day,
    month: contractDateObj.month,
    year: contractDateObj.year,

    customer_name: customer.name || '',
    customer_dob: formatDate(customer.dateOfBirth),
    customer_phone: formatPhone(customer.phone),
    id_number: customer.identityCard || '',
    id_date: formatDate(customer.identityDate),
    id_place: customer.identityPlace || '',
    customer_address: customer.address || '',
    return_address: customer.returnAddress || '',

    // Items (for loop in template)
    items: items.map((item, idx) => ({
      index: idx + 1,
      name: item.name || '',
      unit: item.unit || '',
      quantity: item.quantity || '',
      price: formatMoney(item.price),
      total: formatMoney(item.total),
    })),

    notes: data?.notes || '',

    subtotal_amount: formatMoney(totals.subtotalAmount),
    total_amount: formatMoney(totals.totalAmount),
    amount_paid: formatMoney(totals.amountPaid),
    amount_due: formatMoney(totals.amountDue),

    total_words: data?.amountText || '',

    delivery_date: formatDate(payment.deliveryDate),
    transfer_note: data?.transferNote || '',

    // QR Code - for {%qr_code} placeholder in template
    qr_code: data?.qrCode || null,

    // Print count
    print_count: (data?.printCount || 0) + 1,
  }
}

/**
 * Format a date value to dd/mm/yyyy string
 */
function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Format phone string to xxx.xxx.xxxx
 */
function formatPhone(phone) {
  if (!phone) return ''
  // Remove all non-numeric characters
  const cleaned = ('' + phone).replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  }
  return phone
}

/**
 * Parse date string to day/month/year for docx mapping
 */
function parseDateForWord(value) {
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
    return n.toLocaleString('vi-VN') + ' Đ'
  }
  return n || '0'
}

/**
 * Convert data URL to ArrayBuffer for ImageModule
 */
function dataURLtoBuffer(dataURL) {
  if (!dataURL || typeof dataURL !== 'string') return null

  // Extract base64 data from data URL
  const parts = dataURL.split(',')
  if (parts.length < 2) return null
  const base64 = parts[1]
  if (!base64) return null

  // Decode base64 to binary string
  const binaryString = atob(base64)

  // Convert binary string to ArrayBuffer
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}
