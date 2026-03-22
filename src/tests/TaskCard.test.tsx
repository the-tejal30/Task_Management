import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from 'components/TaskCard'
import type { Task } from 'types/index'

const mockTask: Task = {
  id: '1',
  title: 'Fix login bug',
  description: 'Users cannot login with special characters in password.',
  status: 'in-progress',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-16T12:00:00.000Z',
}

describe('TaskCard', () => {
  const onEdit = jest.fn()
  const onDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task title', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders task description', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Users cannot login with special characters in password.')).toBeInTheDocument()
  })

  it('renders badge with correct status', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('calls onEdit with task when Edit is clicked', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Edit task: Fix login bug'))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete with task when Delete is clicked', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task: Fix login bug'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(mockTask)
  })

  it('renders updated date', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })
})
