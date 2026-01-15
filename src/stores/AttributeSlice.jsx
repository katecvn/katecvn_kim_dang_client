import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// Lấy danh sách thuộc tính
export const getAttributes = createAsyncThunk(
  'attribute',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attribute')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

// Lấy chi tiết thuộc tính theo id
export const getAttributeById = createAsyncThunk(
  'attribute/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attribute/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

// Tạo mới thuộc tính
export const createAttribute = createAsyncThunk(
  'attribute/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/attribute/create', data)
      await dispatch(getAttributes()).unwrap()
      toast.success('Thêm mới thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

// Cập nhật thuộc tính
export const updateAttribute = createAsyncThunk(
  'attribute/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/attribute/${id}/update`, data)
      await dispatch(getAttributes()).unwrap()
      toast.success('Cập nhật thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

// Xóa thuộc tính
export const deleteAttribute = createAsyncThunk(
  'attribute/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/attribute/${id}/delete`)
      await dispatch(getAttributes()).unwrap()
      toast.success('Xóa thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

const initialState = {
  attribute: {},
  attributes: [],
  loading: false,
  error: null,
}

export const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getAttributes
      .addCase(getAttributes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAttributes.fulfilled, (state, action) => {
        state.loading = false
        state.attributes = action.payload
      })
      .addCase(getAttributes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // getAttributeById
      .addCase(getAttributeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAttributeById.fulfilled, (state, action) => {
        state.loading = false
        state.attribute = action.payload
      })
      .addCase(getAttributeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // createAttribute
      .addCase(createAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // updateAttribute
      .addCase(updateAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // deleteAttribute
      .addCase(deleteAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default attributeSlice.reducer
