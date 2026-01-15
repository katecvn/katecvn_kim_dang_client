import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSuppliers = createAsyncThunk(
  'supplier',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/supplier')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteSupplier = createAsyncThunk(
  'supplier/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/supplier/${data}/delete`)
      await dispatch(getSuppliers()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/supplier/create', data)

      await dispatch(getSuppliers()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateSupplier = createAsyncThunk(
  'supplier/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/supplier/${id}/update`, data)
      await dispatch(getSuppliers()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateSupplierStatus = createAsyncThunk(
  'supplier/update-status',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = updateData
      await api.patch(`/supplier/${id}/update-status`, { status })
      await dispatch(getSuppliers()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getSupplierDetailWithProducts = createAsyncThunk(
  'supplier/detail-with-products',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/supplier/${id}/products`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  suppliers: [],
  supplier: {},
  loading: false,
  error: null,
}

export const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers = action.payload
      })
      .addCase(getSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSupplier.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSupplier.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSupplier.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateSupplierStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSupplierStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSupplierStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Get supplier detail with products
      .addCase(getSupplierDetailWithProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSupplierDetailWithProducts.fulfilled, (state, action) => {
        state.loading = false
        state.supplier = action.payload
      })
      .addCase(getSupplierDetailWithProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default supplierSlice.reducer
