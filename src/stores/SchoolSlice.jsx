import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSchools = createAsyncThunk(
  'school',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/school')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getSchoolsByUser = createAsyncThunk(
  'school-user',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/school/by-user')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const syncSchools = createAsyncThunk(
  'school/sync',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/school/sync')
      await dispatch(getSchools())
      toast.success('Đồng bộ hóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createSchool = createAsyncThunk(
  'school/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await api.post('/school', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      await dispatch(syncSchools()).unwrap()
      await dispatch(getSchools()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const toggleSchoolStatus = createAsyncThunk(
  'school/toggle-status',
  async (schoolId, { rejectWithValue, dispatch }) => {
    try {
      await api.patch(`/school/${schoolId}/toggle-status`)
      await dispatch(syncSchools()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateSchoolPricingPlan = createAsyncThunk(
  'school/update-pricing-plan',
  async (data, { rejectWithValue, dispatch }) => {
    const { schoolId } = data
    try {
      await api.put(`/school/${schoolId}/pricing-plan`, data)
      await dispatch(syncSchools()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const setSupportStaff = createAsyncThunk(
  'school/set-support-staff',
  async (data, { rejectWithValue, dispatch }) => {
    const { schoolId, supportStaffId } = data
    try {
      await api.post('/school/set-support-staff', { schoolId, supportStaffId })
      await dispatch(getSchools()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateStorageSizeSetting = createAsyncThunk(
  'school/update-storage-size-setting',
  async (data, { rejectWithValue, dispatch }) => {
    const { schoolId } = data
    try {
      await api.post('/school/create-or-update-all-storage-settings', {
        schoolId,
        ...data,
      })
      await dispatch(getSchools()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  school: {},
  schools: [],
  loading: false,
  error: null,
}

export const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSchools.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload
      })
      .addCase(getSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getSchoolsByUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSchoolsByUser.fulfilled, (state, action) => {
        state.loading = false
        state.schools = action.payload
      })
      .addCase(getSchoolsByUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(syncSchools.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(syncSchools.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(syncSchools.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createSchool.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSchool.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(toggleSchoolStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleSchoolStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(toggleSchoolStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateSchoolPricingPlan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSchoolPricingPlan.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSchoolPricingPlan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(setSupportStaff.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setSupportStaff.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(setSupportStaff.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateStorageSizeSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateStorageSizeSetting.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateStorageSizeSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default schoolSlice.reducer
