import { createElement } from 'react'
import type { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import tasksReducer from 'store/tasksSlice'
import { useAuth } from 'hooks/useAuth'
import { loginThunk } from 'store/authSlice'
import type { AuthState } from 'types/index'

jest.mock('utils/storage', () => ({
  storage: {
    getToken: jest.fn(() => null),
    setToken: jest.fn(),
    getUser: jest.fn(() => null),
    setUser: jest.fn(),
    clearAll: jest.fn(),
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn(),
    removeToken: jest.fn(),
    removeUser: jest.fn(),
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

function makeStore(preloadedAuth?: Partial<AuthState>) {
  return configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...preloadedAuth,
      },
      tasks: { tasks: [], loading: false, error: null, submitting: false },
    },
  })
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children })
}

describe('useAuth', () => {
  const apiModule = jest.requireMock('services/api') as { default: { post: jest.Mock } }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns unauthenticated state initially', () => {
    const store = makeStore()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns authenticated state from store', () => {
    const store = makeStore({
      user: { username: 'alice', token: 'tok123' },
      token: 'tok123',
      isAuthenticated: true,
    })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.username).toBe('alice')
  })

  it('login calls dispatch with loginThunk and resolves', async () => {
    apiModule.default.post.mockResolvedValue({
      data: { token: 'new-jwt', user: { username: 'test' } },
    })
    const store = makeStore()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    let returnValue: unknown
    await act(async () => {
      returnValue = await result.current.login({ username: 'test', password: 'test123' })
    })
    expect(returnValue).toBeDefined()
    expect(store.getState().auth.isAuthenticated).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('login returns the action result', async () => {
    apiModule.default.post.mockResolvedValue({
      data: { token: 'jwt-abc', user: { username: 'test' } },
    })
    const store = makeStore()
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    await act(async () => {
      const res = await result.current.login({ username: 'test', password: 'test123' })
      expect(res.type).toBe(loginThunk.fulfilled.type)
    })
  })

  it('logout dispatches logout action and clears state', () => {
    const store = makeStore({
      user: { username: 'test', token: 'tok' },
      token: 'tok',
      isAuthenticated: true,
    })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    act(() => {
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('clearError dispatches clearError action', () => {
    const store = makeStore({ error: 'Some error', isAuthenticated: false })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    act(() => {
      result.current.clearError()
    })
    expect(result.current.error).toBeNull()
  })

  it('returns loading and error state', () => {
    const store = makeStore({ loading: true, error: 'Auth error' })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe('Auth error')
  })

  it('returns token from store', () => {
    const store = makeStore({
      user: { username: 'test', token: 'my-token' },
      token: 'my-token',
      isAuthenticated: true,
    })
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper(store) })
    expect(result.current.token).toBe('my-token')
  })
})
