import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// GET /crm/customers/:customerId/notes
export const getCustomerNotes = createAsyncThunk(
  'customerNote/list',
  async ({ customerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/crm/customers/${customerId}/notes`, {
        params,
      })
      const { data } = response.data // { data: [...], pagination: {...} }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// POST /crm/customers/:customerId/notes
export const createCustomerNote = createAsyncThunk(
  'customerNote/create',
  async ({ customerId, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/crm/customers/${customerId}/notes`, data)
      await dispatch(
        getCustomerNotes({
          customerId,
          params: params || {},
        }),
      ).unwrap()
      toast.success('Thêm ghi chú thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// PUT /crm/customer-notes/:id
export const updateCustomerNote = createAsyncThunk(
  'customerNote/update',
  async ({ id, customerId, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/crm/customer-notes/${id}`, data)
      if (customerId) {
        await dispatch(
          getCustomerNotes({
            customerId,
            params: params || {},
          }),
        ).unwrap()
      }
      toast.success('Cập nhật ghi chú thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// DELETE /crm/customer-notes/:id
export const deleteCustomerNote = createAsyncThunk(
  'customerNote/delete',
  async ({ id, customerId, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/crm/customer-notes/${id}`)
      if (customerId) {
        await dispatch(
          getCustomerNotes({
            customerId,
            params: params || {},
          }),
        ).unwrap()
      }
      toast.success('Xóa ghi chú thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  notes: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
}

export const customerNoteSlice = createSlice({
  name: 'customerNote',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== List =====
      .addCase(getCustomerNotes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerNotes.fulfilled, (state, action) => {
        state.loading = false
        state.notes = action.payload?.data || []
        state.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      })
      .addCase(getCustomerNotes.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create =====
      .addCase(createCustomerNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomerNote.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomerNote.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Update =====
      .addCase(updateCustomerNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomerNote.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomerNote.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Delete =====
      .addCase(deleteCustomerNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomerNote.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomerNote.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })
  },
})

export default customerNoteSlice.reducer
