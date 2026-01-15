import api from '@/utils/axios'

const getExpiryById = async (id) => {
  try {
    const { data } = await api.get(`/expiry/${id}`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getExpiryById }
