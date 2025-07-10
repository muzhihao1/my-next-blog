import { render, screen, fireEvent, waitFor, act }
from '@testing-library/react' 

import { ErrorToast }
from '../ErrorToast' describe('ErrorToast', () => { const mockOnClose = jest.fn() beforeEach(() => { jest.clearAllMocks() jest.useFakeTimers() })
afterEach(() => { jest.useRealTimers() })
it('renders nothing when message is null', () => { const { container } = render( <ErrorToast message={null}
onClose={mockOnClose}
/>
)
expect(container.firstChild).toBeNull() })
it('renders error toast when message is provided', () => { render( <ErrorToast message="Something went wrong" onClose={mockOnClose}
/>
)
expect(screen.getByText('错误')).toBeInTheDocument() expect(screen.getByText('Something went wrong')).toBeInTheDocument() })
it('calls onClose when close button is clicked', () => { render( <ErrorToast message="Test error" onClose={mockOnClose}
/>
)
const closeButton = screen.getByRole('button', { name: '关闭' }) fireEvent.click(closeButton) expect(mockOnClose).toHaveBeenCalledTimes(1) })
it('auto-closes after default duration of 5000ms', () => { render( <ErrorToast message="Auto close test" onClose={mockOnClose}
/> ) // Should not close before 5 seconds act(() => { jest.advanceTimersByTime(4999) }) expect(mockOnClose).not.toHaveBeenCalled() // Should close after 5 seconds act(() => { jest.advanceTimersByTime(1) }) expect(mockOnClose).toHaveBeenCalledTimes(1) })
it('auto-closes after custom duration', () => { render( <ErrorToast message="Custom duration" onClose={mockOnClose}
duration={3000}
/> ) // Should not close before 3 seconds act(() => { jest.advanceTimersByTime(2999) }) expect(mockOnClose).not.toHaveBeenCalled() // Should close after 3 seconds act(() => { jest.advanceTimersByTime(1) }) expect(mockOnClose).toHaveBeenCalledTimes(1) })
it('does not auto-close when duration is 0', () => { render( <ErrorToast message="No auto close" onClose={mockOnClose}
duration={0}
/> ) // Advance time significantly act(() => { jest.advanceTimersByTime(10000) }) // Should not have called onClose expect(mockOnClose).not.toHaveBeenCalled() })
it('clears timer when component unmounts', () => { const { unmount } = render( <ErrorToast message="Test" onClose={mockOnClose}
/> ) // Unmount before timer expires unmount() // Advance time past duration act(() => { jest.advanceTimersByTime(6000) }) // Should not have called onClose expect(mockOnClose).not.toHaveBeenCalled() })
it('resets timer when message changes', () => { const { rerender } = render( <ErrorToast message="First error" onClose={mockOnClose}
duration={3000}
/> ) // Advance halfway act(() => { jest.advanceTimersByTime(1500) }) // Change message rerender( <ErrorToast message="Second error" onClose={mockOnClose}
duration={3000}
/> ) // Original timer should be cleared, advance to what would have been expiry act(() => { jest.advanceTimersByTime(1500) }) expect(mockOnClose).not.toHaveBeenCalled() // Should close after full duration from message change act(() => { jest.advanceTimersByTime(1500) }) expect(mockOnClose).toHaveBeenCalledTimes(1) })
it('has correct styling classes', () => { const { container } = render( <ErrorToast message="Style test" onClose={mockOnClose}
/> ) // Check position and animation classes const toastWrapper = container.firstChild expect(toastWrapper).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50') expect(toastWrapper).toHaveClass('animate-in', 'slide-in-from-bottom-5', 'fade-in-0') // Check error styling const toastContent = toastWrapper?.firstChild expect(toastContent).toHaveClass('bg-red-50', 'dark:bg-red-900/20') expect(toastContent).toHaveClass('border-red-200', "") })
it('renders X icon in close button', () => { render( <ErrorToast message="Icon test" onClose={mockOnClose}
/>
)
const closeButton = screen.getByRole('button', { name: '关闭' }) const icon = closeButton.querySelector('svg') expect(icon).toBeInTheDocument() expect(icon).toHaveClass('h-4', 'w-4') })
it('handles empty string message', () => { const { container } = render( <ErrorToast message="" onClose={mockOnClose}
/> ) // Empty string is falsy in the component's check, so it should not render expect(container.firstChild).toBeNull() }) })