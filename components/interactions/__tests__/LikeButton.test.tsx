import { render, screen, waitFor }
from '@testing-library/react' 

import userEvent from '@testing-library/user-event' 

import { LikeButton }
from '../LikeButton' 

import { AuthContext }
from '@/contexts/AuthContext' 

import { ReactNode }
from 'react' // Mock fetch global.fetch = jest.fn() const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com', avatar: '/test-avatar.jpg', bio: 'Test bio', github: 'testuser', twitter: 'testuser', website: 'https://test.com', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'), }
function AuthWrapper({ children, user = null }: { children: ReactNode; user?: typeof mockUser | null }) { return ( <AuthContext.Provider value={{ user, isLoading: false, signIn: jest.fn(), signOut: jest.fn() }
}> {children} </AuthContext.Provider> ) }

describe('LikeButton', () => { beforeEach(() => { jest.clearAllMocks() })
it('renders with initial count', () => { render( <AuthWrapper>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) expect(button).toBeInTheDocument() expect(screen.getByText('5')).toBeInTheDocument() })
it('shows liked state when initialLiked is true', () => { render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={10}
initialLiked={true}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '取消点赞' }) expect(button).toBeInTheDocument() expect(button).toHaveAttribute('aria-pressed', 'true') // Check for filled heart icon const icon = button.querySelector('svg') expect(icon).toHaveClass('fill-red-500') })
it('toggles like when clicked by authenticated user', async () => { (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ liked: true, count: 6 }), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) await user.click(button) // Verify API call expect(fetch).toHaveBeenCalledWith('/api/posts/post-1/like', { method: 'POST', }) // Check updated state await waitFor(() => { expect(screen.getByRole('button', { name: '取消点赞' })).toBeInTheDocument() expect(screen.getByText('6')).toBeInTheDocument() }) })
it('toggles unlike when clicked on liked post', async () => { (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ liked: false, count: 9 }), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={10}
initialLiked={true}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '取消点赞' }) await user.click(button) // Verify API call expect(fetch).toHaveBeenCalledWith('/api/posts/post-1/like', { method: 'DELETE', }) // Check updated state await waitFor(() => { expect(screen.getByRole('button', { name: '点赞' })).toBeInTheDocument() expect(screen.getByText('9')).toBeInTheDocument() }) })
it('shows login prompt when clicked by unauthenticated user', async () => { const user = userEvent.setup() render( <AuthWrapper>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) await user.click(button) // Should not make API call expect(fetch).not.toHaveBeenCalled() // Should show login prompt expect(screen.getByText('请先登录后再点赞')).toBeInTheDocument() })
it('disables button during API call', async () => { let resolvePromise: (value: any) => void const promise = new Promise((resolve) => { resolvePromise = resolve }) (fetch as jest.Mock).mockReturnValueOnce(promise) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) await user.click(button) // Button should be disabled expect(button).toBeDisabled() expect(button).toHaveAttribute('aria-busy', 'true') // Resolve the promise resolvePromise!({ ok: true, json: async () => ({ liked: true, count: 6 }), }) // Button should be re-enabled await waitFor(() => { expect(button).not.toBeDisabled() expect(button).toHaveAttribute('aria-busy', 'false') }) })
it('handles API error gracefully', async () => { (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error')) const consoleSpy = jest.spyOn(console, 'error').mockImplementation() const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) await user.click(button) // Should log error await waitFor(() => { expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle like:', expect.any(Error)) }) // State should not change expect(screen.getByText('5')).toBeInTheDocument() expect(button).toHaveAttribute('aria-pressed', 'false') consoleSpy.mockRestore() })
it('applies custom className', () => { render( <AuthWrapper>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
className="custom-like-button" /> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) expect(button).toHaveClass('custom-like-button') })
it('shows optimistic UI update', async () => { let resolvePromise: (value: any) => void const promise = new Promise((resolve) => { resolvePromise = resolve }) (fetch as jest.Mock).mockReturnValueOnce(promise) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<LikeButton postId="post-1" initialCount={5}
initialLiked={false}
/> </AuthWrapper>
)
const button = screen.getByRole('button', { name: '点赞' }) await user.click(button) // Should show optimistic update immediately expect(screen.getByText('6')).toBeInTheDocument() expect(button).toHaveAttribute('aria-pressed', 'true') // Resolve with different count (simulating race condition) resolvePromise!({ ok: true, json: async () => ({ liked: true, count: 7 }), // Server says 7, not 6 }) // Should update to server value await waitFor(() => { expect(screen.getByText('7')).toBeInTheDocument() }) })
it('formats large numbers correctly', () => { render( <AuthWrapper>
<LikeButton postId="post-1" initialCount={1234}
initialLiked={false}
/> </AuthWrapper>
)
expect(screen.getByText('1.2K')).toBeInTheDocument() })
it('shows zero likes correctly', () => { render( <AuthWrapper>
<LikeButton postId="post-1" initialCount={0}
initialLiked={false}
/> </AuthWrapper>
)
expect(screen.getByText('0')).toBeInTheDocument() }) })