'use client' import { useState }
from 'react' 

import Link from 'next/link' 

import { usePathname }
from 'next/navigation' 

import { NotificationCenter }
from '@/components/realtime/NotificationCenter' 

import AuthButton from '@/components/auth/AuthButton' const navigation = [ { name: '首页', href: '/' }, { name: '项目', href: '/projects' }, { name: '博客', href: '/blog' }, { name: '书架', href: '/bookshelf' }, { name: '工具', href: '/tools' }, { name: '关于', href: '/about' }, { name: '订阅', href: '/subscribe' }, ]
export function Header() { const [mobileMenuOpen, setMobileMenuOpen] = useState(false) const pathname = usePathname() const isActive = (path: string) => { if (path === '/' && pathname === '/') return true if (path !== '/' && pathname.startsWith(path)) return true return false }
return ( <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16"> {/* Logo */}
<Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors" > 数字花园 </Link> {/* Desktop Navigation */}
<nav id="main-navigation" className="hidden md:flex items-center space-x-8" aria-label="主导航"> {navigation.map((item) => ( <Link key={item.name}
href={item.href}
aria-current={isActive(item.href) ? 'page' : undefined}
className={`text-sm font-medium transition-colors duration-200 ${ isActive(item.href) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900' }`} > {item.name} </Link> ))} </nav> {/* Right Actions */}
<div className="flex items-center gap-2 md:gap-4"> {/* Notifications */}
<NotificationCenter /> {/* Auth Button - Hidden on mobile */}
<div className="hidden md:block">
<AuthButton /> </div> {/* Mobile Menu Button */}
<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100" aria-label="菜单" >
<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
/> </svg> </button> </div> </div> </div> {/* Mobile Menu */} {mobileMenuOpen && ( <div className="md:hidden bg-white border-t border-gray-200">
<div className="px-4 py-4"> {/* Mobile Navigation */}
<nav className="space-y-2 mb-4"> {navigation.map((item) => ( <Link key={item.name}
href={item.href}
onClick={() => setMobileMenuOpen(false)}
className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${ isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }`} > {item.name} </Link> ))} </nav> {/* Mobile Auth Button */}
<div className="pt-4 border-t border-gray-200">
<AuthButton /> </div> </div> </div> )} </header> ) }