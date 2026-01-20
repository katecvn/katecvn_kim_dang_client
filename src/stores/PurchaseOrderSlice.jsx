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
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-order', {
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

export const getPurchaseOrderDetail = createAsyncThunk(
  'purchaseOrder/get-purchase-order-detail',
  async (id, { rejectWithValue }) => {
    try {
      const getAdminPurchaseOrder = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('GET_PURCHASE_ORDER')

      const response = getAdminPurchaseOrder
        ? await api.get(`/purchase-order/${id}/admin`)
        : await api.get(`/purchase-order/${id}/by-user`)

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
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/purchase-order/by-user', {
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

export const deletePurchaseOrder = createAsyncThunk(
  'purchaseOrder/delete-purchase-order',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const deleteAdminPurchaseOrders = JSON.parse(
        localStorage.getItem('permissionCodes'),
      ).includes('DELETE_PURCHASE_ORDER')

      deleteAdminPurchaseOrders
        ? await api.delete(`/purchase-order/${id}/delete`)
        : await api.delete(`/purchase-order/${id}/delete-by-user`)
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

export const createPurchaseOrder = createAsyncThunk(
  'purchaseOrder/create-purchase-order',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/purchase-order/create', dataToSend)
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
        `/purchase-order/${dataToSend.purchaseOrderId}/update-pending`,
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

export const updatePurchaseOrderStatus = createAsyncThunk(
  'purchaseOrder/update-purchase-order-status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/purchase-order/${data.id}/update`, data)
      await dispatch(
        getPurchaseOrders({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
      toast.success('Cập nhật trạng thái thành công')
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
        state.purchaseOrders = action.payload
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMyPurchaseOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrders = action.payload
      })
      .addCase(getMyPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
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
      .addCase(updatePurchaseOrderStatus.fulfilled, (state) => {
        state.loading = false
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
      .addCase(getPurchaseOrderDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getPurchaseOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrder = action.payload
      })
      .addCase(getPurchaseOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default purchaseOrderSlice.reducer
