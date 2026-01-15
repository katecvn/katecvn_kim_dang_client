import api from '@/utils/axios.jsx'

const getStatisticWithDate = async (fromDate, toDate) => {
  try {
    const { data } = await api.get('/statistic', {
      params: { fromDate, toDate },
    })
    return data.data
  } catch (error) {
    console.log('Submit error: ', error)
  }
}

export { getStatisticWithDate }
