import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { getSchools } from './SchoolSlice'

export const allowUseKafoodApp = createAsyncThunk(
  'role/allow-use-kafood-app',
  async (parentRolePermission, { rejectWithValue, dispatch }) => {
    const dataToSend = {
      schoolId: parentRolePermission.schoolId,
      data: parentRolePermission.parentRolePermissionData.data,
    }

    try {
      await api.post('/school/allow-use-kafood-app', dataToSend)
      await dispatch(getSchools()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getParentAccountRole = createAsyncThunk(
  'role/get-parent-account-role',
  async (schoolId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/school/${schoolId}/get-parent-account-role`,
      )
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  loading: false,
  error: null,
  parentRolePermission: null,
}

export const parentRolePermissionSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getParentAccountRole.pending, (state) => {
        state.loading = true
      })
      .addCase(getParentAccountRole.fulfilled, (state, action) => {
        state.loading = false
        state.parentRolePermission = action.payload
      })
      .addCase(getParentAccountRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(allowUseKafoodApp.pending, (state) => {
        state.loading = true
      })
      .addCase(allowUseKafoodApp.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(allowUseKafoodApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default parentRolePermissionSlice.reducer
