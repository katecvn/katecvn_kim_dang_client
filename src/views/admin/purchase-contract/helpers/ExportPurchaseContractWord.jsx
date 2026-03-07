import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

/**
 * Export purchase contract (khách bán lại) to Word document
 * Template: /templates/HopDongKhachBanLai-template.docx
 */
export async function exportPurchaseContractWord(data, filename = 'hop-dong-mua-hang.docx') {
  try {
    const templatePath = '/templates/HopDongKhachBanLai-template.docx'
    const response = await fetch(templatePath)

    if (!response.ok) {
      throw new Error(`Template not found: ${templatePath}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const zip = new PizZip(arrayBuffer)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    })

    const templateData = prepareTemplateData(data)
    doc.setData(templateData)
    doc.render()

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    })

    saveAs(blob, filename)
    return true
  } catch (error) {
    console.error('Export Purchase Contract Word error:', error)
    // Log chi tiết từng lỗi template
    if (error?.properties?.errors) {
      error.properties.errors.forEach((e, i) => {
        console.error(`Template error [${i}]:`, e.properties?.explanation || e.message, e)
      })
    }
    throw error
  }
}

function prepareTemplateData(data) {
  const dateObj = parseDate(data?.date)

  return {
    // Số hợp đồng
    contract_no: data?.contract_no || '',
    sale_contract_no: data?.sale_contract_no || '',

    // Ngày tháng năm ký
    day: dateObj.day,
    month: dateObj.month,
    year: dateObj.year,

    // Thông tin người bán (khách hàng)
    customer_name: data?.customer_name || '',
    customer_address: data?.customer_address || '',
    customer_id_number: data?.customer_id_number || '',
    customer_phone: data?.customer_phone || '',
    customer_bank_account: data?.customer_bank_account || '',
    customer_bank_name: data?.customer_bank_name || '',

    // Danh sách hàng hoá (vòng lặp trong docxtemplater)
    items: (data?.items || []).map((item) => ({
      index: item.index,
      name: item.name,
      unit: item.unit,
      quantity: formatNumber(item.quantity),
      price: formatMoney(item.price),
      total: formatMoney(item.total),
    })),

    // Tổng tiền
    total: formatMoney(data?.total),
    total_text: data?.total_text || '',
  }
}

function parseDate(value) {
  if (!value) return { day: '...', month: '...', year: '...' }
  const d = new Date(value)
  if (isNaN(d.getTime())) return { day: '...', month: '...', year: '...' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
}

function formatMoney(n) {
  if (typeof n === 'number') return n.toLocaleString('vi-VN')
  return n || ''
}

function formatNumber(n) {
  if (typeof n === 'number') return n.toLocaleString('vi-VN')
  return n || ''
}
