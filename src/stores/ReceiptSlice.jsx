import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const createReceipt = createAsyncThunk(
  'receipt/create=-receipt',
  async (data, { rejectWithValue }) => {
    try {
      await api.post('/receipt/create', data)
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceipts = createAsyncThunk(
  'receipt/get-receipts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/receipt')
      const { data } = response.data
      return data
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
      const response = await api.get('/receipt/my-receipt')
      const { data } = response.data
      return data
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
      const deleteAdminInvoices = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('DELETE_RECEIPT')

      deleteAdminInvoices
        ? await api.delete(`/receipt/${id}/delete`)
        : await api.delete(`/receipt/${id}/delete-my-receipt`)
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

const initialState = {
  receipt: {},
  receipts: [],
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
        state.receipts = action.payload
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
        state.receipts = action.payload
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
  },
})

export default receiptSlice.reducer
