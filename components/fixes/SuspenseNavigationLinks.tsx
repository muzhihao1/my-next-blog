'use client' import { Suspense, ReactNode, useEffect, useState }
from 'react' 

import { HydratedLink }
from './HydratedLink' /** * NavigationLinkWrapper - Wraps individual navigation links in Suspense boundaries * * This component ensures each navigation link is properly hydrated and interactive * by wrapping it in its own Suspense boundary. This addresses the issue where * links become unresponsive until another interactive element is triggered. */
interface NavigationLinkWrapperProps { href: string children: ReactNode className?: string onClick?: () => void }
function NavigationLinkWrapper({ href, children, className, onClick }: NavigationLinkWrapperProps) { return ( <Suspense fallback={ <span className={`inline-block ${className || ''}`}> {children} </span> } >
<HydratedLink href={href}
className={className}
onClick={onClick} > {children} </HydratedLink> </Suspense> ) }
/** * SuspenseNavigationLinks - Main component for navigation menus * * This component provides a solution for navigation links that are initially * unresponsive in Next.js 15. It uses React 18's streaming SSR capabilities * to ensure proper hydration of each link. * * Features: * - Individual Suspense boundaries for each link * - Lightweight and minimal performance impact * - Ensures links are interactive immediately after hydration * - Compatible with Next.js 15 App Router * * Usage: * ```tsx * <SuspenseNavigationLinks * links={[ * { href: '/', label: '首页' }, * { href: '/posts', label: '文章' }, * { href: '/about', label: '关于' } * ]
}* className="nav-link" * /> * ``` */
interface NavigationLink { href: string label: string onClick?: () => void }
interface SuspenseNavigationLinksProps { links: NavigationLink[]
className?: string containerClassName?: string orientation?: 'horizontal' | 'vertical' }
export function SuspenseNavigationLinks({ links, className = '', containerClassName = '', orientation = 'horizontal' }: SuspenseNavigationLinksProps) { // Track overall hydration state const [isNavigationReady, setIsNavigationReady] = useState(false) useEffect(() => { // Ensure navigation is ready after hydration const timer = setTimeout(() => { setIsNavigationReady(true) }, 0) return () => clearTimeout(timer) }, []) const containerStyles = orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2' return ( <nav className={`${containerStyles}
${containerClassName}`}
// Ensure the nav container is interactive style={{ pointerEvents: 'auto' }
}
// Add ARIA attributes for accessibility role="navigation" aria-label="Main navigation" > {links.map((link) => ( <NavigationLinkWrapper key={link.href}
href={link.href}
className={` ${className}
${!isNavigationReady ? 'navigation-loading' : ''} `}
onClick={link.onClick} > {link.label} </NavigationLinkWrapper> ))} </nav> ) }
/** * SingleSuspenseNavLink - For individual navigation links * * Use this component when you need to wrap a single navigation link * with Suspense boundary, rather than a group of links. */
export function SingleSuspenseNavLink({ href, children, className, onClick }: NavigationLinkWrapperProps) { return ( <NavigationLinkWrapper href={href}
className={className}
onClick={onClick} > {children} </NavigationLinkWrapper> ) }
// Export the HydratedLink component for direct use export { HydratedLink }