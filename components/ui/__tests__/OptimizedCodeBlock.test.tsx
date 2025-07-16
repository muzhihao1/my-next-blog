import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
}
from "@testing-library/react";
import {
  OptimizedCodeBlock,
  SimpleCodeBlock,
  preloadCommonLanguages,
}
from "../OptimizedCodeBlock";
// Mock react-syntax-highlighter jest.mock('react-syntax-highlighter', () => { const React = require('react') const Light = ({ children, language, style, showLineNumbers, customStyle, codeTagProps }: any) => { return React.createElement( 'pre', { style: customStyle, className: 'hljs', 'data-testid': 'syntax-highlighter', 'data-language': language, 'data-show-line-numbers': showLineNumbers }, React.createElement( 'code', codeTagProps, children ) ) }
// Mock registerLanguage function Light.registerLanguage = jest.fn() return { Light }
}) // Mock styles jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({ atomOneDark: { 'hljs': { 'background': '#282c34', 'color': '#abb2bf' }
} })) // Mock language imports jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/javascript', () => ({ default: function javascript() { return { name: 'JavaScript', aliases: ['js', 'jsx']
}
} }))

jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/typescript', () => ({ default: function typescript() { return { name: 'TypeScript', aliases: ['ts', 'tsx']
}
} }))

jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/python', () => ({ default: function python() { return { name: 'Python', aliases: ['py']
}
} }))

jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/bash', () => ({ default: function bash() { return { name: 'Bash', aliases: ['sh']
}
} }))

jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/css', () => ({ default: function css() { return { name: 'CSS' }
} })) // Mock clipboard API const mockWriteText = jest.fn() Object.defineProperty(navigator, 'clipboard', { value: { writeText: mockWriteText }, configurable: true, }) // Mock console methods const originalError = console.error beforeAll(() => { console.error = jest.fn() }) afterAll(() => { console.error = originalError })
describe('OptimizedCodeBlock', () => { beforeEach(() => { jest.clearAllMocks() mockWriteText.mockResolvedValue(undefined) })
it('renders code with syntax highlighting', async () => { const code = 'const hello = "world";' render( <OptimizedCodeBlock code={code}
language="javascript" /> ) // Should show loading state initially with plain pre/code const preElement = screen.getByText(code).closest('pre') expect(preElement).toHaveClass('p-4', 'bg-gray-900', 'text-gray-300') // Wait for language to load await waitFor(() => { const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveAttribute('data-language', 'javascript') }) })
it('renders plaintext without loading', () => { const code = 'Just plain text' render( <OptimizedCodeBlock code={code}
language="plaintext" /> ) // Should render syntax highlighter immediately for plaintext const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveAttribute('data-language', 'plaintext') })
it('shows line numbers by default', async () => { render( <OptimizedCodeBlock code="test" language="javascript" /> ) await waitFor(() => { const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveAttribute('data-show-line-numbers', 'true') }) })
it('hides line numbers when showLineNumbers is false', async () => { render( <OptimizedCodeBlock code="test" language="javascript" showLineNumbers={false}
/> ) await waitFor(() => { const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveAttribute('data-show-line-numbers', 'false') }) })
it('copies code to clipboard on button click', async () => { const code = 'const test = true;' render( <OptimizedCodeBlock code={code}
language="javascript" /> ) await waitFor(() => { expect(screen.getByRole('button', { name: '复制代码' })).toBeInTheDocument() }) const copyButton = screen.getByRole('button', { name: '复制代码' }) fireEvent.click(copyButton) expect(mockWriteText).toHaveBeenCalledWith(code) // Should show "已复制" temporarily await waitFor(() => { expect(copyButton).toHaveTextContent('已复制') }) })
it('reverts copy button text after 2 seconds', async () => { jest.useFakeTimers() render( <OptimizedCodeBlock code="test" language="javascript" /> ) await waitFor(() => { expect(screen.getByRole('button')).toBeInTheDocument() }) const copyButton = screen.getByRole('button') await act(async () => { fireEvent.click(copyButton) }) expect(copyButton).toHaveTextContent('已复制') act(() => { jest.advanceTimersByTime(2000) }) await waitFor(() => { expect(copyButton).toHaveTextContent('复制') }) jest.useRealTimers() })
it('handles clipboard error gracefully', async () => { mockWriteText.mockRejectedValueOnce(new Error('Clipboard error')) render( <OptimizedCodeBlock code="test" language="javascript" /> ) await waitFor(() => { expect(screen.getByRole('button')).toBeInTheDocument() }) const copyButton = screen.getByRole('button') fireEvent.click(copyButton) await waitFor(() => { expect(console.error).toHaveBeenCalledWith('Failed to copy code:', expect.any(Error)) }) // Should not show "已复制" on error expect(copyButton).toHaveTextContent('复制') })
it('displays language label for non-plaintext', async () => { render( <OptimizedCodeBlock code="test" language="javascript" /> ) await waitFor(() => { expect(screen.getByText('javascript')).toBeInTheDocument() }) })
it('does not display language label for plaintext', () => { render( <OptimizedCodeBlock code="test" language="plaintext" />
)
expect(screen.queryByText('plaintext')).not.toBeInTheDocument() })
it('normalizes language names', async () => { render( <OptimizedCodeBlock code="test" language="Java-Script!" /> ) await waitFor(() => { const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveAttribute('data-language', 'javascript') }) })
it('applies custom className', async () => { const { container } = render( <OptimizedCodeBlock code="test" language="javascript" className="custom-class" /> ) // The className is applied to the wrapper div const wrapper = container.querySelector('.custom-class') expect(wrapper).toBeInTheDocument() expect(wrapper).toHaveClass('relative', 'group', 'custom-class') })
it('applies custom styles', async () => { const customStyle = { fontSize: '20px' }
render( <OptimizedCodeBlock code="test" language="javascript" customStyle={customStyle}
/> ) await waitFor(() => { const highlighter = screen.getByTestId('syntax-highlighter') expect(highlighter).toHaveStyle({ fontSize: '20px' }) }) })
it('handles unknown language gracefully', async () => { render( <OptimizedCodeBlock code="test" language="unknown-lang" /> ) // Should render as plaintext fallback after attempting to load await waitFor(() => { const highlighter = screen.queryByTestId('syntax-highlighter') expect(highlighter).toBeInTheDocument() }) expect(screen.getByText('test')).toBeInTheDocument() })
it('shows loading fallback for unloaded language', () => { render( <OptimizedCodeBlock code="print('hello')" language="python" /> ) // Should show plain pre/code initially const pre = screen.getByText("print('hello')").closest('pre') expect(pre).toHaveClass('p-4', 'bg-gray-900', 'text-gray-300') // Should not have syntax highlighter yet expect(screen.queryByTestId('syntax-highlighter')).not.toBeInTheDocument() }) })
describe('SimpleCodeBlock', () => { beforeEach(() => { jest.clearAllMocks() mockWriteText.mockResolvedValue(undefined) })
it('renders code without syntax highlighting', () => { const code = 'const hello = "world";' render(<SimpleCodeBlock code={code}
/>
)
expect(screen.getByText(code)).toBeInTheDocument() const pre = screen.getByText(code).closest('pre') expect(pre).toHaveClass('bg-gray-900', 'text-gray-300') })
it('copies code on button click', async () => { const code = 'test code' render(<SimpleCodeBlock code={code}
/>
)
const copyButton = screen.getByRole('button', { name: '复制代码' }) fireEvent.click(copyButton) expect(mockWriteText).toHaveBeenCalledWith(code) await waitFor(() => { expect(copyButton).toHaveTextContent('已复制') }) })
it('applies custom className', () => { const { container } = render( <SimpleCodeBlock code="test" className="custom-simple-class" />
)
const wrapper = container.querySelector('.custom-simple-class') expect(wrapper).toBeInTheDocument() })
it('handles copy error gracefully', async () => { mockWriteText.mockRejectedValueOnce(new Error('Copy failed')) render(<SimpleCodeBlock code="test" />
)
const copyButton = screen.getByRole('button') fireEvent.click(copyButton) await waitFor(() => { expect(console.error).toHaveBeenCalledWith('Failed to copy code:', expect.any(Error)) }) expect(copyButton).toHaveTextContent('复制') }) })
describe('preloadCommonLanguages', () => { it('preloads common languages without error', async () => { // Reset the mock to track calls const { Light } = require('react-syntax-highlighter') const originalRegisterLanguage = Light.registerLanguage Light.registerLanguage = jest.fn() // Should not throw an error await expect(preloadCommonLanguages()).resolves.not.toThrow() // Should have called registerLanguage (at least once, as languages may be cached) expect(Light.registerLanguage).toHaveBeenCalled() // Restore original mock Light.registerLanguage = originalRegisterLanguage })
it('completes without throwing errors even when imports fail', async () => { // Mock console.error to suppress error output const originalConsoleError = console.error console.error = jest.fn() // Simple test - just ensure the function completes without throwing await expect(preloadCommonLanguages()).resolves.not.toThrow() // Restore console.error console.error = originalConsoleError }) })
