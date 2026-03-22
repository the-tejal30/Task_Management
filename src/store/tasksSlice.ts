import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TasksState, Task } from 'types/index'
import { fetchTasks, createTask, updateTask, deleteTask } from 'store/tasksThunks'

export { fetchTasks, createTask, updateTask, deleteTask } from 'store/tasksThunks'

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  submitting: false,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createTask.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.submitting = false
        state.tasks = [...state.tasks, action.payload]
      })
      .addCase(createTask.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(updateTask.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.submitting = false
        state.tasks = state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t))
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(deleteTask.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.submitting = false
        state.tasks = state.tasks.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { clearTasksError } = tasksSlice.actions
export default tasksSlice.reducer
