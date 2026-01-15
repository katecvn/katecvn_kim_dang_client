import api from '@/utils/axios'

const getCustomerInvoices = async ({
  customerId,
  page,
  limit,
  dateFrom,
  dateTo,
  status,
  order,
}) => {
  try {
    const { data } = await api.get('customer/invoices', {
      params: {
        customerId,
        page,
        limit,
        dateFrom,
        dateTo,
        status,
        order: typeof order === 'string' ? order : JSON.stringify(order),
      },
    })

    return data.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

const getCustomerPurchasedProducts = async ({
  customerId,
  dateFrom,
  dateTo,
  limit,
} = {}) => {
  try {
    const { data } = await api.get('customer/purchased-products', {
      params: {
        customerId,
        dateFrom,
        dateTo,
        limit,
      },
    })

    return data.data
  } catch (error) {
    console.log('Fetch data error: ', error)
  }
}

export { getCustomerInvoices, getCustomerPurchasedProducts }
