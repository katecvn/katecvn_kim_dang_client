import api from '@/utils/axios'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPurchaseOrders = createAsyncThunk(
  'purchaseOrder/get-purchase-orders',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-orders', {
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

export const getPurchaseOrderDetail = createAsyncThunk(
  'purchaseOrder/get-purchase-order-detail',
  async (id, { rejectWithValue }) => {
    try {
      const getAdminPurchaseOrder = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('PURCHASE_ORDER_VIEW_ALL')

      const response = getAdminPurchaseOrder
        ? await api.get(`/purchase-orders/${id}`)
        : await api.get(`/purchase-orders/${id}`)

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyPurchaseOrders = createAsyncThunk(
  'purchaseOrder/get-my-purchase-orders',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-orders/by-user', {
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

export const deletePurchaseOrder = createAsyncThunk(
  'purchaseOrder/delete-purchase-order',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const deleteAdminPurchaseOrders = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('PURCHASE_ORDER_DELETE')

      deleteAdminPurchaseOrders
        ? await api.delete(`/purchase-orders/${id}`)
        : await api.delete(`/purchase-orders/${id}`)
      deleteAdminPurchaseOrders
        ? await dispatch(
          getPurchaseOrders({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
        : await dispatch(
          getMyPurchaseOrders({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultiplePurchaseOrders = createAsyncThunk(
  'purchaseOrder/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/purchase-orders/bulk-delete', { ids })

      const deleteAdminPurchaseOrders = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('PURCHASE_ORDER_DELETE')

      deleteAdminPurchaseOrders
        ? await dispatch(
          getPurchaseOrders({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
        : await dispatch(
          getMyPurchaseOrders({
            fromDate: getStartOfCurrentMonth(),
            toDate: getEndOfCurrentMonth(),
          }),
        ).unwrap()
      toast.success('Xóa các đơn mua hàng đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createPurchaseOrder = createAsyncThunk(
  'purchaseOrder/create-purchase-order',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/purchase-orders', dataToSend)
      await dispatch(
        getMyPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Tạo đơn đặt hàng thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updatePurchaseOrder = createAsyncThunk(
  'purchaseOrder/update-purchase-order',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(
        `/purchase-orders/${dataToSend.purchaseOrderId}`,
        dataToSend,
      )
      await dispatch(
        getMyPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Cập nhật thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Confirm PO
export const confirmPurchaseOrder = createAsyncThunk(
  'purchaseOrder/confirm',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/purchase-orders/${id}/confirm`)
      await dispatch(
        getMyPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Đã xác nhận đơn hàng')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const importPurchaseOrder = createAsyncThunk(
  'purchaseOrder/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/purchase-orders/import', data)
      await dispatch(
        getPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Import đơn hàng thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Cancel PO
export const cancelPurchaseOrder = createAsyncThunk(
  'purchaseOrder/cancel',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/purchase-orders/${id}/cancel`)
      await dispatch(
        getMyPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Đã hủy đơn hàng')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// Revert PO
export const revertPurchaseOrder = createAsyncThunk(
  'purchaseOrder/revert',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/purchase-orders/${id}/revert`)
      await dispatch(
        getMyPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Đã chuyển về nháp')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updatePurchaseOrderStatus = createAsyncThunk(
  'purchaseOrder/update-purchase-order-status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/purchase-orders/${data.id}`, data)
      toast.success('Cập nhật trạng thái thành công')
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)



const initialState = {
  purchaseOrders: [],
  purchaseOrder: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  }
}

export const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPurchaseOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrders = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.purchaseOrders = []
      })
      .addCase(getMyPurchaseOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrders = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getMyPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.purchaseOrders = []
      })
      .addCase(deletePurchaseOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePurchaseOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePurchaseOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          const { id, status } = action.payload
          const index = state.purchaseOrders.findIndex((po) => po.id === id)
          if (index !== -1) {
            state.purchaseOrders[index].status = status
          }
        }
      })
      .addCase(updatePurchaseOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updatePurchaseOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Confirm
      .addCase(confirmPurchaseOrder.fulfilled, (state) => { state.loading = false })
      .addCase(confirmPurchaseOrder.pending, (state) => { state.loading = true })
      .addCase(confirmPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Cancel
      .addCase(cancelPurchaseOrder.fulfilled, (state) => { state.loading = false })
      .addCase(cancelPurchaseOrder.pending, (state) => { state.loading = true })
      .addCase(cancelPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Revert
      .addCase(revertPurchaseOrder.fulfilled, (state) => { state.loading = false })
      .addCase(revertPurchaseOrder.pending, (state) => { state.loading = true })
      .addCase(revertPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Import
      .addCase(importPurchaseOrder.fulfilled, (state) => { state.loading = false })
      .addCase(importPurchaseOrder.pending, (state) => { state.loading = true })
      .addCase(importPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getPurchaseOrderDetail.pending, (state) => {
        // Don't set global loading to true to avoid unmounting the list/dialog
        // The component should handle its own loading state
      })
      .addCase(getPurchaseOrderDetail.fulfilled, (state, action) => {
        state.purchaseOrder = action.payload
      })
      .addCase(getPurchaseOrderDetail.rejected, (state, action) => {
        state.error = action.payload
      })

  },
})

export default purchaseOrderSlice.reducer
