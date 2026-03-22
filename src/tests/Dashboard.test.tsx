import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from 'pages/Dashboard'
import type { Task } from 'types/index'

jest.mock('hooks/useTasks', () => ({
  useTasks: jest.fn(),
}))

import { useTasks } from 'hooks/useTasks'
const mockUseTasks = useTasks as jest.Mock

const sampleTask: Task = {
  id: '1',
  title: 'Fix the bug',
  description: 'Critical issue in prod',
  status: 'in-progress',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const defaultMock = {
  tasks: [],
  loading: false,
  error: null,
  submitting: false,
  loadTasks: jest.fn(),
  addTask: jest.fn().mockResolvedValue({}),
  editTask: jest.fn().mockResolvedValue({}),
  removeTask: jest.fn().mockResolvedValue({}),
  clearError: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseTasks.mockReturnValue({ ...defaultMock })
})

describe('Dashboard', () => {
  it('renders page heading', () => {
    render(<Dashboard />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('renders New Task button', () => {
    render(<Dashboard />)
    expect(screen.getByRole('button', { name: /New Task/i })).toBeInTheDocument()
  })

  it('calls loadTasks on mount', () => {
    render(<Dashboard />)
    expect(defaultMock.loadTasks).toHaveBeenCalledTimes(1)
  })

  it('shows skeleton loaders when loading', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, loading: true })
    render(<Dashboard />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no tasks', () => {
    render(<Dashboard />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('shows empty state create button', () => {
    render(<Dashboard />)
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('shows task cards when tasks exist', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    expect(screen.getByText('Fix the bug')).toBeInTheDocument()
  })

  it('shows task count in header', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    expect(screen.getByText('1 task total')).toBeInTheDocument()
  })

  it('shows plural task count', () => {
    const task2 = { ...sampleTask, id: '2', title: 'Second task' }
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask, task2] })
    render(<Dashboard />)
    expect(screen.getByText('2 tasks total')).toBeInTheDocument()
  })

  it('shows error banner when error exists', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, error: 'Failed to load tasks' })
    render(<Dashboard />)
    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument()
  })

  it('dismisses error when X button clicked', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, error: 'Failed to load tasks' })
    render(<Dashboard />)
    fireEvent.click(screen.getByLabelText('Dismiss error'))
    expect(defaultMock.clearError).toHaveBeenCalledTimes(1)
  })

  it('opens create task modal when New Task is clicked', () => {
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: /New Task/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('opens create task modal from empty state action', () => {
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes create task modal when Cancel is clicked', () => {
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: /New Task/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens edit task modal from TaskCard', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task: Fix the bug' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Edit Task')).toBeInTheDocument()
  })

  it('submits create task form', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: /New Task/i }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText('Title'), 'New Feature')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Task' }))
    await waitFor(() => {
      expect(defaultMock.addTask).toHaveBeenCalledTimes(1)
    })
  })

  it('submits edit task form', async () => {
    const user = userEvent.setup()
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task: Fix the bug' }))
    const dialog = screen.getByRole('dialog')
    const titleInput = within(dialog).getByDisplayValue('Fix the bug')
    await user.clear(titleInput)
    await user.type(titleInput, 'Fixed the bug')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }))
    await waitFor(() => {
      expect(defaultMock.editTask).toHaveBeenCalledTimes(1)
    })
  })

  it('opens delete confirmation modal', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete task: Fix the bug' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Delete Task' })).toBeInTheDocument()
  })

  it('confirms task deletion', async () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete task: Fix the bug' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Task' }))
    await waitFor(() => {
      expect(defaultMock.removeTask).toHaveBeenCalledWith('1')
    })
  })

  it('cancels task deletion', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete task: Fix the bug' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(defaultMock.removeTask).not.toHaveBeenCalled()
  })

  it('filters tasks by status', () => {
    const doneTask = { ...sampleTask, id: '2', title: 'Done task', status: 'done' as const }
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask, doneTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: /^Done/ }))
    expect(screen.getByText('Done task')).toBeInTheDocument()
    expect(screen.queryByText('Fix the bug')).not.toBeInTheDocument()
  })

  it('shows empty state when filter yields no results', () => {
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: /^Done/ }))
    expect(screen.getByText('No matching tasks')).toBeInTheDocument()
  })

  it('searches tasks by title', async () => {
    const user = userEvent.setup()
    const task2 = { ...sampleTask, id: '2', title: 'Unrelated work', status: 'todo' as const }
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask, task2] })
    render(<Dashboard />)
    await user.type(screen.getByPlaceholderText('Search tasks...'), 'bug')
    await waitFor(() => {
      expect(screen.getByText('Fix the bug')).toBeInTheDocument()
      expect(screen.queryByText('Unrelated work')).not.toBeInTheDocument()
    })
  })

  it('searches tasks by description', async () => {
    const user = userEvent.setup()
    const task2 = { ...sampleTask, id: '2', title: 'Cleanup', description: 'Remove unused code', status: 'todo' as const }
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask, task2] })
    render(<Dashboard />)
    await user.type(screen.getByPlaceholderText('Search tasks...'), 'unused')
    await waitFor(() => {
      expect(screen.getByText('Cleanup')).toBeInTheDocument()
      expect(screen.queryByText('Fix the bug')).not.toBeInTheDocument()
    })
  })

  it('shows empty state message when searching with no match', async () => {
    const user = userEvent.setup()
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask] })
    render(<Dashboard />)
    await user.type(screen.getByPlaceholderText('Search tasks...'), 'nonexistent')
    await waitFor(() => {
      expect(screen.getByText('No matching tasks')).toBeInTheDocument()
    })
  })

  it('shows filter counts for all statuses', () => {
    const todoTask = { ...sampleTask, id: '2', title: 'Todo task', status: 'todo' as const }
    const doneTask = { ...sampleTask, id: '3', title: 'Done task', status: 'done' as const }
    mockUseTasks.mockReturnValue({ ...defaultMock, tasks: [sampleTask, todoTask, doneTask] })
    render(<Dashboard />)
    expect(screen.getByRole('button', { name: /^All/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^In Progress/ })).toBeInTheDocument()
  })
})
