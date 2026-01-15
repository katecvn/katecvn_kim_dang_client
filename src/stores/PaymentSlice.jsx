import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const updatePaymentStatus = createAsyncThunk(
  'payment/update-payment-status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await api.put(`/payment/${id}/update`, { status })
      toast.success('Cập nhật trạng thái thanh toán thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createPayment = createAsyncThunk(
  'payment/create-payment',
  async (data, { rejectWithValue }) => {
    try {
      await api.post('/payment', data)
      toast.success('Tạo thanh toán thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deletePayment = createAsyncThunk(
  'payment/delete-payment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payment/${id}/delete`)
      toast.success('Xóa thanh toán thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updatePaymentDueDate = createAsyncThunk(
  'payment/update-due-date',
  async ({ id, dueDate }, { rejectWithValue }) => {
    try {
      await api.put(`/payment/${id}/update-due-date`, { dueDate })
      toast.success('Cập nhật hạn chót thành công')
      return { id, dueDate }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  loading: false,
  error: null,
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePaymentStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(createPayment.pending, (state) => {
        state.loading = true
      })
      .addCase(createPayment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(deletePayment.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePayment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(updatePaymentDueDate.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePaymentDueDate.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePaymentDueDate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default paymentSlice.reducer
