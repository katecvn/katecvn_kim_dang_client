import { toVietnamese } from '@/utils/money-format'

/**
 * Build data for HopDongKhachBanLai (purchase contract from customer)
 * @param {Object} contract - Purchase contract detail from API
 * @returns {Object} Template data for ExportPurchaseContractWord
 */
export function buildPurchaseContractData(contract) {
  const customer = contract?.customer || {}
  const rawItems = Array.isArray(contract?.items) ? contract.items : []

  const items = rawItems.map((item, index) => ({
    index: index + 1,
    name: item?.productName || item?.product?.name || '',
    unit: item?.unitName || item?.unit?.name || '',
    quantity: Number(item?.quantity || 0),
    price: Number(item?.unitPrice || 0),
    total: Number(item?.totalAmount || item?.unitPrice * item?.quantity || 0),
  }))

  const grandTotal = Number(contract?.totalAmount || 0)

  return {
    // Contract info
    contract_no: contract?.code || '',
    date: contract?.contractDate || contract?.createdAt || new Date().toISOString(),

    // Customer (người bán lại cho công ty)
    customer_name: customer?.name || '',
    customer_address: customer?.address || '',
    customer_id_number: customer?.identityCard || '',
    customer_phone: customer?.phone || '',
    customer_bank_account: customer?.bankAccount || '',
    customer_bank_name: customer?.bankName || '',

    // Items
    items,

    // Total
    total: grandTotal,
    total_text: toVietnamese(grandTotal),
  }
}
