import api from "@/utils/axios"

/**
 * Get available lots for a product (FEFO sorted)
 * @param {number} productId - Product ID
 * @returns {Promise} List of available lots
 */
export const getAvailableLots = async (productId) => {
  const { data } = await api.get(`/lots/available?productId=${productId}`)
  return data
}

/**
 * Allocate lots to a warehouse receipt detail line
 * @param {number} detailId - Warehouse receipt detail ID
 * @param {Array} allocations - Array of {lotId, quantity}
 * @returns {Promise} Updated detail with allocations
 */
export const allocateLots = async (detailId, allocations) => {
  const { data } = await api.put(
    `/warehouse-receipts/detail/${detailId}/allocations`,
    { allocations }
  )
  return data
}

/**
 * Get lot allocations for a warehouse receipt detail
 * @param {number} detailId - Warehouse receipt detail ID
 * @returns {Promise} List of lot allocations
 */
export const getLotAllocations = async (detailId) => {
  const { data } = await api.get(
    `/warehouse-receipts/detail/${detailId}/allocations`
  )
  return data
}
