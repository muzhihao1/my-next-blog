/** * HydrationBoundary - Enhanced React 18 Hydration Manager for Next.js 15 * * This component addresses the link clicking issue by: * 1. Using React Suspense boundaries to handle hydration properly * 2. Providing fallback UI during hydration * 3. Ensuring proper event delegation after hydration completes * 4. Working seamlessly with existing LinkFixProviderProduction * * The issue: Links are initially unresponsive but become functional after typing in search box * Root cause: React 18 hydration and Next.js 15 event delegation timing issues */ 'use client' import { Suspense, useState, useEffect, useRef, useCallback, ErrorBoundary, ReactNode }
from 'react' 

import { usePathname }
from 'next/navigation' interface HydrationBoundaryProps { children: ReactNode fallback?: ReactNode onHydrationComplete?: () => void debug?: boolean }
/** * Error boundary component for handling hydration errors gracefully */
class HydrationErrorBoundary extends ErrorBoundary { constructor(props: { children: ReactNode; fallback?: ReactNode }) { super(props) this.state = { hasError: false }
}
static getDerivedStateFromError(error: Error) { // Update state so the next render will show the fallback UI console.error('Hydration Error:', error) return { hasError: true }
}
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { // Log error details for debugging console.error('Hydration Error Details:', { error, errorInfo }) }
render() { if ((this.state as any).hasError) { // Render fallback UI return ( <div className="hydration-error-fallback" role="alert"> {(this.props as any).fallback || this.props.children} </div> ) }
return this.props.children }
}/** * Inner component that handles the actual hydration logic */
function HydrationBoundaryInner({ children, onHydrationComplete, debug = false }: Omit<HydrationBoundaryProps, 'fallback'>) { const [isHydrated, setIsHydrated] = useState(false) const [hydrationAttempts, setHydrationAttempts] = useState(0) const pathname = usePathname() const hydrationTimeoutRef = useRef<NodeJS.Timeout>() const observerRef = useRef<MutationObserver>() /** * Force React to re-evaluate event handlers by triggering a subtle DOM change */
const forceEventDelegationUpdate = useCallback(() => { if (debug) console.log('🔄 HydrationBoundary: Forcing event delegation update') // Create a temporary hidden element that React will notice const trigger = document.createElement('div') trigger.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;' trigger.setAttribute('data-hydration-trigger', 'true') document.body.appendChild(trigger) // Force a reflow void trigger.offsetHeight // Remove after React has had a chance to process requestAnimationFrame(() => { trigger.remove() }) }, [debug]) /** * Verify that links are properly interactive */
const verifyLinkInteractivity = useCallback(() => { const links = document.querySelectorAll('a[href^="/"]') let interactiveCount = 0 links.forEach(link => { // Check if link has event listeners attached const hasListeners = !!(link as any)._reactEvents || !!(link as any).__reactInternalInstance || !!(link as any).__reactFiber if (hasListeners) { interactiveCount++ }
}) if (debug) { console.log(`🔍 HydrationBoundary: ${interactiveCount}/${links.length}
links interactive`) }
return interactiveCount === links.length }, [debug]) /** * Advanced hydration detection using multiple strategies */
const detectHydrationComplete = useCallback(() => { // Strategy 1: Check if React Fiber is attached to elements const checkReactFiber = () => { const rootElement = document.getElementById('__next') || document.body.firstElementChild return rootElement && ((rootElement as any).__reactFiber || (rootElement as any)._reactRootContainer) }
// Strategy 2: Check for Next.js specific hydration markers const checkNextHydration = () => { const hasNextData = !!document.getElementById('__NEXT_DATA__') const hasReactRoot = !!document.querySelector('[data-reactroot]') return hasNextData || hasReactRoot }
// Strategy 3: Check if links are interactive const linksInteractive = verifyLinkInteractivity() return checkReactFiber() && checkNextHydration() && linksInteractive }, [verifyLinkInteractivity]) /** * Monitor DOM for hydration completion */
useEffect(() => { if (debug) console.log('🚀 HydrationBoundary: Initializing hydration monitor') let mounted = true const checkHydration = () => { if (!mounted) return if (detectHydrationComplete()) { setIsHydrated(true) if (debug) console.log('✅ HydrationBoundary: Hydration complete') // Ensure event delegation is properly set up forceEventDelegationUpdate() // Notify parent component onHydrationComplete?.() // Clean up observer if (observerRef.current) { observerRef.current.disconnect() }
}
else { // Retry with exponential backoff const nextDelay = Math.min(100 * Math.pow(1.5, hydrationAttempts), 2000) setHydrationAttempts(prev => prev + 1) if (hydrationAttempts < 10) { hydrationTimeoutRef.current = setTimeout(checkHydration, nextDelay) }
else { // Force hydration after max attempts console.warn('⚠️ HydrationBoundary: Max attempts reached, forcing hydration') setIsHydrated(true) forceEventDelegationUpdate() }
} }
// Set up MutationObserver to detect DOM changes observerRef.current = new MutationObserver((mutations) => { // Look for React-specific attributes being added const hasReactChanges = mutations.some(mutation => { if (mutation.type === 'attributes') { const attr = mutation.attributeName || '' return attr.startsWith('data-react') || attr === 'data-hydrated' }
return false }) if (hasReactChanges && !isHydrated) { checkHydration() }
}) // Start observing observerRef.current.observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['data-reactroot', 'data-react-checksum', 'data-hydrated']
}) // Initial check checkHydration() // Fallback: Use standard hydration detection if (typeof window !== 'undefined') { // React 18 hydration typically completes after first paint requestIdleCallback(() => { if (!isHydrated && mounted) { checkHydration() }
}, { timeout: 1000 }) }
return () => { mounted = false if (hydrationTimeoutRef.current) { clearTimeout(hydrationTimeoutRef.current) }
if (observerRef.current) { observerRef.current.disconnect() }
} }, [detectHydrationComplete, forceEventDelegationUpdate, hydrationAttempts, isHydrated, onHydrationComplete, debug]) /** * Re-run hydration check on route changes */
useEffect(() => { if (isHydrated) { // Brief check to ensure links remain interactive after navigation setTimeout(() => { if (!verifyLinkInteractivity()) { if (debug) console.log('🔄 HydrationBoundary: Re-applying fixes after navigation') forceEventDelegationUpdate() }
}, 50) }
}, [pathname, isHydrated, verifyLinkInteractivity, forceEventDelegationUpdate, debug]) /** * Provide hydration status to children via data attribute */
return ( <div data-hydrated={isHydrated}
data-hydration-attempts={hydrationAttempts}
suppressHydrationWarning > {children} </div> ) }
/** * Main HydrationBoundary component with Suspense wrapper */
export function HydrationBoundary({ children, fallback, onHydrationComplete, debug = false }: HydrationBoundaryProps) { // Default fallback that maintains layout const defaultFallback = fallback || ( <div className="hydration-fallback" aria-busy="true" aria-label="加载中"> {/* Invisible placeholder to prevent layout shift */}
<div style={{ opacity: 0, pointerEvents: 'none' }
}> {children} </div> </div> ) return ( <HydrationErrorBoundary fallback={defaultFallback}>
<Suspense fallback={defaultFallback}>
<HydrationBoundaryInner onHydrationComplete={onHydrationComplete}
debug={debug} > {children} </HydrationBoundaryInner> </Suspense> </HydrationErrorBoundary> ) }
/** * Hook to check hydration status */
export function useHydrationStatus() { const [isHydrated, setIsHydrated] = useState(false) useEffect(() => { // Check for hydration marker const checkHydration = () => { const hydrationMarker = document.querySelector('[data-hydrated="true"]') setIsHydrated(!!hydrationMarker) }
checkHydration() // Set up observer for changes const observer = new MutationObserver(checkHydration) observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-hydrated']
}) return () => observer.disconnect() }, []) return isHydrated }