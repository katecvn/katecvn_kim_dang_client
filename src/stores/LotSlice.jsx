import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as lotApi from '@/api/lot'
import { handleError } from '@/utils/handle-error'

// Async thunks
export const getAvailableLots = createAsyncThunk(
  'lot/getAvailable',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await lotApi.getAvailableLots(productId)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const allocateLots = createAsyncThunk(
  'lot/allocate',
  async ({ detailId, allocations }, { rejectWithValue }) => {
    try {
      const response = await lotApi.allocateLots(detailId, allocations)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const getLotAllocations = createAsyncThunk(
  'lot/getAllocations',
  async (detailId, { rejectWithValue }) => {
    try {
      const response = await lotApi.getLotAllocations(detailId)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  availableLots: [],
  allocations: {},
  loading: false,
  error: null,
}

export const lotSlice = createSlice({
  name: 'lot',
  initialState,
  reducers: {
    clearAvailableLots: (state) => {
      state.availableLots = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get available lots
      .addCase(getAvailableLots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAvailableLots.fulfilled, (state, action) => {
        state.loading = false
        state.availableLots = action.payload
      })
      .addCase(getAvailableLots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Allocate lots
      .addCase(allocateLots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(allocateLots.fulfilled, (state, action) => {
        state.loading = false
        // Store allocations by detailId
        if (action.payload.detailId) {
          state.allocations[action.payload.detailId] = action.payload.allocations
        }
      })
      .addCase(allocateLots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get lot allocations
      .addCase(getLotAllocations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLotAllocations.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.detailId) {
          state.allocations[action.payload.detailId] = action.payload.allocations
        }
      })
      .addCase(getLotAllocations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAvailableLots, clearError } = lotSlice.actions

export default lotSlice.reducer
