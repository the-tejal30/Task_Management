import { render, screen, fireEvent } from '@testing-library/react'
import EmptyState from 'components/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No tasks" description="Get started by creating your first task." />)
    expect(screen.getByText('No tasks')).toBeInTheDocument()
    expect(screen.getByText('Get started by creating your first task.')).toBeInTheDocument()
  })

  it('renders action button when actionLabel and onAction are provided', () => {
    const onAction = jest.fn()
    render(
      <EmptyState
        title="No tasks"
        description="Create a task"
        actionLabel="Create Task"
        onAction={onAction}
      />
    )
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('calls onAction when button is clicked', () => {
    const onAction = jest.fn()
    render(
      <EmptyState
        title="No tasks"
        description="Create a task"
        actionLabel="Create Task"
        onAction={onAction}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('does not render button when actionLabel is not provided', () => {
    render(<EmptyState title="No tasks" description="Empty" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    const icon = <svg data-testid="custom-icon" />
    render(<EmptyState title="No tasks" description="Empty" icon={icon} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
