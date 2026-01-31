import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'

// Async thunks
export const getInventorySummary = createAsyncThunk(
  'warehouseReport/getInventorySummary',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/inventory/nxt-report', { params })
      return data.data
    } catch (error) {
      try {
        const { data } = await api.get('/product-stock-snapshots', { params })
        return data.data
      } catch (err) {
        const message = handleError(error)
        return rejectWithValue(message)
      }
    }
  }
)

export const getInventoryDetail = createAsyncThunk(
  'warehouseReport/getInventoryDetail',
  async (params, { rejectWithValue }) => {
    try {
      // params: productId, fromDate, toDate
      const { data } = await api.get('/inventory/ledger', { params })
      // The API returns { data: { data: [...] } }
      return data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  inventorySummary: [],
  inventoryDetail: [],
  loading: false,
  error: null,
}

export const warehouseReportSlice = createSlice({
  name: 'warehouseReport',
  initialState,
  reducers: {
    clearReportData: (state) => {
      state.inventorySummary = []
      state.inventoryDetail = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(getInventorySummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getInventorySummary.fulfilled, (state, action) => {
        state.loading = false
        state.inventorySummary = action.payload || []
      })
      .addCase(getInventorySummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Mock data for UI development if API fails
        state.inventorySummary = []
      })

      // Detail
      .addCase(getInventoryDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getInventoryDetail.fulfilled, (state, action) => {
        state.loading = false
        state.inventoryDetail = action.payload || []
      })
      .addCase(getInventoryDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.inventoryDetail = []
      })
  },
})

export const { clearReportData } = warehouseReportSlice.actions

export default warehouseReportSlice.reducer
