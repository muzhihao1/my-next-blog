import { render, screen, waitFor }
from '@testing-library/react' 

import userEvent from '@testing-library/user-event' 

import { AuthButton }
from '../AuthButton' 

import { AuthContext }
from '@/contexts/AuthContext' 

import { ReactNode }
from 'react' // Mock next/navigation jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), }), })) // Mock AuthContext provider const mockUser = { id: 'test-user-id', name: 'Test User', email: 'test@example.com', avatar: '/test-avatar.jpg', bio: 'Test bio', github: 'testuser', twitter: 'testuser', website: 'https://test.com', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'), }
interface AuthWrapperProps { children: ReactNode user?: typeof mockUser | null isLoading?: boolean signIn?: jest.Mock signOut?: jest.Mock }
function AuthWrapper({ children, user = null, isLoading = false, signIn = jest.fn(), signOut = jest.fn(), }: AuthWrapperProps) { return ( <AuthContext.Provider value={{ user, isLoading, signIn, signOut }
}> {children} </AuthContext.Provider> ) }

describe('AuthButton', () => { it('shows sign in button when not authenticated', () => { render( <AuthWrapper>
<AuthButton /> </AuthWrapper>
)
const signInButton = screen.getByRole('button', { name: '登录' }) expect(signInButton).toBeInTheDocument() expect(signInButton).toHaveClass('bg-blue-600') })
it('shows user menu when authenticated', () => { render( <AuthWrapper user={mockUser}>
<AuthButton /> </AuthWrapper>
)
const menuButton = screen.getByRole('button', { name: '用户菜单' }) expect(menuButton).toBeInTheDocument() // Check avatar is displayed const avatar = screen.getByRole('img', { name: 'Test User' }) expect(avatar).toBeInTheDocument() expect(avatar).toHaveAttribute('src', '/test-avatar.jpg') })
it('shows loading state', () => { render( <AuthWrapper isLoading={true}>
<AuthButton /> </AuthWrapper>
)
const button = screen.getByRole('button') expect(button).toBeDisabled() expect(button).toHaveAttribute('aria-busy', 'true') // Should show spinner const spinner = button.querySelector('svg.animate-spin') expect(spinner).toBeInTheDocument() })
it('opens dropdown menu on click when authenticated', async () => { const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<AuthButton /> </AuthWrapper>
)
const menuButton = screen.getByRole('button', { name: '用户菜单' }) // Initially menu is not visible expect(screen.queryByRole('menu')).not.toBeInTheDocument() // Click to open menu await user.click(menuButton) // Menu should be visible const menu = screen.getByRole('menu') expect(menu).toBeInTheDocument() // Check menu items expect(screen.getByRole('menuitem', { name: '个人主页' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '我的文章' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '收藏列表' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '账号设置' })).toBeInTheDocument() expect(screen.getByRole('menuitem', { name: '退出登录' })).toBeInTheDocument() })
it('closes menu when clicking outside', async () => { const user = userEvent.setup() render( <div>
<AuthWrapper user={mockUser}>
<AuthButton /> </AuthWrapper>
<button>Outside button</button> </div>
)
const menuButton = screen.getByRole('button', { name: '用户菜单' }) // Open menu await user.click(menuButton) expect(screen.getByRole('menu')).toBeInTheDocument() // Click outside const outsideButton = screen.getByRole('button', { name: 'Outside button' }) await user.click(outsideButton) // Menu should be closed await waitFor(() => { expect(screen.queryByRole('menu')).not.toBeInTheDocument() }) })
it('handles sign in when clicking sign in button', async () => { const mockSignIn = jest.fn() const user = userEvent.setup() render( <AuthWrapper signIn={mockSignIn}>
<AuthButton /> </AuthWrapper>
)
const signInButton = screen.getByRole('button', { name: '登录' }) await user.click(signInButton) expect(mockSignIn).toHaveBeenCalledTimes(1) })
it('handles sign out when clicking sign out menu item', async () => { const mockSignOut = jest.fn() const user = userEvent.setup() render( <AuthWrapper user={mockUser}
signOut={mockSignOut}>
<AuthButton /> </AuthWrapper> ) // Open menu const menuButton = screen.getByRole('button', { name: '用户菜单' }) await user.click(menuButton) // Click sign out const signOutButton = screen.getByRole('menuitem', { name: '退出登录' }) await user.click(signOutButton) expect(mockSignOut).toHaveBeenCalledTimes(1) })
it('navigates to profile when clicking profile menu item', async () => { const mockPush = jest.fn() jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush, refresh: jest.fn(), }) const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<AuthButton /> </AuthWrapper> ) // Open menu const menuButton = screen.getByRole('button', { name: '用户菜单' }) await user.click(menuButton) // Click profile const profileLink = screen.getByRole('menuitem', { name: '个人主页' }) await user.click(profileLink) expect(mockPush).toHaveBeenCalledWith('/profile') })
it('shows user name fallback when no avatar', () => { const userWithoutAvatar = { ...mockUser, avatar: null }
render( <AuthWrapper user={userWithoutAvatar}>
<AuthButton /> </AuthWrapper> ) // Should show initials instead of avatar const initials = screen.getByText('TU') expect(initials).toBeInTheDocument() expect(initials.parentElement).toHaveClass('bg-gray-200') })
it('applies custom className', () => { render( <AuthWrapper>
<AuthButton className="custom-auth-button" /> </AuthWrapper>
)
const container = screen.getByRole('button').parentElement expect(container).toHaveClass('custom-auth-button') })
it('handles keyboard navigation in menu', async () => { const user = userEvent.setup() render( <AuthWrapper user={mockUser}>
<AuthButton /> </AuthWrapper> ) // Open menu const menuButton = screen.getByRole('button', { name: '用户菜单' }) await user.click(menuButton) // Navigate with arrow keys await user.keyboard('{ArrowDown}') const firstMenuItem = screen.getByRole('menuitem', { name: '个人主页' }) expect(firstMenuItem).toHaveFocus() await user.keyboard('{ArrowDown}') const secondMenuItem = screen.getByRole('menuitem', { name: '我的文章' }) expect(secondMenuItem).toHaveFocus() // Close with Escape await user.keyboard('{Escape}') await waitFor(() => { expect(screen.queryByRole('menu')).not.toBeInTheDocument() }) }) })