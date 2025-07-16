'use client' import Link from 'next/link' 
import { useRouter }
from 'next/navigation' 
import { ReactNode, MouseEvent }
from 'react' interface PreloadLinkProps { href: string children: ReactNode className?: string prefetch?: boolean onMouseEnter?: () => void onClick?: (e: MouseEvent<HTMLAnchorElement>) => void }
export function PreloadLink({ href, children, className, prefetch = true, onMouseEnter, onClick }: PreloadLinkProps) { const router = useRouter() const handleMouseEnter = () => { // 预加载路由 router.prefetch(href) onMouseEnter?.() }
return ( <Link href={href}
className={className}
prefetch={prefetch}
onMouseEnter={handleMouseEnter}
onClick={onClick} > {children} </Link> ) }