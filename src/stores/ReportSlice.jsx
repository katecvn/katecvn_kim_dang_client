import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Purchase Backlog Report
export const getPurchaseBacklog = createAsyncThunk(
  'report/get-purchase-backlog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/purchases/backlog')
      return response.data.data || []
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Sales Backlog Report
export const getSalesBacklog = createAsyncThunk(
  'report/get-sales-backlog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/sales/backlog')
      return response.data.data || []
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    purchaseBacklog: [],
    salesBacklog: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Purchase Backlog
      .addCase(getPurchaseBacklog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseBacklog.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseBacklog = action.payload
      })
      .addCase(getPurchaseBacklog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Sales Backlog
      .addCase(getSalesBacklog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSalesBacklog.fulfilled, (state, action) => {
        state.loading = false
        state.salesBacklog = action.payload
      })
      .addCase(getSalesBacklog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default reportSlice.reducer
