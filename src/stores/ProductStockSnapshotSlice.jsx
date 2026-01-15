import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProductStockSnapshots = createAsyncThunk(
  'productStockSnapshot/getAll',
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      const response = await api.get('/product-stock-snapshot', {
        params: { dateFrom: fromDate, dateTo: toDate },
      })
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createProductStockSnapshotList = createAsyncThunk(
  'productStockSnapshot/createList',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/product-stock-snapshot/create', payload)
      const { data } = response.data

      dispatch(getProductStockSnapshots({}))
      toast.success('Tạo snapshot tồn kho thành công')
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateProductStockSnapshot = createAsyncThunk(
  'productStockSnapshot/update',
  async (snapshot, { rejectWithValue, dispatch }) => {
    try {
      const { id, ...body } = snapshot
      const response = await api.put(
        `/product-stock-snapshot/${id}/update`,
        body,
      )
      const { data } = response.data

      dispatch(getProductStockSnapshots({}))

      toast.success('Cập nhật snapshot tồn kho thành công')
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteProductStockSnapshot = createAsyncThunk(
  'productStockSnapshot/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product-stock-snapshot/${id}/delete`)
      dispatch(getProductStockSnapshots({}))

      toast.success('Xóa snapshot tồn kho thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  productStockSnapshots: [],
  productStockSnapshot: {},
  loading: false,
  error: null,
}

export const productStockSnapshotSlice = createSlice({
  name: 'productStockSnapshot',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== getProductStockSnapshots =====
      .addCase(getProductStockSnapshots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductStockSnapshots.fulfilled, (state, action) => {
        state.loading = false
        state.productStockSnapshots = action.payload
      })
      .addCase(getProductStockSnapshots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ===== createProductStockSnapshotList =====
      .addCase(createProductStockSnapshotList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProductStockSnapshotList.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProductStockSnapshotList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ===== updateProductStockSnapshot =====
      .addCase(updateProductStockSnapshot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductStockSnapshot.fulfilled, (state, action) => {
        state.loading = false
        state.productStockSnapshot = action.payload
      })
      .addCase(updateProductStockSnapshot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // ===== deleteProductStockSnapshot =====
      .addCase(deleteProductStockSnapshot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProductStockSnapshot.fulfilled, (state, action) => {
        state.loading = false
        state.productStockSnapshot = action.payload
      })
      .addCase(deleteProductStockSnapshot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default productStockSnapshotSlice.reducer
