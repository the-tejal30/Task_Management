import { render, screen, fireEvent } from '@testing-library/react'
import Input from 'commoncomponent/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('shows error message when touched and error are set', () => {
    render(<Input label="Name" error="Name is required" touched={true} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
  })

  it('does not show error message when not touched', () => {
    render(<Input label="Name" error="Name is required" touched={false} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows hint when no error', () => {
    render(<Input hint="Enter your full name" />)
    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('has correct displayName', () => {
    expect(Input.displayName).toBe('Input')
  })
})
