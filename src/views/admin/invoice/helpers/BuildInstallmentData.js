import { toVietnamese } from '@/utils/money-format'
import QRCode from 'qrcode'

export async function buildInstallmentData(invoice) {
  const customer = invoice?.customer || {}
  const rawItems = Array.isArray(invoice?.invoiceItems)
    ? invoice.invoiceItems
    : []

  const subtotal = Number(invoice?.subTotal || 0)
  const taxAmount = Number(invoice?.taxAmount || 0)
  const grandTotal = Number(invoice?.amount || 0)

  let vatRate = 8
  if (subtotal > 0 && taxAmount > 0) {
    vatRate = parseFloat(((taxAmount / subtotal) * 100).toFixed(1))
  } else if (taxAmount === 0) {
    vatRate = 0
  }

  const items = rawItems.map((item, index) => ({
    stt: index + 1,
    description: item?.productName || '',
    details: item?.note || '',
    unit: item?.unitName || 'Cái',
    qty: Number(item?.quantity || 0),
    price: Number(item?.price || 0),
    total: Number(item?.total || 0),
  }))

  // Generate QR code with URL to open invoice dialog
  let qrCodeDataUrl = null
  const invoiceId = invoice?.id
  if (invoiceId) {
    try {
      // Create URL that will navigate to /invoice and open ViewInvoiceDialog
      const baseUrl = window.location.origin
      const invoiceUrl = `${baseUrl}/invoice?view=${invoiceId}`
      
      qrCodeDataUrl = await QRCode.toDataURL(invoiceUrl, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      })
    } catch (error) {
      console.error('QR code generation error:', error)
    }
  }

  return {
    company: invoice?.company || undefined,

    contract: {
      no: invoice?.salesContract?.code || invoice?.code || 'HĐTC-2025-001',
      date: invoice?.date || invoice?.createdAt || new Date().toISOString(),
      title: 'HỢP ĐỒNG BÁN HÀNG TRẢ CHẬM',
      subtitle: 'KIÊM XÁC NHẬN THU TIỀN',
    },

    customer: {
      name: invoice?.customerName || customer?.name || '',
      phone: invoice?.customerPhone || customer?.phone || '',
      address: invoice?.customerAddress || customer?.address || '',
      identityCard: customer?.identityCard || '', // CMND/CCCD
      identityDate: customer?.identityDate || '',
      identityPlace: customer?.identityPlace || '',
    },

    items,

    totals: {
      subtotal,
      vatRate,
      vatAmount: taxAmount,
      grandTotal,
    },

    amountText: toVietnamese(grandTotal),

    // Payment info
    payment: {
      method: 'Chuyển khoản 100%',
      deliveryDate: invoice?.salesContract?.deliveryDate || '', // From sales contract
    },

    terms: undefined,
    warranty: undefined,

    // QR code for contract code
    qrCode: qrCodeDataUrl,
    
    // Print tracking info
    printCount: invoice?.salesContract?.printCount || 0,
    
    // Sales Contract Info for Logic
    status: invoice?.salesContract?.status || 'draft',
    salesContractId: invoice?.salesContract?.id,
  }
}
