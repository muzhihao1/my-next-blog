import { render, screen, waitFor, act }
from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyButton from "../CopyButton";
// Mock the clipboard API const mockWriteText = jest.fn() beforeAll(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: mockWriteText, }, configurable: true, }) })
describe('CopyButton', () => { beforeEach(() => { jest.clearAllMocks() mockWriteText.mockResolvedValue(undefined) })
it('renders with default text', () => { render(<CopyButton text="Hello World" />
)
const button = screen.getByRole('button') expect(button).toBeInTheDocument() expect(button).toHaveTextContent('复制') })
it('renders with custom children', () => { render( <CopyButton text="Hello World"> Copy to clipboard </CopyButton>
)
const button = screen.getByRole('button') expect(button).toHaveTextContent('Copy to clipboard') })
it('copies text to clipboard on click', async () => { const textToCopy = 'This is the text to copy' render(<CopyButton text={textToCopy}
/>
)
const button = screen.getByRole('button') await userEvent.click(button) expect(mockWriteText).toHaveBeenCalledWith(textToCopy) })
it('shows success state after copying', async () => { render(<CopyButton text="Test text" />
)
const button = screen.getByRole('button') expect(button).toHaveTextContent('复制') await userEvent.click(button) // Should show "已复制" immediately expect(button).toHaveTextContent('已复制') })
it('reverts to original text after 2 seconds', async () => { jest.useFakeTimers() render(<CopyButton text="Test text" />
)
const button = screen.getByRole('button') // Use act to handle the state update await act(async () => { button.click() }) expect(button).toHaveTextContent('已复制') // Fast forward 2 seconds act(() => { jest.advanceTimersByTime(2000) }) await waitFor(() => { expect(button).toHaveTextContent('复制') }) jest.useRealTimers() })
it('handles clipboard error gracefully', async () => { const consoleSpy = jest.spyOn(console, 'error').mockImplementation() const mockError = new Error('Clipboard access denied') mockWriteText.mockRejectedValueOnce(mockError) render(<CopyButton text="Test text" />
)
const button = screen.getByRole('button') await act(async () => { button.click() }) // Should log error await waitFor(() => { expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', mockError) }) // Should not show success state expect(button).toHaveTextContent('复制') expect(button).not.toHaveTextContent('已复制') consoleSpy.mockRestore() })
it('applies custom className', () => { render( <CopyButton text="Test text" className="custom-button-class" />
)
const button = screen.getByRole('button') expect(button).toHaveClass('custom-button-class') })
it('handles multiple clicks correctly', async () => { render(<CopyButton text="Test text" />
)
const button = screen.getByRole('button') // First click await act(async () => { button.click() }) expect(button).toHaveTextContent('已复制') expect(mockWriteText).toHaveBeenCalledTimes(1) // Second click while still showing "已复制" await act(async () => { button.click() }) expect(mockWriteText).toHaveBeenCalledTimes(2) })
it('preserves custom children during copied state', async () => { render( <CopyButton text="Test">
<span>Click to copy</span> </CopyButton>
)
const button = screen.getByRole('button') expect(button).toHaveTextContent('Click to copy') await act(async () => { button.click() }) // Should show "已复制" instead of custom children expect(button).toHaveTextContent('已复制') expect(button).not.toHaveTextContent('Click to copy') }) })
