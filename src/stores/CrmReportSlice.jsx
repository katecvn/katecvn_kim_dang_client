import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// GET /crm/reports/tickets
export const getTicketStats = createAsyncThunk(
  'crmReport/ticketStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/reports/tickets', { params })
      const { data } = response.data // { byStatus, byChannel, byAssignee }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// GET /crm/reports/tickets/sla
export const getTicketSlaStats = createAsyncThunk(
  'crmReport/ticketSlaStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/reports/tickets/sla', { params })
      const { data } = response.data // { count, avgMinutes, minMinutes, maxMinutes }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// GET /crm/reports/care-activities
export const getCareActivityStats = createAsyncThunk(
  'crmReport/careActivityStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/reports/care-activities', { params })
      const { data } = response.data
      return data // { mode, ticketByCustomer/... hoặc ticketByUser/... }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// GET /crm/reports/tasks
export const getTaskStats = createAsyncThunk(
  'crmReport/taskStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/reports/tasks', { params })
      const { data } = response.data // { byStatus, overdue, pending }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  ticketStats: {
    byStatus: [],
    byChannel: [],
    byAssignee: [],
  },
  ticketSlaStats: {
    count: 0,
    avgMinutes: 0,
    minMinutes: 0,
    maxMinutes: 0,
  },
  careActivityStats: {
    mode: 'customer',
    ticketByCustomer: [],
    noteByCustomer: [],
    taskByCustomer: [],
    ticketByUser: [],
    noteByUser: [],
    taskByUser: [],
  },
  taskStats: {
    byStatus: [],
    overdue: 0,
    pending: 0,
  },
  loadingTicketStats: false,
  loadingTicketSlaStats: false,
  loadingCareActivityStats: false,
  loadingTaskStats: false,
  error: null,
}

export const crmReportSlice = createSlice({
  name: 'crmReport',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== Ticket stats =====
      .addCase(getTicketStats.pending, (state) => {
        state.loadingTicketStats = true
        state.error = null
      })
      .addCase(getTicketStats.fulfilled, (state, action) => {
        state.loadingTicketStats = false
        state.ticketStats = {
          byStatus: action.payload?.byStatus || [],
          byChannel: action.payload?.byChannel || [],
          byAssignee: action.payload?.byAssignee || [],
        }
      })
      .addCase(getTicketStats.rejected, (state, action) => {
        state.loadingTicketStats = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Ticket SLA stats =====
      .addCase(getTicketSlaStats.pending, (state) => {
        state.loadingTicketSlaStats = true
        state.error = null
      })
      .addCase(getTicketSlaStats.fulfilled, (state, action) => {
        state.loadingTicketSlaStats = false
        state.ticketSlaStats = {
          count: action.payload?.count ?? 0,
          avgMinutes: action.payload?.avgMinutes ?? 0,
          minMinutes: action.payload?.minMinutes ?? 0,
          maxMinutes: action.payload?.maxMinutes ?? 0,
        }
      })
      .addCase(getTicketSlaStats.rejected, (state, action) => {
        state.loadingTicketSlaStats = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Care activity stats =====
      .addCase(getCareActivityStats.pending, (state) => {
        state.loadingCareActivityStats = true
        state.error = null
      })
      .addCase(getCareActivityStats.fulfilled, (state, action) => {
        state.loadingCareActivityStats = false
        const payload = action.payload || {}
        state.careActivityStats = {
          mode: payload.mode || 'customer',
          ticketByCustomer: payload.ticketByCustomer || [],
          noteByCustomer: payload.noteByCustomer || [],
          taskByCustomer: payload.taskByCustomer || [],
          ticketByUser: payload.ticketByUser || [],
          noteByUser: payload.noteByUser || [],
          taskByUser: payload.taskByUser || [],
        }
      })
      .addCase(getCareActivityStats.rejected, (state, action) => {
        state.loadingCareActivityStats = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Task stats =====
      .addCase(getTaskStats.pending, (state) => {
        state.loadingTaskStats = true
        state.error = null
      })
      .addCase(getTaskStats.fulfilled, (state, action) => {
        state.loadingTaskStats = false
        state.taskStats = {
          byStatus: action.payload?.byStatus || [],
          overdue: action.payload?.overdue ?? 0,
          pending: action.payload?.pending ?? 0,
        }
      })
      .addCase(getTaskStats.rejected, (state, action) => {
        state.loadingTaskStats = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })
  },
})

export default crmReportSlice.reducer
