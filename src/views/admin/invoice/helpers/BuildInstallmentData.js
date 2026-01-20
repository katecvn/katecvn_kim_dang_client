import { toVietnamese } from '@/utils/money-format'

export function buildInstallmentData(invoice) {
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

  return {
    company: invoice?.company || undefined,

    contract: {
      no: invoice?.code || 'HĐTC-2025-001',
      date: invoice?.date || invoice?.createdAt || new Date().toISOString(),
      title: 'HỢP ĐỒNG BÁN HÀNG TRẢ CHẬM',
      subtitle: 'KIÊM XÁC NHẬN THU TIỀN',
    },

    customer: {
      name: invoice?.customerName || customer?.name || '',
      phone: invoice?.customerPhone || customer?.phone || '',
      address: invoice?.customerAddress || customer?.address || '',
      idCard: customer?.idCard || '', // CMND/CCCD
      idIssueDate: customer?.idIssueDate || '',
      idIssuePlace: customer?.idIssuePlace || '',
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
      deliveryDate: '', // Will be filled in preview dialog
    },

    terms: undefined,
    warranty: undefined,
  }
}
