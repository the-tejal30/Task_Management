import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import Login from 'pages/Login'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
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
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}))

function makeStore(preloadedAuth?: { error?: string | null }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedAuth ? {
      auth: { user: null, token: null, isAuthenticated: false, loading: false, error: null, ...preloadedAuth },
    } : undefined,
  })
}

describe('Login page', () => {
  it('renders username and password fields', () => {
    const store = makeStore()
    render(<Provider store={store}><Login /></Provider>)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    const store = makeStore()
    render(<Provider store={store}><Login /></Provider>)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const store = makeStore()
    render(<Provider store={store}><Login /></Provider>)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
    })
  })

  it('shows error alert when auth error exists', () => {
    const store = makeStore({ error: 'Invalid credentials' })
    render(<Provider store={store}><Login /></Provider>)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('renders demo credentials hint', () => {
    const store = makeStore()
    render(<Provider store={store}><Login /></Provider>)
    expect(screen.getByText(/test \/ test123/)).toBeInTheDocument()
  })

  it('allows submitting valid credentials', async () => {
    const store = makeStore()
    const user = userEvent.setup()

    const apiModule = jest.requireMock('services/api') as { default: { post: jest.Mock } }
    apiModule.default.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt', user: { username: 'test' } },
    })

    render(<Provider store={store}><Login /></Provider>)

    await user.type(screen.getByLabelText('Username'), 'test')
    await user.type(screen.getByLabelText('Password'), 'test123')

    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test123')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).not.toBeDisabled()
  })

  it('calls login on valid form submit', async () => {
    const store = makeStore()
    const user = userEvent.setup()
    const apiModule = jest.requireMock('services/api') as { default: { post: jest.Mock } }
    apiModule.default.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt', user: { username: 'test' } },
    })
    render(<Provider store={store}><Login /></Provider>)
    await user.type(screen.getByLabelText('Username'), 'test')
    await user.type(screen.getByLabelText('Password'), 'test123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => {
      expect(apiModule.default.post).toHaveBeenCalledWith('/login', { username: 'test', password: 'test123' })
    })
  })
})
