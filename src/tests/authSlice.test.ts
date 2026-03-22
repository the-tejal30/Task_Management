import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout, clearError, loginThunk } from 'store/authSlice'
import type { AuthState } from 'types/index'

jest.mock('utils/storage', () => ({
  storage: {
    getToken: jest.fn(() => null),
    setToken: jest.fn(),
    removeToken: jest.fn(),
    getUser: jest.fn(() => null),
    setUser: jest.fn(),
    removeUser: jest.fn(),
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn(),
    clearAll: jest.fn(),
  },
}))

jest.mock('services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}))

function makeStore(preloadedState?: { auth: Partial<AuthState> }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedState as Parameters<typeof configureStore>[0]['preloadedState'],
  })
}

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns initial unauthenticated state', () => {
    const store = makeStore()
    const state = store.getState().auth as AuthState
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('logout clears auth state', async () => {
    const { storage } = await import('utils/storage')
    const store = makeStore({
      auth: {
        user: { username: 'test', token: 'tok' },
        token: 'tok',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    })
    store.dispatch(logout())
    const state = store.getState().auth as AuthState
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(storage.clearAll).toHaveBeenCalledTimes(1)
  })

  it('clearError clears the error field', () => {
    const store = makeStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Invalid credentials',
      },
    })
    store.dispatch(clearError())
    expect((store.getState().auth as AuthState).error).toBeNull()
  })

  it('loginThunk.pending sets loading=true and error=null', () => {
    const store = makeStore()
    store.dispatch({ type: loginThunk.pending.type })
    const state = store.getState().auth as AuthState
    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('loginThunk.fulfilled sets authenticated state', async () => {
    const { storage } = await import('utils/storage')
    const store = makeStore()
    const payload = { token: 'abc123', user: { username: 'test' } }
    store.dispatch({ type: loginThunk.fulfilled.type, payload })
    const state = store.getState().auth as AuthState
    expect(state.loading).toBe(false)
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('abc123')
    expect(state.user?.username).toBe('test')
    expect(storage.setToken).toHaveBeenCalledWith('abc123')
    expect(storage.setUser).toHaveBeenCalledWith({ username: 'test' })
  })

  it('loginThunk.rejected sets error', () => {
    const store = makeStore()
    store.dispatch({ type: loginThunk.rejected.type, payload: 'Invalid credentials' })
    const state = store.getState().auth as AuthState
    expect(state.loading).toBe(false)
    expect(state.error).toBe('Invalid credentials')
    expect(state.isAuthenticated).toBe(false)
  })
})

describe('authSlice async loginThunk', () => {
  const apiModule = jest.requireMock('services/api') as { default: { post: jest.Mock } }

  function makeStore() {
    return configureStore({ reducer: { auth: authReducer } })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loginThunk - success authenticates user', async () => {
    apiModule.default.post.mockResolvedValueOnce({
      data: { token: 'jwt-token', user: { username: 'test' } },
    })
    const store = makeStore()
    await store.dispatch(loginThunk({ username: 'test', password: 'test123' }))
    const state = store.getState().auth as AuthState
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe('jwt-token')
    expect(state.user?.username).toBe('test')
  })

  it('loginThunk - error sets error from response', async () => {
    apiModule.default.post.mockRejectedValue({ response: { data: { message: 'Wrong password' } } })
    const store = makeStore()
    await store.dispatch(loginThunk({ username: 'test', password: 'wrong' }))
    const state = store.getState().auth as AuthState
    expect(state.error).toBe('Wrong password')
    expect(state.isAuthenticated).toBe(false)
  })

  it('loginThunk - error falls back to default message', async () => {
    apiModule.default.post.mockRejectedValue(new Error('Network'))
    const store = makeStore()
    await store.dispatch(loginThunk({ username: 'test', password: 'test' }))
    const state = store.getState().auth as AuthState
    expect(state.error).toBe('Login failed')
  })
})
