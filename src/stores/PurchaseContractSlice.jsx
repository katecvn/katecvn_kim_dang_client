import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPurchaseContracts = createAsyncThunk(
  'purchaseContract/get-purchase-contracts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-contracts', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
        },
      })
      const { data } = response.data
      return data // Return { data: [...], pagination: {...} }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPurchaseContractDetail = createAsyncThunk(
  'purchaseContract/get-purchase-contract-detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchase-contracts/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createPurchaseContract = createAsyncThunk(
  'purchaseContract/create-purchase-contract',
  async (contractData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/purchase-contracts', contractData)
      toast.success('Tạo hợp đồng mua hàng thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const updatePurchaseContract = createAsyncThunk(
  'purchaseContract/update-purchase-contract',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/purchase-contracts/${id}`, data)
      toast.success('Cập nhật hợp đồng thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const deletePurchaseContract = createAsyncThunk(
  'purchaseContract/delete-purchase-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/purchase-contracts/${id}`)
      toast.success('Xóa hợp đồng thành công')
      dispatch(getPurchaseContracts({}))
      return id
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const updatePurchaseContractStatus = createAsyncThunk(
  'purchaseContract/update-status',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/purchase-contracts/${id}/update-status`, { status })
      toast.success('Cập nhật trạng thái thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const confirmPurchaseContract = createAsyncThunk(
  'purchaseContract/confirm-purchase-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/confirm`)
      toast.success('Xác nhận hợp đồng thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const cancelPurchaseContract = createAsyncThunk(
  'purchaseContract/cancel-purchase-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/cancel`)
      toast.success('Hủy hợp đồng thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const getMyPurchaseContracts = createAsyncThunk(
  'purchaseContract/get-my-purchase-contracts',
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-contracts/by-user', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
        },
      })
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// NOTE: Review/Liquidate endpoints might be different or not needed for Purchase, but keeping structure per request
export const liquidatePurchaseContract = createAsyncThunk(
  'purchaseContract/liquidate',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/liquidate`, data)
      toast.success('Thanh lý hợp đồng thành công')
      dispatch(getPurchaseContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const purchaseContractSlice = createSlice({
  name: 'purchaseContract',
  initialState: {
    contracts: [], // Reusing 'contracts' name for consistency
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Purchase Contracts
      .addCase(getPurchaseContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPurchaseContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getPurchaseContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get My Purchase Contracts
      .addCase(getMyPurchaseContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyPurchaseContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload
      })
      .addCase(getMyPurchaseContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Generic loading handlers for mutations
      .addMatcher(
        (action) => action.type.startsWith('purchaseContract') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('purchaseContract') && action.type.endsWith('/fulfilled'),
        (state) => {
          if (!state.contracts) state.loading = false // Avoid overriding get fulfilled which sets data
          // Actually better to just handle specific cases or rely on specific handlers.
          // Simplified approach above handled specific GETs.
          // Mutations:
          // create, update, delete, confirm, cancel, liquidate
          // All these set loading=true then false.
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('purchaseContract') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload
        }
      )
  },
})

export default purchaseContractSlice.reducer
