import api from '@/utils/axios'

const getPurchaseOrderDetail = async (id) => {
  try {
    const { data } = await api.get(`/purchase-order/${id}/admin`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

const getPurchaseOrderDetailByUser = async (id) => {
  try {
    const { data } = await api.get(`/purchase-order/${id}/by-user`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getPurchaseOrderDetail, getPurchaseOrderDetailByUser }
