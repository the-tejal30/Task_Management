import { createAsyncThunk } from '@reduxjs/toolkit'
import type { LoginPayload, LoginResponse } from 'types/index'
import api from 'services/api'
import { AUTH_ENDPOINTS } from 'services/endpoints'

type ApiError = { response?: { data?: { message?: string } } }

export const loginThunk = createAsyncThunk<LoginResponse, LoginPayload>(
  'auth/login',
  (credentials, { rejectWithValue }) =>
    api.post<LoginResponse>(AUTH_ENDPOINTS.login, credentials)
      .then(res => res.data)
      .catch((err: ApiError) => rejectWithValue(err.response?.data?.message ?? 'Login failed'))
)
