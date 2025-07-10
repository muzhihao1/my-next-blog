'use client' import { useEffect, useRef, useCallback }
from 'react' 

import { useAuth }
from '@/contexts/AuthContext' 

import { RealtimeChannel, RealtimeEvent, RealtimeConfig, UserPresence }
from '@/lib/realtime/config' 

import { getRealtimeClient, RealtimeClient }
from '@/lib/realtime/client' 

import { getEventManager, RealtimeEventManager }
from '@/lib/realtime/event-manager' interface UseRealtimeOptions { channel?: RealtimeChannel config?: Partial<RealtimeConfig> autoConnect?: boolean }
interface UseRealtimeReturn { isConnected: boolean subscribe: (event: RealtimeEvent, handler: (data: any) => void) => () => void publish: (channel: RealtimeChannel, event: RealtimeEvent, data: any) => Promise<void> getOnlineUsers: (channel: RealtimeChannel) => Promise<UserPresence[]> updatePresence: (channel: RealtimeChannel, presence: Partial<UserPresence>) => Promise<void> connect: () => Promise<void> disconnect: () => Promise<void> }
/** * Hook for using real-time features * Provides a simple interface to real-time functionality */
export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn { const { user } = useAuth() const { channel, config, autoConnect = true } = options const clientRef = useRef<RealtimeClient>() const eventManagerRef = useRef<RealtimeEventManager>() const isConnectedRef = useRef(false) const subscriptionsRef = useRef<(() => void)[]>([]) // Initialize clients useEffect(() => { clientRef.current = getRealtimeClient(config) eventManagerRef.current = getEventManager() }, [config]) // Auto-connect if enabled and user is authenticated useEffect(() => { if (autoConnect && user && channel) { connect() }
return () => { if (isConnectedRef.current) { disconnect() }
} }, [autoConnect, user, channel]) // Connect to channel const connect = useCallback(async () => { if (!clientRef.current || !channel || isConnectedRef.current) return try { await clientRef.current.subscribe(channel, { onConnect: () => { console.log(`Connected to realtime channel: ${channel}`) isConnectedRef.current = true }, onDisconnect: () => { console.log(`Disconnected from realtime channel: ${channel}`) isConnectedRef.current = false }, onError: (error) => { console.error(`Realtime channel error: ${channel}`, error) isConnectedRef.current = false }
}) }
catch (error) { console.error('Failed to connect to realtime:', error) }
}, [channel]) // Disconnect from channel const disconnect = useCallback(async () => { if (!clientRef.current || !channel) return try { // Unsubscribe all event listeners subscriptionsRef.current.forEach(unsub => unsub()) subscriptionsRef.current = [] // Disconnect from channel await clientRef.current.unsubscribe(channel) isConnectedRef.current = false }
catch (error) { console.error('Failed to disconnect from realtime:', error) }
}, [channel]) // Subscribe to events const subscribe = useCallback((event: RealtimeEvent, handler: (data: any) => void) => { if (!eventManagerRef.current) { console.warn('Event manager not initialized') return () => {}
}
const unsubscribe = eventManagerRef.current.subscribe(event, handler) subscriptionsRef.current.push(unsubscribe) // Return cleanup function return () => { const index = subscriptionsRef.current.indexOf(unsubscribe) if (index > -1) { subscriptionsRef.current.splice(index, 1) }
unsubscribe() }
}, []) // Publish events const publish = useCallback(async ( targetChannel: RealtimeChannel, event: RealtimeEvent, data: any ) => { if (!eventManagerRef.current) { throw new Error('Event manager not initialized') }
await eventManagerRef.current.publish(targetChannel, event, data) }, []) // Get online users const getOnlineUsers = useCallback(async (targetChannel: RealtimeChannel) => { if (!clientRef.current) { return []
}
return clientRef.current.getPresence(targetChannel) }, []) // Update presence const updatePresence = useCallback(async ( targetChannel: RealtimeChannel, presence: Partial<UserPresence> ) => { if (!clientRef.current) { throw new Error('Realtime client not initialized') }
await clientRef.current.updatePresence(targetChannel, presence) }, []) return { isConnected: isConnectedRef.current, subscribe, publish, getOnlineUsers, updatePresence, connect, disconnect }
}/** * Hook for subscribing to a specific real-time event */
export function useRealtimeEvent<T = any>( event: RealtimeEvent, handler: (data: T) => void, deps: React.DependencyList = [] ) { const { subscribe } = useRealtime() useEffect(() => { const unsubscribe = subscribe(event, handler) return unsubscribe }, [event, ...deps]) }
/** * Hook for managing online presence */
export function useOnlinePresence(channel: RealtimeChannel) { const { user } = useAuth() const { updatePresence, getOnlineUsers, subscribe } = useRealtime({ channel }) useEffect(() => { if (!user) return // Update presence on mount const userPresence: Partial<UserPresence> = { userId: user.id, username: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User', avatar: user.user_metadata?.avatar_url, status: 'online', lastSeen: Date.now() }
updatePresence(channel, userPresence) // Update presence periodically const interval = setInterval(() => { updatePresence(channel, { ...userPresence, lastSeen: Date.now() }) }, 30000) // Every 30 seconds // Update presence on visibility change const handleVisibilityChange = () => { if (document.visibilityState === 'visible') { updatePresence(channel, { ...userPresence, lastSeen: Date.now() }) }
}
document.addEventListener('visibilitychange', handleVisibilityChange) return () => { clearInterval(interval) document.removeEventListener('visibilitychange', handleVisibilityChange) // Update status to offline updatePresence(channel, { ...userPresence, status: 'offline' }) }
}, [user, channel]) return { getOnlineUsers } }