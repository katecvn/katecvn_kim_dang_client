import api from '@/utils/axios'

const getSettingApi = async (key = 'general_information') => {
  try {
    const { data } = await api.get(`/setting?key=${key}`)
    return data?.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getSettingApi }
