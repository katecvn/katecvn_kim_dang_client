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
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoice', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search
        },
      })
      const responseData = response.data
      const { data, pagination } = responseData.data || {}

      // Map pagination to internal structure
      const meta = pagination ? {
        ...pagination,
        last_page: pagination.totalPages,
        current_page: pagination.page,
        per_page: pagination.limit
      } : undefined

      return { data, meta }
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
        localStorage.getItem('permissionCodes') || '[]',
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
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoice/by-user', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search
        },
      })

      const responseData = response.data
      const { data, pagination } = responseData.data || {}

      // Map pagination to internal structure
      const meta = pagination ? {
        ...pagination,
        last_page: pagination.totalPages,
        current_page: pagination.page,
        per_page: pagination.limit
      } : undefined

      return { data, meta }
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
        localStorage.getItem('permissionCodes') || '[]',
      ).includes('DELETE_INVOICE')

      deleteAdminInvoices
        ? await api.delete(`/invoice/${id}/delete`)
        : await api.delete(`/invoice/${id}/delete-by-user`)

      // Just notify success, let the component handle refresh with current pagination
      toast.success('Xóa thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createInvoice = createAsyncThunk(
  'invoice/create-invoice',
  async (dataToSend, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoice/create', dataToSend)
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
  async (dataToSend, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/invoice/${dataToSend.invoiceId}/update-pending`,
        dataToSend,
      )
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
  async (data, { rejectWithValue }) => {
    try {
      let response
      if (data.status === 'pending') {
        response = await api.post(`/invoice/${data.id}/revert`)
      } else {
        response = await api.put(`/invoice/${data.id}/update`, data)
      }
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

export const importInvoice = createAsyncThunk(
  'invoice/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/invoice/import', data)
      await dispatch(getInvoices({})).unwrap()
      toast.success('Import hóa đơn thành công')
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
  pagination: {
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  }
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
        state.invoices = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.invoices = []
      })
      .addCase(getMyInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getMyInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.invoices = []
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false
        // Optimistic update or just let refresh handle it
        // We'll rely on the component to refresh the list 
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
      .addCase(importInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(importInvoice.pending, (state) => {
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
        // Silent tracking
      })
      .addCase(recordPrintAttempt.fulfilled, (state) => {
        // Silent success
      })
      .addCase(recordPrintAttempt.rejected, (state, action) => {
        // Silent fail
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
