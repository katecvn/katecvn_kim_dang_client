import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getUnits = createAsyncThunk(
  'unit',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/unit')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteUnit = createAsyncThunk(
  'unit/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/unit/${data}/delete`)
      await dispatch(getUnits()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createUnit = createAsyncThunk(
  'unit/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/unit/create', data)

      await dispatch(getUnits()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateUnit = createAsyncThunk(
  'unit/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/unit/${id}/update`, data)
      await dispatch(getUnits()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  units: [],
  loading: false,
  error: null,
}

export const taxSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUnits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.loading = false
        state.units = action.payload
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default taxSlice.reducer
