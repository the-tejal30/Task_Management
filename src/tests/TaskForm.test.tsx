import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from 'components/TaskForm'
import type { Task } from 'types/index'

const mockTask: Task = {
  id: '1',
  title: 'Existing task',
  description: 'Existing description',
  status: 'todo',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('TaskForm', () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined)
  const onCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('shows "Create Task" button for new task', () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('shows "Save Changes" button when editing', () => {
    render(<TaskForm initialTask={mockTask} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('pre-fills form when editing task', () => {
    render(<TaskForm initialTask={mockTask} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    expect(screen.getByDisplayValue('Existing task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows validation error when title is empty on submit', async () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup()
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    await user.type(screen.getByLabelText('Title'), 'New Task')
    await user.type(screen.getByLabelText('Description'), 'Some description')
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Task',
      description: 'Some description',
      status: 'todo',
    }))
  })

  it('changes status via dropdown', async () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'done' } })
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Title'), 'Status test')
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 'done' }))
    })
  })

  it('shows description error when max length exceeded', async () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={false} />)
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'a'.repeat(501) } })
    fireEvent.blur(screen.getByLabelText('Description'))
    await waitFor(() => {
      expect(screen.getByText('Description cannot exceed 500 characters')).toBeInTheDocument()
    })
  })

  it('shows spinner and disables buttons when submitting', () => {
    render(<TaskForm initialTask={null} onSubmit={onSubmit} onCancel={onCancel} submitting={true} />)
    const submitBtn = screen.getByRole('button', { name: /Create Task/i })
    expect(submitBtn).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
