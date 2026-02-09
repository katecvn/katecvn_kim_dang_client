import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getPermission = createAsyncThunk(
  'permission',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/permission/tree')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  permissions: [],
  loading: false,
  error: null,
}

export const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPermission.pending, (state) => {
        state.loading = true
      })
      .addCase(getPermission.fulfilled, (state, action) => {
        state.loading = false
        state.permissions = action.payload
      })
      .addCase(getPermission.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default permissionSlice.reducer