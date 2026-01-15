import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const createOrUpdateBusinessPlans = createAsyncThunk(
  'create-or-update-business-plans',
  async ({ months, year }, { rejectWithValue }) => {
    try {
      const response = await api.post('/business-plan', { months, year })
      const { data } = response.data
      toast.success('Cập nhật thành công')
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  businessPlans: [],
  loading: false,
  error: null,
}

export const businessPlansSlice = createSlice({
  name: 'business_plan',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrUpdateBusinessPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrUpdateBusinessPlans.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createOrUpdateBusinessPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default businessPlansSlice.reducer
