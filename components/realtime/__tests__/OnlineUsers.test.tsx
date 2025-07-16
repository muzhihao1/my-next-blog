import { render, screen, waitFor }
from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnlineUsers }
from "../OnlineUsers";
import { useAuth }
from "@/contexts/AuthContext";
import { usePathname }
from "next/navigation";
// Mock dependencies jest.mock('next/navigation', () => ({ usePathname: jest.fn() }))

jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }))

jest.mock('@/lib/realtime/client', () => ({ getRealtimeClient: jest.fn(() => ({ subscribe: jest.fn().mockResolvedValue(undefined), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue([]), updatePresence: jest.fn().mockResolvedValue(undefined) })) })) describe('OnlineUsers', () => { const mockUser = { id: 'user-123', email: 'test@example.com', user_metadata: { display_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' }
}

beforeEach(() => { jest.clearAllMocks() ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser }) ;(usePathname as jest.Mock).mockReturnValue('/test-page') })
it('renders nothing when not connected', () => { const { container } = render(<OnlineUsers />
)
expect(container.firstChild).toBeNull() })
it('renders online count in simple mode', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { // Simulate connection setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue([ { userId: 'user-1', username: 'User 1', status: 'online', lastSeen: Date.now() }, { userId: 'user-2', username: 'User 2', status: 'online', lastSeen: Date.now() }
]), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers />) await waitFor(() => { expect(screen.getByText('2 人在线')).toBeInTheDocument() }) // Check for online indicator expect(screen.getByText('2 人在线').previousElementSibling).toHaveClass('animate-ping') })
it('renders user avatars in detailed mode', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const onlineUsers = [ { userId: 'user-1', username: 'Alice', avatar: 'https://example.com/alice.jpg', status: 'online', lastSeen: Date.now() }, { userId: 'user-2', username: 'Bob', status: 'online', lastSeen: Date.now() }
]
const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue(onlineUsers), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers showDetails={true}
/>) await waitFor(() => { expect(screen.getByText('2 人在线')).toBeInTheDocument() const avatars = screen.getAllByRole('img') expect(avatars).toHaveLength(2) expect(avatars[0]).toHaveAttribute('src', 'https://example.com/alice.jpg') expect(avatars[0]).toHaveAttribute('alt', 'Alice') expect(avatars[1]).toHaveAttribute('src', expect.stringContaining('ui-avatars.com')) expect(avatars[1]).toHaveAttribute('alt', 'Bob') }) })
it('shows remaining count when exceeding maxDisplay', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const onlineUsers = Array.from({ length: 8 }, (_, i) => ({ userId: `user-${i}`, username: `User ${i}`, status: 'online' as const, lastSeen: Date.now() }))

const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue(onlineUsers), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers showDetails={true}
maxDisplay={5}
/>) await waitFor(() => { expect(screen.getByText('8 人在线')).toBeInTheDocument() expect(screen.getByText('+3')).toBeInTheDocument() }) })
it('filters out offline users', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const onlineUsers = [ { userId: 'user-1', username: 'Active User', status: 'online', lastSeen: Date.now() }, { userId: 'user-2', username: 'Inactive User', status: 'online', lastSeen: Date.now() - 120000 // 2 minutes ago }
]
const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue(onlineUsers), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers />) await waitFor(() => { expect(screen.getByText('1 人在线')).toBeInTheDocument() }) })
it('shows tooltip on hover in detailed mode', async () => { const user = userEvent.setup() const { getRealtimeClient } = require('@/lib/realtime/client') const onlineUsers = [ { userId: 'user-1', username: 'Alice', status: 'online', lastSeen: Date.now(), currentPage: '/posts/hello-world' }
]
const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue(onlineUsers), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers showDetails={true}
/>) await waitFor(() => { expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument() }) // Hover over avatar container const avatarContainer = screen.getByRole('img', { name: 'Alice' }).parentElement?.parentElement await user.hover(avatarContainer!) await waitFor(() => { expect(screen.getByText('在线用户')).toBeInTheDocument() expect(screen.getByText('Alice')).toBeInTheDocument() expect(screen.getByText('正在浏览: /posts/hello-world')).toBeInTheDocument() }) })
it('updates user presence on mount', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const mockUpdatePresence = jest.fn().mockResolvedValue(undefined) const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue([]), updatePresence: mockUpdatePresence }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers />) await waitFor(() => { expect(mockUpdatePresence).toHaveBeenCalledWith( 'presence', expect.objectContaining({ userId: 'user-123', username: 'Test User', avatar: 'https://example.com/avatar.jpg', status: 'online', currentPage: '/test-page', lastSeen: expect.any(Number) }) ) }) })
it('cleans up on unmount', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const mockUnsubscribe = jest.fn().mockResolvedValue(undefined) const mockClient = { subscribe: jest.fn().mockImplementation((_channel, callbacks) => { setTimeout(() => callbacks.onConnect(), 100) return Promise.resolve() }), unsubscribe: mockUnsubscribe, getPresence: jest.fn().mockResolvedValue([]), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) const { unmount } = render(<OnlineUsers />) await waitFor(() => { expect(mockClient.subscribe).toHaveBeenCalled() }) unmount() await waitFor(() => { expect(mockUnsubscribe).toHaveBeenCalledWith('presence') }) })
it('handles custom channel name', async () => { const { getRealtimeClient } = require('@/lib/realtime/client') const mockClient = { subscribe: jest.fn().mockResolvedValue(undefined), unsubscribe: jest.fn().mockResolvedValue(undefined), getPresence: jest.fn().mockResolvedValue([]), updatePresence: jest.fn().mockResolvedValue(undefined) }
getRealtimeClient.mockReturnValue(mockClient) render(<OnlineUsers channelName="custom-channel" />) await waitFor(() => { expect(mockClient.subscribe).toHaveBeenCalledWith( 'custom-channel', expect.any(Object) ) }) })
it('does not render when user is not authenticated', () => { ;(useAuth as jest.Mock).mockReturnValue({ user: null }) const { container } = render(<OnlineUsers />
)
expect(container.firstChild).toBeNull() }) })
