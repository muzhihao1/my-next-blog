import { render, screen, waitFor }
from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareButton }
from "../ShareButton";
// Mock navigator.clipboard Object.assign(navigator, { clipboard: { writeText: jest.fn(), }, }) // Mock navigator.share Object.assign(navigator, { share: jest.fn(), }) // Mock window.open global.open = jest.fn() describe('ShareButton', () => { const defaultProps = { url: 'https://example.com/post/test-post', title: 'Test Post Title', description: 'This is a test post description', }

beforeEach(() => { jest.clearAllMocks() })
it('renders share button with icon', () => { render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) expect(button).toBeInTheDocument() // Check for share icon const icon = button.querySelector('svg') expect(icon).toBeInTheDocument() })
it('opens share menu on click', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) // Initially menu is not visible expect(screen.queryByRole('menu')).not.toBeInTheDocument() // Click to open menu await user.click(button) // Menu should be visible const menu = screen.getByRole('menu') expect(menu).toBeInTheDocument() // Check share options expect(screen.getByRole('menuitem', { name: '分享到 Twitter' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '分享到 Facebook' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '分享到 LinkedIn' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '复制链接' })).toBeInTheDocument() })
it('uses native share API when available', async () => { // Mock canShare to return true (navigator as any).canShare = jest.fn().mockReturnValue(true) const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) // Should show native share option const nativeShareButton = screen.getByRole('menuitem', { name: '系统分享' }) expect(nativeShareButton).toBeInTheDocument() // Click native share await user.click(nativeShareButton) // Verify navigator.share was called expect(navigator.share).toHaveBeenCalledWith({ title: 'Test Post Title', text: 'This is a test post description', url: 'https://example.com/post/test-post', }) })
it('handles native share error gracefully', async () => { (navigator as any).canShare = jest.fn().mockReturnValue(true) (navigator.share as jest.Mock).mockRejectedValueOnce(new Error('Share cancelled')) const consoleSpy = jest.spyOn(console, 'error').mockImplementation() const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const nativeShareButton = screen.getByRole('menuitem', { name: '系统分享' }) await user.click(nativeShareButton) // Should log error but not crash await waitFor(() => { expect(consoleSpy).toHaveBeenCalledWith('Native share failed:', expect.any(Error)) }) consoleSpy.mockRestore() })
it('shares to Twitter', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const twitterButton = screen.getByRole('menuitem', { name: '分享到 Twitter' }) await user.click(twitterButton) // Verify window.open was called with Twitter share URL expect(global.open).toHaveBeenCalledWith( expect.stringContaining('https://twitter.com/intent/tweet'), '_blank' ) const url = (global.open as jest.Mock).mock.calls[0][0]
expect(url).toContain('text=Test%20Post%20Title') expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fpost%2Ftest-post') })
it('shares to Facebook', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const facebookButton = screen.getByRole('menuitem', { name: '分享到 Facebook' }) await user.click(facebookButton) // Verify window.open was called with Facebook share URL expect(global.open).toHaveBeenCalledWith( expect.stringContaining('https://www.facebook.com/sharer/sharer.php'), '_blank' ) const url = (global.open as jest.Mock).mock.calls[0][0]
expect(url).toContain('u=https%3A%2F%2Fexample.com%2Fpost%2Ftest-post') })
it('shares to LinkedIn', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const linkedinButton = screen.getByRole('menuitem', { name: '分享到 LinkedIn' }) await user.click(linkedinButton) // Verify window.open was called with LinkedIn share URL expect(global.open).toHaveBeenCalledWith( expect.stringContaining('https://www.linkedin.com/sharing/share-offsite'), '_blank' ) const url = (global.open as jest.Mock).mock.calls[0][0]
expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fpost%2Ftest-post') })
it('copies link to clipboard', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const copyButton = screen.getByRole('menuitem', { name: '复制链接' }) await user.click(copyButton) // Verify clipboard.writeText was called expect(navigator.clipboard.writeText).toHaveBeenCalledWith( 'https://example.com/post/test-post' ) // Should show success message await waitFor(() => { expect(screen.getByText('链接已复制到剪贴板')).toBeInTheDocument() }) })
it('handles clipboard error gracefully', async () => { (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce( new Error('Clipboard access denied') ) const consoleSpy = jest.spyOn(console, 'error').mockImplementation() const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const copyButton = screen.getByRole('menuitem', { name: '复制链接' }) await user.click(copyButton) // Should log error await waitFor(() => { expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error)) }) // Should show error message expect(screen.getByText('复制失败，请重试')).toBeInTheDocument() consoleSpy.mockRestore() })
it('closes menu when clicking outside', async () => { const user = userEvent.setup() render( <div>
<ShareButton {...defaultProps}
/>
<button>Outside button</button> </div>
)
const shareButton = screen.getByRole('button', { name: '分享' }) // Open menu await user.click(shareButton) expect(screen.getByRole('menu')).toBeInTheDocument() // Click outside const outsideButton = screen.getByRole('button', { name: 'Outside button' }) await user.click(outsideButton) // Menu should be closed await waitFor(() => { expect(screen.queryByRole('menu')).not.toBeInTheDocument() }) })
it('closes menu after sharing', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const twitterButton = screen.getByRole('menuitem', { name: '分享到 Twitter' }) await user.click(twitterButton) // Menu should be closed after action await waitFor(() => { expect(screen.queryByRole('menu')).not.toBeInTheDocument() }) })
it('applies custom className', () => { render(<ShareButton {...defaultProps}
className="custom-share-button" />
)
const button = screen.getByRole('button', { name: '分享' }) expect(button).toHaveClass('custom-share-button') })
it('hides toast message after timeout', async () => { jest.useFakeTimers() const user = userEvent.setup({ delay: null }) render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) const copyButton = screen.getByRole('menuitem', { name: '复制链接' }) await user.click(copyButton) // Wait for success message await waitFor(() => { expect(screen.getByText('链接已复制到剪贴板')).toBeInTheDocument() }) // Fast forward time jest.advanceTimersByTime(3000) // Message should disappear await waitFor(() => { expect(screen.queryByText('链接已复制到剪贴板')).not.toBeInTheDocument() }) jest.useRealTimers() })
it('handles keyboard navigation', async () => { const user = userEvent.setup() render(<ShareButton {...defaultProps}
/>
)
const button = screen.getByRole('button', { name: '分享' }) await user.click(button) // Navigate with arrow keys await user.keyboard('{ArrowDown}') const firstMenuItem = screen.getByRole('menuitem', { name: '分享到 Twitter' }) expect(firstMenuItem).toHaveFocus() // Close with Escape await user.keyboard('{Escape}') await waitFor(() => { expect(screen.queryByRole('menu')).not.toBeInTheDocument() }) })
it('shows share count when provided', () => { render(<ShareButton {...defaultProps}
shareCount={42}
/>
)
expect(screen.getByText('42')).toBeInTheDocument() })
it('formats large share counts', () => { render(<ShareButton {...defaultProps}
shareCount={1234}
/>
)
expect(screen.getByText('1.2K')).toBeInTheDocument() }) })
