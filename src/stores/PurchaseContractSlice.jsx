import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPurchaseContracts = createAsyncThunk(
  'purchaseContract/get-purchase-contracts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '', status = null, creator = null, paymentStatus = null, type = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-contracts', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search,
          status: Array.isArray(status) && status.length > 0 ? status.join(',') : undefined,
          creator: Array.isArray(creator) && creator.length > 0 ? creator.join(',') : undefined,
          paymentStatus: Array.isArray(paymentStatus) && paymentStatus.length > 0 ? paymentStatus.join(',') : undefined,
          type: Array.isArray(type) && type.length > 0 ? type.join(',') : undefined,
        },
      })
      const responseData = response.data

      // Robust extraction of data and pagination
      let data = responseData?.data?.data
      let pagination = responseData?.data?.pagination

      // Fallback: if data is directly in responseData.data (and it's an array)
      if (!Array.isArray(data) && Array.isArray(responseData?.data)) {
        data = responseData.data
        // Pagination might be at root or missing
        pagination = responseData.pagination || responseData
      }

      // Fallback: if responseData itself is the array
      if (!data && Array.isArray(responseData)) {
        data = responseData
      }

      data = data || []

      // Map pagination to internal structure
      const meta = pagination ? {
        ...pagination,
        last_page: pagination.totalPages || pagination.last_page || 1,
        current_page: pagination.page || pagination.current_page || 1,
        per_page: pagination.limit || pagination.per_page || 10
      } : undefined

      return { data, meta }
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
  async (contractData, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchase-contracts', contractData)
      toast.success('Tạo hợp đồng mua hàng thành công')
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
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchase-contracts/${id}`, data)
      toast.success('Cập nhật hợp đồng thành công')
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
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/purchase-contracts/${id}`)
      toast.success('Xóa hợp đồng thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const deleteMultiplePurchaseContracts = createAsyncThunk(
  'purchaseContract/deleteMultiple',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await api.post('/purchase-contracts/bulk-delete', { ids })
      const { success = [], failed = [] } = response.data || {}

      if (success.length > 0) {
        toast.success(`Đã xóa ${success.length} hợp đồng thành công`)
      }
      if (failed.length > 0) {
        failed.forEach((f) => {
          toast.error(f.message || `Không thể xóa hợp đồng ID ${f.id}`)
        })
      }
      // Only return successfully deleted ids to remove from local state
      return success.length > 0 ? success : ids
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updatePurchaseContractStatus = createAsyncThunk(
  'purchaseContract/update-status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchase-contracts/${id}/update-status`, { status })
      toast.success('Cập nhật trạng thái thành công')
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
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/confirm`)
      toast.success('Xác nhận hợp đồng thành công')
      return { id, response: response.data }
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const cancelPurchaseContract = createAsyncThunk(
  'purchaseContract/cancel-purchase-contract',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/cancel`)
      toast.success('Hủy hợp đồng thành công')
      return { id, response: response.data }
    } catch (error) {
      const message = handleError(error)
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const getMyPurchaseContracts = createAsyncThunk(
  'purchaseContract/get-my-purchase-contracts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '', status = null, creator = null, paymentStatus = null, type = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-contracts/by-user', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search,
          status: Array.isArray(status) && status.length > 0 ? status.join(',') : undefined,
          creator: Array.isArray(creator) && creator.length > 0 ? creator.join(',') : undefined,
          paymentStatus: Array.isArray(paymentStatus) && paymentStatus.length > 0 ? paymentStatus.join(',') : undefined,
          type: Array.isArray(type) && type.length > 0 ? type.join(',') : undefined,
        },
      })
      const responseData = response.data
      const { data, pagination } = responseData.data || {}

      // Map pagination to internal structure
      const meta = pagination ? {
        ...pagination,
        last_page: pagination.totalPages,
        current_page: pagination.page,
        per_page: pagination.limit
      } : undefined

      return { data, meta }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)



// Liquidation
export const getLiquidationPreview = createAsyncThunk(
  'purchaseContract/get-liquidation-preview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchase-contracts/${id}/liquidation-preview`)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const liquidatePurchaseContract = createAsyncThunk(
  'purchaseContract/liquidate',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/liquidate`, data)
      toast.success('Thanh lý hợp đồng thành công')
      return { id, response: response.data }
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const cancelLiquidatePurchaseContract = createAsyncThunk(
  'purchaseContract/cancel-liquidate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/purchase-contracts/${id}/revert-liquidate`)
      toast.success('Hủy thanh lý hợp đồng thành công')
      return { id, response: response.data }
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)


const purchaseContractSlice = createSlice({
  name: 'purchaseContract',
  initialState: {
    contracts: [],
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
        state.contracts = action.payload.data || []
        state.pagination = action.payload.meta || state.pagination
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
        state.contracts = action.payload.data || []
        state.pagination = action.payload.meta || state.pagination
      })
      .addCase(getMyPurchaseContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Purchase Contract
      .addCase(createPurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(createPurchaseContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Purchase Contract
      .addCase(updatePurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        const id = action.meta.arg?.id
        if (id) {
          const index = state.contracts.findIndex((c) => c.id === id)
          if (index !== -1 && action.payload?.data) {
            state.contracts[index] = { ...state.contracts[index], ...action.payload.data }
          }
        }
      })
      .addCase(updatePurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Purchase Contract
      .addCase(deletePurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.contracts = state.contracts.filter((c) => c.id !== action.payload)
        }
      })
      .addCase(deletePurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Multiple
      .addCase(deleteMultiplePurchaseContracts.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteMultiplePurchaseContracts.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload)) {
          state.contracts = state.contracts.filter((c) => !action.payload.includes(c.id))
        }
      })
      .addCase(deleteMultiplePurchaseContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Status
      .addCase(updatePurchaseContractStatus.pending, (state) => {
        state.error = null
      })
      .addCase(updatePurchaseContractStatus.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg
        const index = state.contracts.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.contracts[index].status = status
        }
      })
      .addCase(updatePurchaseContractStatus.rejected, (state, action) => {
        state.error = action.payload
      })
      // Confirm Purchase Contract
      .addCase(confirmPurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(confirmPurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        const { id } = action.payload
        const index = state.contracts.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.contracts[index].status = 'confirmed'
        }
      })
      .addCase(confirmPurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel Purchase Contract
      .addCase(cancelPurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(cancelPurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        const { id } = action.payload
        const index = state.contracts.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.contracts[index].status = 'cancelled'
        }
      })
      .addCase(cancelPurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Liquidate Purchase Contract
      .addCase(liquidatePurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(liquidatePurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        const { id } = action.payload
        const index = state.contracts.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.contracts[index].status = 'liquidated'
        }
      })
      .addCase(liquidatePurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel Liquidate Purchase Contract
      .addCase(cancelLiquidatePurchaseContract.pending, (state) => {
        state.loading = true
      })
      .addCase(cancelLiquidatePurchaseContract.fulfilled, (state, action) => {
        state.loading = false
        const { id } = action.payload
        const index = state.contracts.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.contracts[index].status = 'confirmed'
        }
      })
      .addCase(cancelLiquidatePurchaseContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default purchaseContractSlice.reducer
