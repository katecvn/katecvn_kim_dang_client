import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Purchase Backlog Report
// Purchase Backlog Report
export const getPurchaseSummary = createAsyncThunk(
  'report/get-purchase-summary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/purchases/summary', {
        params,
      })
      console.log('rss', response.data)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Purchase Backlog Report
export const getPurchaseBacklog = createAsyncThunk(
  'report/get-purchase-backlog',
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/purchases/backlog', {
        params: {
          page,
          limit,
        },
      })

      const responseData = response.data
      let data = responseData?.data
      let pagination = responseData?.pagination
      console.log('pagination', pagination)

      // Fallback if structure is different
      if (!Array.isArray(data) && Array.isArray(responseData?.data)) {
        data = responseData.data
        pagination = responseData.pagination

      }

      if (!data && Array.isArray(responseData)) {
        data = responseData
        pagination = null
      }

      return {
        data: data || [],
        pagination: pagination || {
          total: (data || []).length,
          page: 1,
          limit: (data || []).length || 50,
          totalPages: 1
        }
      }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Sales Backlog Report
export const getSalesBacklog = createAsyncThunk(
  'report/get-sales-backlog',
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/sales/backlog', {
        params: {
          page,
          limit,
        },
      })

      const responseData = response.data
      let data = responseData?.data?.data
      let pagination = responseData?.data?.pagination

      // Fallback if structure is different
      if (!Array.isArray(data) && Array.isArray(responseData?.data)) {
        data = responseData.data
        pagination = responseData.pagination
      }

      if (!data && Array.isArray(responseData)) {
        data = responseData
        pagination = null
      }

      return {
        data: data || [],
        pagination: pagination || {
          total: (data || []).length,
          page: 1,
          limit: (data || []).length || 50,
          totalPages: 1
        }
      }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    purchaseSummary: null,
    purchaseBacklog: [],
    purchaseBacklogPagination: {
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 1
    },
    salesBacklog: [], // Array of contracts
    salesBacklogPagination: { // Pagination metadata
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 1
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Purchase Summary
      .addCase(getPurchaseSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseSummary.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseSummary = action.payload.data
      })
      .addCase(getPurchaseSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Get Purchase Backlog
      .addCase(getPurchaseBacklog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseBacklog.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseBacklog = action.payload.data
        state.purchaseBacklogPagination = action.payload.pagination
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
        state.salesBacklog = action.payload.data
        state.salesBacklogPagination = action.payload.pagination
      })
      .addCase(getSalesBacklog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default reportSlice.reducer
