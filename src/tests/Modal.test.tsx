import { render, screen, fireEvent } from '@testing-library/react'
import Modal from 'commoncomponent/Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('has aria-modal attribute', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('renders title in aria-labelledby element', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('calls onClose when overlay backdrop is clicked directly', () => {
    render(<Modal {...defaultProps} />)
    const overlay = screen.getByRole('dialog')
    fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when inner content is clicked', () => {
    render(<Modal {...defaultProps} />)
    fireEvent.click(screen.getByText('Modal content'))
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('does not render when closed and does not register keydown', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={false} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).not.toHaveBeenCalled()
    rerender(<Modal {...defaultProps} isOpen={true} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders with sm size', () => {
    render(<Modal {...defaultProps} size="sm" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders with lg size', () => {
    render(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
