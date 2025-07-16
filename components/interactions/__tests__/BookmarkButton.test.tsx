import { render, screen, waitFor }
from '@testing-library/react' 

import userEvent from '@testing-library/user-event' 

import { BookmarkButton }
from '../BookmarkButton' 

import { AuthContext }
from '@/contexts/AuthContext' 

import { ReactNode }
from 'react' // Mock fetch global.fetch = jest.fn() const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com', avatar: '/test-avatar.jpg', bio: 'Test bio', github: 'testuser', twitter: 'testuser', website: 'https://test.com', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'), }
function AuthWrapper({ children, user = null }: { children: ReactNode; user?: typeof mockUser | null }) { return ( <AuthContext.Provider value={{ user, isLoading: false, signIn: jest.fn(), signOut: jest.fn() }
}> {children} </AuthContext.Provider> ) }

describe('BookmarkButton', () => { beforeEach(() => { jest.clearAllMocks() })
it('renders unbookmarked state by default', () => { render( <AuthWrapper>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) expect(button).toBeInTheDocument() expect(button).toHaveAttribute('aria-pressed', 'false') // Check for unfilled bookmark icon const icon = button.querySelector('svg') expect(icon).not.toHaveClass('fill-yellow-500') })
it('renders bookmarked state when initialBookmarked is true', () => { render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={true}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '取消收藏' }) expect(button).toBeInTheDocument() expect(button).toHaveAttribute('aria-pressed', 'true') // Check for filled bookmark icon const icon = button.querySelector('svg') expect(icon).toHaveClass('fill-yellow-500') })
it('toggles bookmark when clicked by authenticated user', async () => { (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ bookmarked: true }), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Verify API call expect(fetch).toHaveBeenCalledWith('/api/posts/post-1/bookmark', { method: 'POST', }) // Check updated state await waitFor(() => { expect(screen.getByRole('button', { name: '取消收藏' })).toBeInTheDocument() }) // Should show success message expect(screen.getByText('已添加到收藏夹')).toBeInTheDocument() })
it('removes bookmark when clicked on bookmarked post', async () => { (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ bookmarked: false }), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={true}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '取消收藏' }) await user.click(button) // Verify API call expect(fetch).toHaveBeenCalledWith('/api/posts/post-1/bookmark', { method: 'DELETE', }) // Check updated state await waitFor(() => { expect(screen.getByRole('button', { name: '收藏' })).toBeInTheDocument() }) // Should show success message expect(screen.getByText('已从收藏夹移除')).toBeInTheDocument() })
it('shows login prompt when clicked by unauthenticated user', async () => { const user = userEvent.setup() render( <AuthWrapper>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Should not make API call expect(fetch).not.toHaveBeenCalled() // Should show login prompt expect(screen.getByText('请先登录后再收藏')).toBeInTheDocument() })
it('disables button during API call', async () => { let resolvePromise: (value: any) => void const promise = new Promise((resolve) => { resolvePromise = resolve }) (fetch as jest.Mock).mockReturnValueOnce(promise) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Button should be disabled expect(button).toBeDisabled() expect(button).toHaveAttribute('aria-busy', 'true') // Resolve the promise resolvePromise!({ ok: true, json: async () => ({ bookmarked: true }), }) // Button should be re-enabled await waitFor(() => { expect(button).not.toBeDisabled() expect(button).toHaveAttribute('aria-busy', 'false') }) })
it('handles API error gracefully', async () => { (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error')) const consoleSpy = jest.spyOn(console, 'error').mockImplementation() const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Should log error await waitFor(() => { expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle bookmark:', expect.any(Error)) }) // Should show error message expect(screen.getByText('操作失败，请重试')).toBeInTheDocument() // State should not change expect(button).toHaveAttribute('aria-pressed', 'false') consoleSpy.mockRestore() })
it('applies custom className', () => { render( <AuthWrapper>
<BookmarkButton postId="post-1" initialBookmarked={false}
className="custom-bookmark-button" /> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) expect(button).toHaveClass('custom-bookmark-button') })
it('hides toast message after timeout', async () => { jest.useFakeTimers() (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ bookmarked: true }), }) const user = userEvent.setup({ delay: null }) render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Wait for success message await waitFor(() => { expect(screen.getByText('已添加到收藏夹')).toBeInTheDocument() }) // Fast forward time jest.advanceTimersByTime(3000) // Message should disappear await waitFor(() => { expect(screen.queryByText('已添加到收藏夹')).not.toBeInTheDocument() }) jest.useRealTimers() })
it('handles rapid clicks correctly', async () => { (fetch as jest.Mock) .mockResolvedValueOnce({ ok: true, json: async () => ({ bookmarked: true }), }) .mockResolvedValueOnce({ ok: true, json: async () => ({ bookmarked: false }), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) // Rapid double click await user.click(button) await user.click(button) // Should only make one API call (second click ignored due to loading state) expect(fetch).toHaveBeenCalledTimes(1) })
it('shows optimistic UI update', async () => { let resolvePromise: (value: any) => void const promise = new Promise((resolve) => { resolvePromise = resolve }) (fetch as jest.Mock).mockReturnValueOnce(promise) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<BookmarkButton postId="post-1" initialBookmarked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '收藏' }) await user.click(button) // Should show optimistic update immediately expect(button).toHaveAttribute('aria-pressed', 'true') expect(button.querySelector('svg')).toHaveClass('fill-yellow-500') // Resolve the promise resolvePromise!({ ok: true, json: async () => ({ bookmarked: true }), }) // State should remain consistent await waitFor(() => { expect(button).toHaveAttribute('aria-pressed', 'true') }) }) })