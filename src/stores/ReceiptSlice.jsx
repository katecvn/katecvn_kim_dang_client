import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const createReceipt = createAsyncThunk(
  'receipt/create=-receipt',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/payment-vouchers', data)
      toast.success('Thêm mới thành công')
      // Return the created receipt data (including id)
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceipts = createAsyncThunk(
  'receipt/get-receipts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-vouchers', {
        params: {
          voucherType: 'receipt_in',
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
        },
      })
      // API returns: { data: { data: [...], pagination: {...} } }
      // We need to extract the data array
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyReceipts = createAsyncThunk(
  'receipt/get-my-receipts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-vouchers/my-payment-vouchers', {
        params: {
          voucherType: 'receipt_in',
        },
      })
      // API returns: { data: { data: [...], pagination: {...} } }
      // We need to extract the data array
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceiptById = createAsyncThunk(
  'receipt/get-receipt-by-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-vouchers/${id}`)
      // API returns: { data: {...} }
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteReceipt = createAsyncThunk(
  'receipt/delete-receipt',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/payment-vouchers/${id}`)

      const deleteAdminInvoices = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('DELETE_RECEIPT')

      deleteAdminInvoices
        ? await dispatch(getReceipts()).unwrap()
        : await dispatch(getMyReceipts()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceiptQRCode = createAsyncThunk(
  'receipt/get-qr-code',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-vouchers/${receiptId}/qr-code`)
      // API returns: { status: 200, data: { qrLink, amount, voucherCode, description } }
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateReceiptStatus = createAsyncThunk(
  'receipt/update-status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      let response
      if (status === 'completed') {
        response = await api.post(`/payment-vouchers/${id}/complete`)
      } else if (status === 'canceled') {
        response = await api.post(`/payment-vouchers/${id}/cancel`)
      } else {
        response = await api.put(`/payment-vouchers/${id}`, { status })
      }
      toast.success('Cập nhật trạng thái phiếu thu thành công')
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  receipt: {},
  receipts: [],
  qrCodeData: null,
  loading: false,
  error: null,
}

export const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(createReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(getReceipts.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.receipts = action.payload.data
        } else if (Array.isArray(action.payload)) {
          state.receipts = action.payload
        } else {
          state.receipts = []
        }
      })
      .addCase(getReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getMyReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyReceipts.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.receipts = action.payload.data
        } else if (Array.isArray(action.payload)) {
          state.receipts = action.payload
        } else {
          state.receipts = []
        }
      })
      .addCase(getMyReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReceiptQRCode.pending, (state) => {
        // Do not set global loading to true to avoid unmounting table rows
        state.error = null
      })
      .addCase(getReceiptQRCode.fulfilled, (state, action) => {
        state.qrCodeData = action.payload
      })
      .addCase(getReceiptQRCode.rejected, (state, action) => {
        state.error = action.payload.message || 'Không lấy được mã QR'
        state.qrCodeData = null
      })
  },
})

export default receiptSlice.reducer
