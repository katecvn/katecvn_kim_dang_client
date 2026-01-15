import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCustomers = createAsyncThunk(
  'customer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('customer/create', data)

      await dispatch(getCustomers()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/customer/${data}/delete`)
      await dispatch(getCustomers()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCustomer = createAsyncThunk(
  'customer/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/customer/${id}/update`, data)
      await dispatch(getCustomers()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  customer: {},
  customers: [],
  loading: false,
  error: null,
}

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default customerSlice.reducer
