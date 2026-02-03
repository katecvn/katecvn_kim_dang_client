import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'

// Async thunks
export const getLots = createAsyncThunk(
  'lot/getLots',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/lots', { params })
      return data.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const getLotById = createAsyncThunk(
  'lot/getLotById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lots/${id}`)
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const createLot = createAsyncThunk(
  'lot/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/lots', data)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const updateLot = createAsyncThunk(
  'lot/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lots/${id}`, data)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const deleteLot = createAsyncThunk(
  'lot/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/lots/${id}`)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const getAvailableLots = createAsyncThunk(
  'lot/getAvailable',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/lots/available?productId=${productId}`)
      return data.data
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
      const { data } = await api.post(
        `/warehouse-receipts/detail/${detailId}/allocations`,
        { allocations }
      )
      return data
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
      const { data } = await api.get(
        `/warehouse-receipts/detail/${detailId}/allocations`
      )
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  lots: [],
  lot: null,
  availableLots: [],
  allocations: {},
  loading: false,
  detailLoading: false,
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
    clearLotDetail: (state) => {
      state.lot = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get lots
      .addCase(getLots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLots.fulfilled, (state, action) => {
        state.loading = false
        state.lots = action.payload || []
      })
      .addCase(getLots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get lot by id
      .addCase(getLotById.pending, (state) => {
        state.detailLoading = true
        state.error = null
        state.lot = null
      })
      .addCase(getLotById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.lot = action.payload
      })
      .addCase(getLotById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload
      })
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
      // Create lot
      .addCase(createLot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLot.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createLot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update lot
      .addCase(updateLot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLot.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateLot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete lot
      .addCase(deleteLot.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLot.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteLot.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAvailableLots, clearError } = lotSlice.actions

export default lotSlice.reducer
