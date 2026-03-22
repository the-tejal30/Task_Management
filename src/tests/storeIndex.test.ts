import { store } from 'store/index'
import type { AppRootState } from 'store/index'

jest.mock('utils/storage', () => ({
  storage: {
    getToken: jest.fn(() => null),
    getUser: jest.fn(() => null),
    setToken: jest.fn(),
    setUser: jest.fn(),
    removeToken: jest.fn(),
    removeUser: jest.fn(),
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn(),
    clearAll: jest.fn(),
  },
}))

jest.mock('services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}))

describe('store', () => {
  it('has auth slice in state', () => {
    const state = store.getState() as AppRootState
    expect(state).toHaveProperty('auth')
  })

  it('has tasks slice in state', () => {
    const state = store.getState() as AppRootState
    expect(state).toHaveProperty('tasks')
  })

  it('auth initial state is unauthenticated', () => {
    const state = store.getState() as AppRootState
    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.user).toBeNull()
  })

  it('tasks initial state has empty array', () => {
    const state = store.getState() as AppRootState
    expect(state.tasks.tasks).toEqual([])
    expect(state.tasks.loading).toBe(false)
  })

  it('dispatch is a function', () => {
    expect(typeof store.dispatch).toBe('function')
  })
})
