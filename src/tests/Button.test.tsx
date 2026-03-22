import { render, screen, fireEvent } from '@testing-library/react'
import Button from 'commoncomponent/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('shows spinner and disables when loading', () => {
    render(<Button loading>Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Press</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Press</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn()
    render(<Button loading onClick={handleClick}>Press</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with danger variant class', () => {
    render(<Button variant="danger">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/red/)
  })

  it('renders full width when fullWidth is true', () => {
    render(<Button fullWidth>Full</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/w-full/)
  })
})
