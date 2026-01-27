import api from '@/utils/axios'

/**
 * Get external product catalog by supplier ID
 * @param {number} supplierId - Supplier ID
 * @returns {Promise} - List of external products
 */
export const getCatalogBySupplier = async (supplierId) => {
  const response = await api.get(`/price-sync/catalog-by-supplier/${supplierId}`)
  return response.data.data || response.data
}

/**
 * Get supplier details including price sync configuration
 * @param {number} supplierId - Supplier ID
 * @returns {Promise} - Supplier details with priceSyncType
 */
export const getSupplierDetails = async (supplierId) => {
  const response = await api.get(`/supplier/${supplierId}`)
  return response.data.data || response.data
}
