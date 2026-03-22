import { render, screen } from '@testing-library/react'
import Badge from 'commoncomponent/Badge'

describe('Badge', () => {
  it('renders "To Do" for todo status', () => {
    render(<Badge status="todo" />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders "In Progress" for in-progress status', () => {
    render(<Badge status="in-progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders "Done" for done status', () => {
    render(<Badge status="done" />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('applies correct color classes for done status', () => {
    const { container } = render(<Badge status="done" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('applies correct color classes for in-progress status', () => {
    const { container } = render(<Badge status="in-progress" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/secondary/)
  })
})
