import api from '@/utils/axios'

const getSchool = async (id) => {
  try {
    const { data } = await api.get(`/school/${id}`)
    return data.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getSchool }
