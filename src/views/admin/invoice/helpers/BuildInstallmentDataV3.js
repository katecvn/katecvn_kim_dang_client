import { toVietnamese } from '@/utils/money-format'
import QRCode from 'qrcode'

export async function buildInstallmentDataV3(invoice) {
  const customer = invoice?.customer || {}
  const rawItems = Array.isArray(invoice?.invoiceItems)
    ? invoice.invoiceItems
    : []

  const subtotal = Number(invoice?.subTotal || 0)
  const grandTotal = Number(invoice?.amount || 0)

  // Calculate amount paid
  let amountPaid = 0;
  if (invoice?.paymentVouchers && Array.isArray(invoice.paymentVouchers)) {
    amountPaid = invoice.paymentVouchers
      .filter(v => v.status === 'completed')
      .reduce((sum, v) => sum + Number(v.amount || 0), 0)
  }
  if (invoice?.paidAmount !== undefined && invoice?.paidAmount !== null) {
    amountPaid = Number(invoice.paidAmount);
  }
  const amountDue = grandTotal - amountPaid > 0 ? grandTotal - amountPaid : 0

  const items = rawItems.map((item, index) => ({
    index: index + 1,
    name: item?.productName || '',
    unit: item?.unitName || 'Cái',
    quantity: Number(item?.quantity || 0),
    price: Number(item?.price || 0),
    total: Number(item?.total || 0),
  }))

  // Generate QR code with URL to open invoice dialog
  let qrCodeDataUrl = null
  const invoiceId = invoice?.id
  if (invoiceId) {
    try {
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
    contract: {
      no: invoice?.salesContract?.code || invoice?.code || 'HĐBH-2025-001',
      date: invoice?.date || invoice?.createdAt || new Date().toISOString(),
    },

    customer: {
      name: invoice?.customerName || customer?.name || '',
      dob: customer?.dob || '',
      dateOfBirth: customer?.dateOfBirth || '',
      phone: invoice?.customerPhone || customer?.phone || '',
      address: invoice?.customerAddress || customer?.address || '',
      identityCard: customer?.identityCard || '',
      identityDate: customer?.identityDate || '',
      identityPlace: customer?.identityPlace || '',
      returnAddress: invoice?.customerAddress || customer?.address || '',
    },

    items,

    totals: {
      subtotalAmount: subtotal,
      totalAmount: grandTotal,
      amountPaid: amountPaid,
      amountDue: amountDue,
    },
    
    notes: invoice?.note || '',
    transferNote: '', 

    amountText: toVietnamese(grandTotal),

    // Payment info
    payment: {
      deliveryDate: invoice?.salesContract?.deliveryDate || invoice?.deliveryDate || '',
    },

    // QR code
    qrCode: qrCodeDataUrl,
    
    // Print tracking info
    printCount: invoice?.salesContract?.printCount || 0,
    
    // Sales Contract Info for Logic
    status: invoice?.salesContract?.status || 'draft',
    salesContractId: invoice?.salesContract?.id,
  }
}
