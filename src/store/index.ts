import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import tasksReducer from 'store/tasksSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type AppRootState = ReturnType<typeof store.getState>
