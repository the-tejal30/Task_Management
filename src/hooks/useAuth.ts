import { useSelector, useDispatch } from 'react-redux'
import type { AppRootState, AppDispatch } from 'store/index'
import { loginThunk, logout, clearError } from 'store/authSlice'
import type { LoginPayload } from 'types/index'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: AppRootState) => state.auth)

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    login: (credentials: LoginPayload) => dispatch(loginThunk(credentials)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  }
}
