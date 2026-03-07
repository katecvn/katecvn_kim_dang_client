import { toVietnamese, moneyFormat } from '@/utils/money-format'

/**
 * Build data for HopDongKhachBanLai (purchase contract from customer)
 * @param {Object} contract - Purchase contract detail from API
 */
export function buildPurchaseContractData(contract) {
  const customer = contract?.customer || {}

  // Items nằm trong purchaseOrders[0].items
  const rawItems = contract?.purchaseOrders?.[0]?.items || []

  const items = rawItems.map((item, index) => ({
    index: index + 1,
    name: item?.productName || item?.product?.name || '',
    unit: item?.unitName || item?.unit?.name || '',
    quantity: Number(item?.quantity || 0),
    price: Number(item?.unitPrice || 0),
    total: Number(item?.totalAmount || 0),
  }))

  const grandTotal = Number(contract?.totalAmount || 0)

  return {
    contract_no: contract?.code || '',
    sale_contract_no: contract?.salesContractCode || '',
    date: contract?.contractDate || contract?.createdAt || new Date().toISOString(),

    // Customer (người bán lại cho công ty)
    customer_name: customer?.name || '',
    customer_address: customer?.address || '',
    customer_id_number: customer?.identityCard || customer?.cccd || '',
    customer_phone: customer?.phone || '',
    customer_bank_account: customer?.bankAccount || '',
    customer_bank_name: customer?.bankName || '',

    items,
    total: `${moneyFormat(grandTotal)} đồng`,
    total_text: `Viết bằng chữ: ${toVietnamese(grandTotal)}`,
  }
}

