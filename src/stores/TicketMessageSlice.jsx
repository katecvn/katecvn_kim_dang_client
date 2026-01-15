import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// GET /crm/tickets/:ticketId/messages
export const getTicketMessages = createAsyncThunk(
  'ticketMessage/list',
  async ({ ticketId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/crm/tickets/${ticketId}/messages`, {
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

// POST /crm/tickets/:ticketId/messages/staff
export const createStaffMessage = createAsyncThunk(
  'ticketMessage/createStaff',
  async ({ ticketId, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/crm/tickets/${ticketId}/messages/staff`, data)
      await dispatch(
        getTicketMessages({
          ticketId,
          params: params || {},
        }),
      ).unwrap()
      toast.success('Thêm message (nhân viên) thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// POST /crm/tickets/:ticketId/messages/customer
export const createCustomerMessage = createAsyncThunk(
  'ticketMessage/createCustomer',
  async ({ ticketId, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/crm/tickets/${ticketId}/messages/customer`, data)
      await dispatch(
        getTicketMessages({
          ticketId,
          params: params || {},
        }),
      ).unwrap()
      toast.success('Thêm message (khách hàng) thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// POST /crm/tickets/:ticketId/messages/system
export const createSystemMessage = createAsyncThunk(
  'ticketMessage/createSystem',
  async ({ ticketId, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/crm/tickets/${ticketId}/messages/system`, data)
      await dispatch(
        getTicketMessages({
          ticketId,
          params: params || {},
        }),
      ).unwrap()
      toast.success('Thêm message (hệ thống) thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  messages: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
}

export const ticketMessageSlice = createSlice({
  name: 'ticketMessage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== List messages =====
      .addCase(getTicketMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTicketMessages.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload?.data || []
        state.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      })
      .addCase(getTicketMessages.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create staff message =====
      .addCase(createStaffMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createStaffMessage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createStaffMessage.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create customer message =====
      .addCase(createCustomerMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomerMessage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomerMessage.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create system message =====
      .addCase(createSystemMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSystemMessage.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSystemMessage.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })
  },
})

export default ticketMessageSlice.reducer
