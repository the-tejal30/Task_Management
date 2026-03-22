import { configureStore } from '@reduxjs/toolkit'
import tasksReducer, { clearTasksError, fetchTasks, createTask, updateTask, deleteTask } from 'store/tasksSlice'
import type { TasksState, Task } from 'types/index'

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
  description: 'A task for testing',
  status: 'todo',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function makeStore(preloadedState?: { tasks: Partial<TasksState> }) {
  return configureStore({
    reducer: { tasks: tasksReducer },
    preloadedState: preloadedState as Parameters<typeof configureStore>[0]['preloadedState'],
  })
}

describe('tasksSlice', () => {
  it('has correct initial state', () => {
    const store = makeStore()
    const state = store.getState().tasks
    expect(state.tasks).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.submitting).toBe(false)
  })

  it('clearTasksError clears error', () => {
    const store = makeStore({ tasks: { tasks: [], loading: false, error: 'oops', submitting: false } })
    store.dispatch(clearTasksError())
    expect(store.getState().tasks.error).toBeNull()
  })

  it('fetchTasks.pending sets loading=true', () => {
    const store = makeStore()
    store.dispatch({ type: fetchTasks.pending.type })
    expect(store.getState().tasks.loading).toBe(true)
    expect(store.getState().tasks.error).toBeNull()
  })

  it('fetchTasks.fulfilled populates tasks', () => {
    const store = makeStore()
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: [sampleTask] })
    const state = store.getState().tasks
    expect(state.loading).toBe(false)
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]?.title).toBe('Test task')
  })

  it('fetchTasks.rejected sets error', () => {
    const store = makeStore()
    store.dispatch({ type: fetchTasks.rejected.type, payload: 'Network error' })
    const state = store.getState().tasks
    expect(state.loading).toBe(false)
    expect(state.error).toBe('Network error')
  })

  it('createTask.pending sets submitting=true', () => {
    const store = makeStore()
    store.dispatch({ type: createTask.pending.type })
    expect(store.getState().tasks.submitting).toBe(true)
  })

  it('createTask.fulfilled appends new task', () => {
    const store = makeStore({ tasks: { tasks: [sampleTask], loading: false, error: null, submitting: false } })
    const newTask: Task = { ...sampleTask, id: '2', title: 'Another task' }
    store.dispatch({ type: createTask.fulfilled.type, payload: newTask })
    const state = store.getState().tasks
    expect(state.tasks).toHaveLength(2)
    expect(state.tasks[1]?.id).toBe('2')
    expect(state.submitting).toBe(false)
  })

  it('updateTask.fulfilled replaces the updated task', () => {
    const store = makeStore({ tasks: { tasks: [sampleTask], loading: false, error: null, submitting: false } })
    const updated: Task = { ...sampleTask, title: 'Updated title', status: 'done' }
    store.dispatch({ type: updateTask.fulfilled.type, payload: updated })
    const state = store.getState().tasks
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]?.title).toBe('Updated title')
    expect(state.tasks[0]?.status).toBe('done')
  })

  it('updateTask.fulfilled keeps other tasks unchanged', () => {
    const task2: Task = { ...sampleTask, id: '2', title: 'Other task' }
    const store = makeStore({ tasks: { tasks: [sampleTask, task2], loading: false, error: null, submitting: false } })
    const updated: Task = { ...sampleTask, title: 'Updated title' }
    store.dispatch({ type: updateTask.fulfilled.type, payload: updated })
    const state = store.getState().tasks
    expect(state.tasks).toHaveLength(2)
    expect(state.tasks[1]?.title).toBe('Other task')
  })

  it('deleteTask.fulfilled removes task by id', () => {
    const task2: Task = { ...sampleTask, id: '2', title: 'Second task' }
    const store = makeStore({ tasks: { tasks: [sampleTask, task2], loading: false, error: null, submitting: false } })
    store.dispatch({ type: deleteTask.fulfilled.type, payload: '1' })
    const state = store.getState().tasks
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0]?.id).toBe('2')
  })

  it('deleteTask.rejected sets error', () => {
    const store = makeStore()
    store.dispatch({ type: deleteTask.rejected.type, payload: 'Delete failed' })
    expect(store.getState().tasks.error).toBe('Delete failed')
    expect(store.getState().tasks.submitting).toBe(false)
  })

  it('createTask.rejected sets error', () => {
    const store = makeStore()
    store.dispatch({ type: createTask.rejected.type, payload: 'Create failed' })
    expect(store.getState().tasks.error).toBe('Create failed')
    expect(store.getState().tasks.submitting).toBe(false)
  })

  it('updateTask.pending sets submitting=true', () => {
    const store = makeStore()
    store.dispatch({ type: updateTask.pending.type })
    expect(store.getState().tasks.submitting).toBe(true)
    expect(store.getState().tasks.error).toBeNull()
  })

  it('updateTask.rejected sets error', () => {
    const store = makeStore()
    store.dispatch({ type: updateTask.rejected.type, payload: 'Update failed' })
    expect(store.getState().tasks.error).toBe('Update failed')
    expect(store.getState().tasks.submitting).toBe(false)
  })

  it('deleteTask.pending sets submitting=true', () => {
    const store = makeStore()
    store.dispatch({ type: deleteTask.pending.type })
    expect(store.getState().tasks.submitting).toBe(true)
    expect(store.getState().tasks.error).toBeNull()
  })
})

describe('tasksSlice async thunks', () => {
  const apiModule = jest.requireMock('services/api') as {
    default: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock }
  }

  function makeStore(preloadedTasks?: Partial<TasksState>) {
    return configureStore({
      reducer: { tasks: tasksReducer },
      preloadedState: { tasks: { tasks: [], loading: false, error: null, submitting: false, ...preloadedTasks } as TasksState },
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetchTasks - success sets tasks', async () => {
    apiModule.default.get.mockResolvedValueOnce({ data: [sampleTask] })
    const store = makeStore()
    await store.dispatch(fetchTasks())
    expect(store.getState().tasks.tasks).toHaveLength(1)
    expect(store.getState().tasks.loading).toBe(false)
  })

  it('fetchTasks - error sets error message from response', async () => {
    apiModule.default.get.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })
    const store = makeStore()
    await store.dispatch(fetchTasks())
    expect(store.getState().tasks.error).toBe('Server error')
  })

  it('fetchTasks - error falls back to default message', async () => {
    apiModule.default.get.mockRejectedValueOnce(new Error('Network error'))
    const store = makeStore()
    await store.dispatch(fetchTasks())
    expect(store.getState().tasks.error).toBe('Failed to fetch tasks')
  })

  it('createTask - success adds task', async () => {
    const newTask = { ...sampleTask, id: '2' }
    apiModule.default.post.mockResolvedValueOnce({ data: newTask })
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(createTask({ title: 'New', description: '', status: 'todo' }))
    expect(store.getState().tasks.tasks).toHaveLength(2)
    expect(store.getState().tasks.submitting).toBe(false)
  })

  it('createTask - error sets error', async () => {
    apiModule.default.post.mockRejectedValueOnce({ response: { data: { message: 'Create error' } } })
    const store = makeStore()
    await store.dispatch(createTask({ title: 'New', description: '', status: 'todo' }))
    expect(store.getState().tasks.error).toBe('Create error')
  })

  it('createTask - error falls back to default message', async () => {
    apiModule.default.post.mockRejectedValueOnce(new Error('Network'))
    const store = makeStore()
    await store.dispatch(createTask({ title: 'New', description: '', status: 'todo' }))
    expect(store.getState().tasks.error).toBe('Failed to create task')
  })

  it('updateTask - success updates task', async () => {
    const updated = { ...sampleTask, title: 'Updated' }
    apiModule.default.put.mockResolvedValueOnce({ data: updated })
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(updateTask({ id: '1', title: 'Updated', description: '', status: 'todo' }))
    expect(store.getState().tasks.tasks[0]?.title).toBe('Updated')
  })

  it('updateTask - error sets error', async () => {
    apiModule.default.put.mockRejectedValueOnce({ response: { data: { message: 'Update error' } } })
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(updateTask({ id: '1', title: 'X', description: '', status: 'todo' }))
    expect(store.getState().tasks.error).toBe('Update error')
  })

  it('updateTask - error falls back to default message', async () => {
    apiModule.default.put.mockRejectedValueOnce(new Error('Network'))
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(updateTask({ id: '1', title: 'X', description: '', status: 'todo' }))
    expect(store.getState().tasks.error).toBe('Failed to update task')
  })

  it('deleteTask - success removes task', async () => {
    apiModule.default.delete.mockResolvedValueOnce({ data: {} })
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(deleteTask('1'))
    expect(store.getState().tasks.tasks).toHaveLength(0)
  })

  it('deleteTask - error sets error', async () => {
    apiModule.default.delete.mockRejectedValueOnce({ response: { data: { message: 'Delete error' } } })
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(deleteTask('1'))
    expect(store.getState().tasks.error).toBe('Delete error')
  })

  it('deleteTask - error falls back to default message', async () => {
    apiModule.default.delete.mockRejectedValueOnce(new Error('Network'))
    const store = makeStore({ tasks: [sampleTask] })
    await store.dispatch(deleteTask('1'))
    expect(store.getState().tasks.error).toBe('Failed to delete task')
  })
})
