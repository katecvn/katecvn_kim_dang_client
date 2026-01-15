import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const setSharingRatios = createAsyncThunk(
  'setting/sharing-ratio',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/setting/sharing-ratio', data)
      await dispatch(getSetting('sharing_ratio'))
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getSetting = createAsyncThunk(
  'setting/get-setting',
  async (key, { rejectWithValue }) => {
    try {
      const response = await api.get(`/setting?key=${key}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const syncSystemSetting = createAsyncThunk(
  'setting/sync-system-setting',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/setting/sync-system-setting')
      await dispatch(getSetting('system_information'))
      toast.success('Đồng bộ thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateGeneralSetting = createAsyncThunk(
  'setting/update-general-setting',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/setting/general-information', data)
      await dispatch(getSetting('general_information'))
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateSInvoiceSetting = createAsyncThunk(
  'setting/update-s-invoice-setting',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/setting/s-invoice', data)
      await dispatch(getSetting('s_invoice'))
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  setting: null,
  loading: false,
  error: null,
}

export const settingSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setSharingRatios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setSharingRatios.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(setSharingRatios.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSetting.fulfilled, (state, action) => {
        state.setting = action.payload
        state.loading = false
      })
      .addCase(getSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // update s invoice setting
      .addCase(updateSInvoiceSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSInvoiceSetting.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateSInvoiceSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default settingSlice.reducer
