import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProducts = createAsyncThunk(
  'product',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product')
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product/${data}/delete`)
      await dispatch(getProducts()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteMultipleProducts = createAsyncThunk(
  'product/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/product/bulk-delete', { ids })
      await dispatch(getProducts()).unwrap()
      toast.success('Xóa các sản phẩm đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// =====================
// NEW: form-data helpers (support nested arrays/objects)
// =====================
const buildFormData = (data) => {
  console.log('📦 Data received in buildFormData:', data)  // ← THÊM DÒNG NÀY
  console.log('📦 supplierId value:', data.supplierId)
  const formData = new FormData()

  // Helper append primitive (skip null/undefined)
  const appendIfPresent = (key, val) => {
    if (val === null || val === undefined) return
    formData.append(key, val)
  }

  // Helper append array primitives
  const appendArray = (key, arr) => {
    if (Array.isArray(arr) && arr.length) {
      arr.forEach((item, i) => {
        if (item === null || item === undefined) return
        formData.append(`${key}[${i}]`, item)
      })
    } else {
      // keep backward-compatible for server side parsers
      formData.append(`${key}[]`, '')
    }
  }

  // Helper append array of objects
  const appendArrayObjects = (key, arr, fields) => {
    if (Array.isArray(arr) && arr.length) {
      arr.forEach((obj, i) => {
        fields.forEach((f) => {
          const v = obj?.[f]
          if (v === null || v === undefined) return
          formData.append(`${key}[${i}][${f}]`, v)
        })
      })
    } else {
      formData.append(`${key}[]`, '')
    }
  }

  // taxIds
  appendArray('taxIds', data.taxIds)

  // attributeIdsWithValue
  appendArrayObjects('attributeIdsWithValue', data.attributeIdsWithValue, [
    'attributeId',
    'value',
  ])

  // NEW: unitConversions
  // Payload: unitConversions[{ unitId, conversionFactor }]
  // Lưu ý: conversionFactor là number/string đều được, backend sẽ toNumber().
  appendArrayObjects('unitConversions', data.unitConversions, [
    'unitId',
    'conversionFactor',
  ])

    // fields primitives
    ;[
      'code',
      'categoryId',
      'supplierId',
      'unitId',
      'basePrice',
      'price',
      'name',
      'description',
      'note',
      'type',
      'applyWarranty',
      'manageSerial',
    ].forEach((field) => appendIfPresent(field, data[field]))

  // salaryCoefficient
  if (data.salaryCoefficient) {
    const sc = data.salaryCoefficient
    appendIfPresent('salaryCoefficient[coefficient]', sc.coefficient)
    appendIfPresent('salaryCoefficient[type]', sc.type)
    appendIfPresent('salaryCoefficient[effectiveDate]', sc.effectiveDate)
  }

  // image (previously named "document")
  if (data.image) {
    formData.append('image', data.image)
  }

  // hasExpiry
  if (data.hasExpiry !== undefined) {
    formData.append('hasExpiry', !!data.hasExpiry)
  }

  // warrantyPolicy
  if ((data.applyWarranty !== undefined ? data.applyWarranty : !!data.warrantyPolicy) && data.warrantyPolicy) {
    // NOTE: Logic complex here. 
    // strict: if applyWarranty passed, use it. If not, if warrantyPolicy passed, implies active?
    // Actually applyWarranty is in the simple fields list above, so it is appended if dirty.
    // warrantyPolicy object is what we care about here.
    // If data.warrantyPolicy exists, we likely want to update it.
    const wp = data.warrantyPolicy
    appendIfPresent('warrantyPolicy[periodMonths]', wp.periodMonths)
    formData.append('warrantyPolicy[conditions]', wp.conditions || '')
    appendIfPresent('warrantyPolicy[warrantyCost]', wp.warrantyCost || 0)
    appendIfPresent('warrantyPolicy[status]', wp.status)
  }

  // Price Sync fields
  if (data.syncEnabled !== undefined) {
    formData.append('syncEnabled', !!data.syncEnabled)
  }
  if (data.syncExternalCode) { // logic dependent on syncEnabled usually, but if sent partially, we just strip if present
    formData.append('syncExternalCode', data.syncExternalCode)
  }

  return formData
}

export const createProduct = createAsyncThunk(
  'product/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const formData = buildFormData(data)

      await api.post('/product/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await dispatch(getProducts()).unwrap()
      toast.success('Tạo sản phẩm thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const formData = buildFormData(data)

      await api.put(`/product/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await dispatch(getProducts()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getProductDetail = createAsyncThunk(
  'product/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const copyProduct = createAsyncThunk(
  'product/copy',
  async (id, { rejectWithValue }) => {
    try {
      await api.get(`/product/copy/${id}`)
      toast.success('Sao chép sản phẩm thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getProductSaleHistory = createAsyncThunk(
  'product/sale-history',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}/sale-history`, { params })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const importProduct = createAsyncThunk(
  'product/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/product/import', data)
      await dispatch(getProducts()).unwrap()
      return response.data
      // toast.success('Import dữ liệu thành công') // Toast handled in Dialog for better count info
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  products: [],
  product: null,
  saleHistory: {
    data: [],
    pagination: null,
    totalsByUnit: {},
  },
  loading: false,
  error: null,
}

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Update single product in store (for real-time updates)
    updateProductInStore: (state, action) => {
      const updatedProduct = action.payload
      const index = state.products.findIndex(p => p.id === updatedProduct.id)
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updatedProduct }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(getProductDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(copyProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(copyProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(copyProduct.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(importProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importProduct.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload
        state.error = payload?.message || payload || 'Lỗi không xác định'

        // Only toast if it's a simple error message, not a structured error object
        // The UI component (ImportProductDialog) handles structured 'importErrors'
        const hasImportErrors =
          payload?.importErrors ||
          payload?.message?.importErrors ||
          (typeof payload === 'object' && 'importErrors' in payload)

        if (!hasImportErrors) {
          let msg = state.error
          if (typeof msg === 'object') {
            try { msg = JSON.stringify(msg) } catch (e) { msg = 'Lỗi không xác định' }
          }
          toast.error(String(msg))
        }
      })

      .addCase(getProductSaleHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductSaleHistory.fulfilled, (state, action) => {
        state.loading = false
        state.saleHistory.data = action.payload?.data
        state.saleHistory.pagination = action.payload?.pagination
        state.saleHistory.totalsByUnit = action.payload?.totalsByUnit
      })
      .addCase(getProductSaleHistory.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export const { updateProductInStore } = productSlice.actions

export default productSlice.reducer
