import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSalesContracts = createAsyncThunk(
  'salesContract/get-sales-contracts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales-contracts', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search
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

export const getSalesContractDetail = createAsyncThunk(
  'salesContract/get-sales-contract-detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales-contracts/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createSalesContract = createAsyncThunk(
  'salesContract/create-sales-contract',
  async (contractData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/sales-contracts', contractData)
      toast.success('Tạo hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const updateSalesContract = createAsyncThunk(
  'salesContract/update-sales-contract',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/sales-contracts/${id}`, data)
      toast.success('Cập nhật hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const deleteSalesContract = createAsyncThunk(
  'salesContract/delete-sales-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/sales-contracts/${id}`)
      toast.success('Xóa hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return id
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const updateSalesContractStatus = createAsyncThunk(
  'salesContract/update-status',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/sales-contracts/${id}/update-status`, { status })
      toast.success('Cập nhật trạng thái thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const confirmSalesContract = createAsyncThunk(
  'salesContract/confirm-sales-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/sales-contracts/${id}/confirm`)
      toast.success('Xác nhận hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const cancelSalesContract = createAsyncThunk(
  'salesContract/cancel-sales-contract',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/sales-contracts/${id}/cancel`)
      toast.success('Hủy hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const getMySalesContracts = createAsyncThunk(
  'salesContract/get-my-sales-contracts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales-contracts/by-user', {
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
          search
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



export const reviewSalesContract = createAsyncThunk(
  'salesContract/review-sales-contract',
  async (invoiceIds, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales-contracts/review', {
        params: { invoices: invoiceIds },
        paramsSerializer: (params) => {
          const qs = require('qs')
          return qs.stringify(params, { arrayFormat: 'indices' })
        },
      })
      return response.data?.data || []
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getLiquidationPreview = createAsyncThunk(
  'salesContract/get-liquidation-preview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales-contracts/${id}/liquidation-preview`)
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const liquidateSalesContract = createAsyncThunk(
  'salesContract/liquidate',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/sales-contracts/${id}/liquidate`, data)
      toast.success('Thanh lý hợp đồng thành công')
      dispatch(getSalesContracts({}))
      return response.data
    } catch (error) {
      const message = handleError(error)
      toast.error(message?.message || 'Có lỗi xảy ra')
      return rejectWithValue(message)
    }
  },
)

export const increasePrintAttempt = createAsyncThunk(
  'salesContract/increase-print-attempt',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/sales-contracts/${id}/print-attempt`)
      return id
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const increasePrintSuccess = createAsyncThunk(
  'salesContract/increase-print-success',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/sales-contracts/${id}/print-success`)
      return id
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

const salesContractSlice = createSlice({
  name: 'salesContract',
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
      // Get Sales Contracts
      .addCase(getSalesContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSalesContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload.data || []
        state.pagination = action.payload.meta || state.pagination
      })
      .addCase(getSalesContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get My Sales Contracts
      .addCase(getMySalesContracts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMySalesContracts.fulfilled, (state, action) => {
        state.loading = false
        state.contracts = action.payload.data || []
        state.pagination = action.payload.meta || state.pagination
      })
      .addCase(getMySalesContracts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Sales Contract
      .addCase(createSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(createSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Sales Contract
      .addCase(updateSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(updateSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete Sales Contract
      .addCase(deleteSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Confirm Sales Contract
      .addCase(confirmSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(confirmSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(confirmSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel Sales Contract
      .addCase(cancelSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(cancelSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(cancelSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Liquidate Sales Contract
      .addCase(liquidateSalesContract.pending, (state) => {
        state.loading = true
      })
      .addCase(liquidateSalesContract.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(liquidateSalesContract.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default salesContractSlice.reducer
