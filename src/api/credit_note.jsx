import api from '@/utils/axios'

const getCreditNoteDetail = async (id) => {
  try {
    const response = await api.get(`/credit-note/${id}`)
    const { data } = response.data
    return data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getCreditNoteDetail }
