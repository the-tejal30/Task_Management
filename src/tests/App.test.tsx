import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import tasksReducer from 'store/tasksSlice'
import App from '../App'

const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}))

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

jest.mock('hooks/useTasks', () => ({
  useTasks: jest.fn(() => ({
    tasks: [],
    loading: false,
    error: null,
    submitting: false,
    loadTasks: jest.fn(),
    addTask: jest.fn(),
    editTask: jest.fn(),
    removeTask: jest.fn(),
    clearError: jest.fn(),
  })),
}))

function makeStore(isAuthenticated = false) {
  return configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
    preloadedState: {
      auth: {
        user: isAuthenticated ? { username: 'testuser', token: 'tok' } : null,
        token: isAuthenticated ? 'tok' : null,
        isAuthenticated,
        loading: false,
        error: null,
      },
      tasks: { tasks: [], loading: false, error: null, submitting: false },
    },
  })
}

beforeEach(() => {
  mockReplace.mockClear()
  document.documentElement.classList.remove('dark')
})

describe('App', () => {
  it('redirects to login for unauthenticated users', async () => {
    const store = makeStore(false)
    render(<Provider store={store}><App /></Provider>)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('shows dashboard for authenticated users', () => {
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    expect(screen.getByText('TaskFlow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New Task/i })).toBeInTheDocument()
  })

  it('dark mode toggle button is present on dashboard', () => {
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()
  })

  it('toggles dark mode when button is clicked', () => {
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    fireEvent.click(screen.getByLabelText('Switch to dark mode'))
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('adds dark class to html when toggled', () => {
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    fireEvent.click(screen.getByLabelText('Switch to dark mode'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class when toggled back to light', () => {
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    fireEvent.click(screen.getByLabelText('Switch to dark mode'))
    fireEvent.click(screen.getByLabelText('Switch to light mode'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('initializes with dark mode from storage', () => {
    const { storage } = jest.requireMock('utils/storage')
    storage.getTheme.mockReturnValueOnce('dark')
    const store = makeStore(true)
    render(<Provider store={store}><App /></Provider>)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
