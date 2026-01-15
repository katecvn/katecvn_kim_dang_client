import api from '@/utils/axios'
import qs from 'qs'

const reviewReceipt = async (invoices) => {
  try {
    const { data } = await api.get('/receipt/review', {
      params: { invoices },
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'indices' })
      },
    })

    return data.data
  } catch (error) {
    console.log('Failed to fetch data: ', error)
  }
}

export { reviewReceipt }
