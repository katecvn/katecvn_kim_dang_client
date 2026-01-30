import { toVietnamese } from '@/utils/money-format'

export function buildPurchaseContractData(purchaseOrder, contractNumber = '') {
  const supplier = purchaseOrder?.supplier || {}
  const items = Array.isArray(purchaseOrder?.items)
    ? purchaseOrder.items
    : []

  // Ensure these are numbers
  const subtotal = Number(purchaseOrder?.subTotal || 0)
  const taxAmount = Number(purchaseOrder?.taxAmount || 0)
  const grandTotal = Number(purchaseOrder?.totalAmount || purchaseOrder?.amount || 0)

  // Calculate VAT rate roughly if not provided
  let vatRate = 0
  if (subtotal > 0 && taxAmount > 0) {
    vatRate = parseFloat(((taxAmount / subtotal) * 100).toFixed(1))
  }

  const processedItems = items.map((item) => {
    const qty = Number(item?.quantity || 0)
    const price = Number(item?.unitPrice || item?.price || 0)
    const total = Number(item?.total || 0)
    const unitName = item?.unitName || 'Cái'
    
    // Format: "10 Cái x 100,000"
    const priceFormatted = price.toLocaleString('vi-VN')
    const weightDetail = `${qty} ${unitName} x ${priceFormatted}`
    
    return {
      name: item?.productName || '',
      description: item?.note || '',
      weightDetail: weightDetail, // Reusing field name from Agreement for compatibility if reusing components, or specific to PO
      quantity: qty,
      unitName: unitName,
      price: price,
      total: total,
    }
  })

  return {
    // Buyer info (My Company) - Usually hardcoded in the template or fetched from settings
    // But here we structure it to match what the Export component needs
    company: undefined, // Will use default in Export component

    contract: {
      no: contractNumber || purchaseOrder?.code || 'HĐMB-...',
      date: purchaseOrder?.orderDate || new Date().toISOString(),
      title: 'HỢP ĐỒNG MUA BÁN',
    },

    // Seller info (Supplier)
    supplier: {
      name: supplier?.name || purchaseOrder?.newSupplier?.name || '',
      phone: supplier?.phone || purchaseOrder?.newSupplier?.phone || '',
      address: supplier?.address || purchaseOrder?.newSupplier?.address || '',
      taxCode: supplier?.taxCode || purchaseOrder?.newSupplier?.taxCode || '',
      email: supplier?.email || purchaseOrder?.newSupplier?.email || '',
    },

    items: processedItems,

    totals: {
      subtotal,
      vatRate,
      vatAmount: taxAmount,
      grandTotal,
    },

    amountText: toVietnamese(grandTotal),

    note: purchaseOrder?.note || '',
  }
}
