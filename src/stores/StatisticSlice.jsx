import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getStatistic = createAsyncThunk(
  'statistic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/statistic')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  statistic: null,
  loading: false,
  error: null,
}

export const statisticSlice = createSlice({
  name: 'statistic',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatistic.pending, (state) => {
        state.loading = true
      })
      .addCase(getStatistic.fulfilled, (state, action) => {
        state.loading = false
        state.statistic = action.payload
      })
      .addCase(getStatistic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default statisticSlice.reducer
