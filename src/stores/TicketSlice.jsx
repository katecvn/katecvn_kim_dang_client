import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// GET /crm/tickets
export const getTickets = createAsyncThunk(
  'ticket/list',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/tickets', { params })
      const { data } = response.data // { data: [...], pagination: {...} }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// GET /crm/tickets/:id
export const getTicketById = createAsyncThunk(
  'ticket/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/crm/tickets/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// POST /crm/tickets
export const createTicket = createAsyncThunk(
  'ticket/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/crm/tickets', data)
      await dispatch(getTickets()).unwrap()
      toast.success('Thêm ticket thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// PUT /crm/tickets/:id
export const updateTicket = createAsyncThunk(
  'ticket/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/crm/tickets/${id}`, data)
      await dispatch(getTickets()).unwrap()
      toast.success('Cập nhật ticket thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// PATCH /crm/tickets/:id/status
export const updateTicketStatus = createAsyncThunk(
  'ticket/updateStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      await api.patch(`/crm/tickets/${id}/status`, { status })
      await dispatch(getTickets()).unwrap()
      toast.success('Cập nhật trạng thái ticket thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// DELETE /crm/tickets/:id
export const deleteTicket = createAsyncThunk(
  'ticket/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/crm/tickets/${id}`)
      await dispatch(getTickets()).unwrap()
      toast.success('Xóa ticket thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  tickets: [],
  ticket: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  loadingDetail: false,
  error: null,
}

export const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== List =====
      .addCase(getTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload?.data || []
        state.pagination = action.payload?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Detail =====
      .addCase(getTicketById.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.ticket = action.payload || null
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.loadingDetail = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create =====
      .addCase(createTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Update =====
      .addCase(updateTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTicket.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Update status =====
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTicketStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Delete =====
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTicket.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })
  },
})

export default ticketSlice.reducer
