import api from '@/utils/axios'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getInvoices = createAsyncThunk(
  'invoice/get-invoices',
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoice', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
        },
      })
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getInvoiceDetail = createAsyncThunk(
  'invoice/get-invoice-detail',
  async (id, { rejectWithValue }) => {
    try {
      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_INVOICE')

      const response = getAdminInvoice
        ? await api.get(`/invoice/${id}/admin`)
        : await api.get(`/invoice/${id}/by-user`)

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyInvoices = createAsyncThunk(
  'invoice/get-my-invoices',
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoice/by-user', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
        },
      })

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteInvoice = createAsyncThunk(
  'invoice/delete-invoice',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const deleteAdminInvoices = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('DELETE_INVOICE')

      deleteAdminInvoices
        ? await api.delete(`/invoice/${id}/delete`)
        : await api.delete(`/invoice/${id}/delete-by-user`)
      deleteAdminInvoices
        ? await dispatch(
          getInvoices({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
        : await dispatch(
          getMyInvoices({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createInvoice = createAsyncThunk(
  'invoice/create-invoice',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/invoice/create', dataToSend)
      await dispatch(
        getMyInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Tạo hóa đơn thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateInvoice = createAsyncThunk(
  'invoice/update-invoice',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(
        `/invoice/${dataToSend.invoiceId}/update-pending`,
        dataToSend,
      )
      await dispatch(
        getMyInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Cập nhật thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateInvoiceStatus = createAsyncThunk(
  'invoice/update-invoice-status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      let response
      if (data.status === 'pending') {
        response = await api.post(`/invoice/${data.id}/revert`)
      } else {
        response = await api.put(`/invoice/${data.id}/update`, data)
      }
      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Cập nhật trạng thái thành công')

      // Return response data including warehouseInfo
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const recordPrintAttempt = createAsyncThunk(
  'invoice/record-print-attempt',
  async (salesContractId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sales-contracts/${salesContractId}/print-attempt`)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const recordPrintSuccess = createAsyncThunk(
  'invoice/record-print-success',
  async (salesContractId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sales-contracts/${salesContractId}/print-success`)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  invoices: [],
  invoice: null,
  loading: false,
  error: null,
}

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMyInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload
      })
      .addCase(getMyInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoiceStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getInvoiceDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getInvoiceDetail.fulfilled, (state, action) => {
        state.loading = false
        state.invoice = action.payload
      })
      .addCase(getInvoiceDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(recordPrintAttempt.pending, (state) => {
        // Silent tracking, không set loading
      })
      .addCase(recordPrintAttempt.fulfilled, (state) => {
        // Silent success
      })
      .addCase(recordPrintAttempt.rejected, (state, action) => {
        // Silent fail, chỉ log error
        console.error('Failed to record print attempt:', action.payload)
      })
      .addCase(recordPrintSuccess.pending, (state) => {
        // Silent tracking
      })
      .addCase(recordPrintSuccess.fulfilled, (state) => {
        // Silent success
      })
      .addCase(recordPrintSuccess.rejected, (state, action) => {
        // Silent fail
        console.error('Failed to record print success:', action.payload)
      })
  },
})

export default invoiceSlice.reducer
