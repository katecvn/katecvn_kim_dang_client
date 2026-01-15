import api from '@/utils/axios'

const downloadPreviewDraftInvoice = async (id) => {
  try {
    const res = await api.get(`/s-invoice/preview-draft-invoice/${id}`, {
      responseType: 'blob',
    })

    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `viettel-invoice-preview-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log('Fetch data error: ', error)
    throw error
  }
}

const getPreviewData = async (id) => {
  try {
    const res = await api.get(`/s-invoice/s-invoice-payload/${id}`)
    const { data } = res.data
    return data
  } catch (error) {
    console.log('Fetch data error: ', error)
    throw error
  }
}

const createSInvoice = async (payload) => {
  try {
    const res = await api.post(`/s-invoice/create`, payload)
    return res
  } catch (error) {
    console.log('Fetch data error: ', error)
    throw error
  }
}

const downloadPublishedInvoice = async (id, dataToSend) => {
  try {
    const res = await api.post('s-invoice/file', dataToSend, {
      responseType: 'blob',
    })
    const { fileType } = dataToSend
    const mimeType = fileType === 'ZIP' ? 'application/zip' : 'application/pdf'
    const ext = fileType === 'ZIP' ? 'zip' : 'pdf'
    const blob = new Blob([res.data], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `viettel-invoice-${id}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.log('Fetch data error: ', error)
    throw error
  }
}

export {
  downloadPreviewDraftInvoice,
  getPreviewData,
  createSInvoice,
  downloadPublishedInvoice,
}
