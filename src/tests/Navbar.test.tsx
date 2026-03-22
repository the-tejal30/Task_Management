import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import Navbar from 'components/Navbar'

jest.mock('utils/storage', () => ({
  storage: {
    getToken: jest.fn(() => 'fake-token'),
    setToken: jest.fn(),
    getUser: jest.fn(() => ({ username: 'test' })),
    setUser: jest.fn(),
    clearAll: jest.fn(),
    getTheme: jest.fn(() => 'light'),
    setTheme: jest.fn(),
    removeToken: jest.fn(),
    removeUser: jest.fn(),
  },
}))

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { username: 'testuser', token: 'tok' },
        token: 'tok',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  })
}

describe('Navbar', () => {
  it('renders app name', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={jest.fn()} />
      </Provider>
    )
    expect(screen.getByText('TaskFlow')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={jest.fn()} />
      </Provider>
    )
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('calls onToggleDark when dark mode button is clicked', () => {
    const onToggleDark = jest.fn()
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={onToggleDark} />
      </Provider>
    )
    fireEvent.click(screen.getByLabelText('Switch to dark mode'))
    expect(onToggleDark).toHaveBeenCalledTimes(1)
  })

  it('shows sun icon when in dark mode', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={true} onToggleDark={jest.fn()} />
      </Provider>
    )
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('renders username', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={jest.fn()} />
      </Provider>
    )
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('renders without crashing when user is null', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      },
    })
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={jest.fn()} />
      </Provider>
    )
    expect(screen.getByText('TaskFlow')).toBeInTheDocument()
  })

  it('dispatches logout when logout button is clicked', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Navbar darkMode={false} onToggleDark={jest.fn()} />
      </Provider>
    )
    fireEvent.click(screen.getByText('Logout'))
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })
})
