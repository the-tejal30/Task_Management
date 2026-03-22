import { render, screen, fireEvent } from '@testing-library/react'
import Dropdown from 'commoncomponent/Dropdown'

describe('Dropdown', () => {
  const options = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ]

  it('renders with label', () => {
    render(<Dropdown label="Status" value="todo" options={options} onChange={jest.fn()} />)
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders without label using id prop', () => {
    render(<Dropdown id="status-select" value="todo" options={options} onChange={jest.fn()} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<Dropdown label="Status" value="todo" options={options} onChange={jest.fn()} />)
    expect(screen.getByRole('option', { name: 'To Do' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Done' })).toBeInTheDocument()
  })

  it('calls onChange with selected value', () => {
    const onChange = jest.fn()
    render(<Dropdown label="Status" value="todo" options={options} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'done' } })
    expect(onChange).toHaveBeenCalledWith('done')
  })

  it('shows error message when touched and error provided', () => {
    render(
      <Dropdown
        label="Status"
        value="todo"
        options={options}
        onChange={jest.fn()}
        error="Status is required"
        touched={true}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Status is required')
  })

  it('does not show error when not touched', () => {
    render(
      <Dropdown
        label="Status"
        value="todo"
        options={options}
        onChange={jest.fn()}
        error="Status is required"
        touched={false}
      />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<Dropdown label="Status" value="todo" options={options} onChange={jest.fn()} disabled={true} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders placeholder option', () => {
    render(
      <Dropdown
        label="Status"
        value="todo"
        options={options}
        onChange={jest.fn()}
        placeholder="Pick a status"
      />
    )
    expect(screen.getByRole('option', { name: 'Pick a status' })).toBeInTheDocument()
  })

  it('generates id from label when no id provided', () => {
    render(<Dropdown label="My Status" value="todo" options={options} onChange={jest.fn()} />)
    expect(screen.getByLabelText('My Status')).toBeInTheDocument()
  })

  it('renders without label or id', () => {
    render(<Dropdown value="todo" options={options} onChange={jest.fn()} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
