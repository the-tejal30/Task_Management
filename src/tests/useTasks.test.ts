import { createElement } from 'react'
import type { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'store/authSlice'
import tasksReducer from 'store/tasksSlice'
import { useTasks } from 'hooks/useTasks'
import { fetchTasks, createTask, updateTask, deleteTask } from 'store/tasksSlice'
import type { Task } from 'types/index'

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

const sampleTask: Task = {
  id: '1',
  title: 'Test task',
  description: 'A description',
  status: 'todo',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
    preloadedState: {
      auth: { user: null, token: null, isAuthenticated: false, loading: false, error: null },
      tasks: { tasks: [], loading: false, error: null, submitting: false },
    },
  })
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store, children })
}

describe('useTasks', () => {
  const apiModule = jest.requireMock('services/api') as {
    default: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock }
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns initial tasks state', () => {
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    expect(result.current.tasks).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.submitting).toBe(false)
  })

  it('loadTasks dispatches fetchTasks and updates store', async () => {
    apiModule.default.get.mockResolvedValue({ data: [sampleTask] })
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    await act(async () => {
      result.current.loadTasks()
      await new Promise(r => setTimeout(r, 10))
    })
    expect(store.getState().tasks.tasks).toHaveLength(1)
    expect(result.current.tasks).toHaveLength(1)
  })

  it('addTask dispatches createTask and updates store', async () => {
    const newTask = { ...sampleTask, id: '2' }
    apiModule.default.post.mockResolvedValue({ data: newTask })
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    await act(async () => {
      await result.current.addTask({ title: 'New', description: '', status: 'todo' })
    })
    expect(store.getState().tasks.tasks).toHaveLength(1)
    expect(result.current.tasks).toHaveLength(1)
  })

  it('editTask dispatches updateTask and updates store', async () => {
    const updated = { ...sampleTask, title: 'Updated' }
    apiModule.default.put.mockResolvedValue({ data: updated })
    const store = makeStore()
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: [sampleTask] })
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    await act(async () => {
      await result.current.editTask({ id: '1', title: 'Updated', description: '', status: 'todo' })
    })
    expect(store.getState().tasks.tasks[0]?.title).toBe('Updated')
    expect(result.current.tasks[0]?.title).toBe('Updated')
  })

  it('removeTask dispatches deleteTask and updates store', async () => {
    apiModule.default.delete.mockResolvedValue({ data: {} })
    const store = makeStore()
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: [sampleTask] })
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    await act(async () => {
      await result.current.removeTask('1')
    })
    expect(store.getState().tasks.tasks).toHaveLength(0)
    expect(result.current.tasks).toHaveLength(0)
  })

  it('clearError clears the tasks error', () => {
    const store = makeStore()
    store.dispatch({ type: 'tasks/fetchAll/rejected', payload: 'Network error' })
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    expect(result.current.error).toBe('Network error')
    act(() => {
      result.current.clearError()
    })
    expect(result.current.error).toBeNull()
  })

  it('exposes loading and submitting state', async () => {
    apiModule.default.get.mockResolvedValue({ data: [] })
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    expect(result.current.loading).toBe(false)
    expect(result.current.submitting).toBe(false)
    act(() => {
      store.dispatch({ type: createTask.pending.type })
    })
    expect(result.current.submitting).toBe(true)
  })

  it('loadTasks sets loading state while fetching', () => {
    apiModule.default.get.mockReturnValue(new Promise(() => {}))
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    act(() => {
      result.current.loadTasks()
    })
    expect(result.current.loading).toBe(true)
  })

  it('addTask returns the dispatch result', async () => {
    const newTask = { ...sampleTask, id: '3' }
    apiModule.default.post.mockResolvedValue({ data: newTask })
    const store = makeStore()
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    let returnValue: unknown
    await act(async () => {
      returnValue = await result.current.addTask({ title: 'Test', description: '', status: 'todo' })
    })
    expect(returnValue).toBeDefined()
  })

  it('editTask returns the dispatch result', async () => {
    const updated = { ...sampleTask, title: 'Updated' }
    apiModule.default.put.mockResolvedValue({ data: updated })
    const store = makeStore()
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: [sampleTask] })
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    let returnValue: unknown
    await act(async () => {
      returnValue = await result.current.editTask({ id: '1', title: 'Updated', description: '', status: 'todo' })
    })
    expect(returnValue).toBeDefined()
  })

  it('removeTask returns the dispatch result', async () => {
    apiModule.default.delete.mockResolvedValue({})
    const store = makeStore()
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: [sampleTask] })
    const { result } = renderHook(() => useTasks(), { wrapper: makeWrapper(store) })
    let returnValue: unknown
    await act(async () => {
      returnValue = await result.current.removeTask('1')
    })
    expect(returnValue).toBeDefined()
  })
})
