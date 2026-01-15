import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// GET /crm/tasks
export const getTasks = createAsyncThunk(
  'task/list',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/crm/tasks', { params })
      const { data } = response.data // { data: [...], pagination: {...} }
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// GET /crm/tasks/:id
export const getTaskById = createAsyncThunk(
  'task/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/crm/tasks/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// POST /crm/tasks
export const createTask = createAsyncThunk(
  'task/create',
  async ({ data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/crm/tasks', data)
      await dispatch(getTasks(params || {})).unwrap()
      toast.success('Thêm task thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// PUT /crm/tasks/:id
export const updateTask = createAsyncThunk(
  'task/update',
  async ({ id, data, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/crm/tasks/${id}`, data)
      await dispatch(getTasks(params || {})).unwrap()
      toast.success('Cập nhật task thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// PATCH /crm/tasks/:id/status
export const updateTaskStatus = createAsyncThunk(
  'task/updateStatus',
  async ({ id, status, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.patch(`/crm/tasks/${id}/status`, { status })
      await dispatch(getTasks(params || {})).unwrap()
      toast.success('Cập nhật trạng thái task thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// DELETE /crm/tasks/:id
export const deleteTask = createAsyncThunk(
  'task/delete',
  async ({ id, params }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/crm/tasks/${id}`)
      await dispatch(getTasks(params || {})).unwrap()
      toast.success('Xóa task thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  tasks: [],
  task: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  loadingDetail: false,
  error: null,
}

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== List =====
      .addCase(getTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload?.data || []
        state.pagination = action.payload?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Detail =====
      .addCase(getTaskById.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.task = action.payload || null
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loadingDetail = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Create =====
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Update =====
      .addCase(updateTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Update status =====
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTaskStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })

      // ===== Delete =====
      .addCase(deleteTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false
        const errorMessage =
          action.payload?.message || action.payload || 'Lỗi không xác định'
        state.error = errorMessage
        toast.error(errorMessage)
      })
  },
})

export default taskSlice.reducer
