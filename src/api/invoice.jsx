import api from '@/utils/axios'

const getInvoiceDetail = async (id) => {
  try {
    const { data } = await api.get(`/invoice/${id}/admin`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

const getInvoiceDetailByUser = async (id) => {
  try {
    const { data } = await api.get(`/invoice/${id}/by-user`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getInvoiceDetail, getInvoiceDetailByUser }
