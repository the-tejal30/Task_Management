import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, LoginResponse } from 'types/index'
import { storage } from 'utils/storage'
import { loginThunk } from 'store/authThunks'

export { loginThunk } from 'store/authThunks'

const storedUser = storage.getUser()
const storedToken = storage.getToken()

const initialState: AuthState = {
  user: storedUser && storedToken ? { username: storedUser.username, token: storedToken } : null,
  token: storedToken,
  isAuthenticated: !!(storedUser && storedToken),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      storage.clearAll()
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false
        state.token = action.payload.token
        state.user = { username: action.payload.user.username, token: action.payload.token }
        state.isAuthenticated = true
        storage.setToken(action.payload.token)
        storage.setUser(action.payload.user)
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
