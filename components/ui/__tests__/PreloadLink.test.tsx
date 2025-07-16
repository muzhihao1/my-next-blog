import { render, screen, fireEvent }
from "@testing-library/react";
import { PreloadLink }
from "../PreloadLink";
// Mock router functions const mockPrefetch = jest.fn() const mockPush = jest.fn() // Mock next/navigation jest.mock('next/navigation', () => ({ useRouter: () => ({ prefetch: mockPrefetch, push: mockPush, replace: jest.fn(), refresh: jest.fn(), back: jest.fn(), forward: jest.fn(), }), usePathname: () => '', useSearchParams: () => new URLSearchParams(), })) // Mock next/link jest.mock('next/link', () => { const React = require('react') return React.forwardRef<HTMLAnchorElement, any>( ({ children, href, className, prefetch, onMouseEnter, onClick, ...props }: any, ref: any) => ( <a ref={ref}
href={href}
className={className}
data-prefetch={prefetch}
onMouseEnter={onMouseEnter}
onClick={onClick} {...props} > {children} </a> ) ) })
describe('PreloadLink', () => { beforeEach(() => { jest.clearAllMocks() })
it('renders link with children', () => { render( <PreloadLink href="/test"> Test Link </PreloadLink>
)
const link = screen.getByRole('link', { name: 'Test Link' }) expect(link).toBeInTheDocument() expect(link).toHaveAttribute('href', '/test') })
it('applies custom className', () => { render( <PreloadLink href="/test" className="custom-link-class"> Link </PreloadLink>
)
const link = screen.getByRole('link') expect(link).toHaveClass('custom-link-class') })
it('prefetches route on mouse enter', () => { render( <PreloadLink href="/about"> About </PreloadLink>
)
const link = screen.getByRole('link') fireEvent.mouseEnter(link) expect(mockPrefetch).toHaveBeenCalledWith('/about') })
it('calls custom onMouseEnter handler', () => { const customHandler = jest.fn() render( <PreloadLink href="/test" onMouseEnter={customHandler}> Test </PreloadLink>
)
const link = screen.getByRole('link') fireEvent.mouseEnter(link) expect(customHandler).toHaveBeenCalled() expect(mockPrefetch).toHaveBeenCalledWith('/test') })
it('calls custom onClick handler', () => { const customClick = jest.fn() render( <PreloadLink href="/test" onClick={customClick}> Test </PreloadLink>
)
const link = screen.getByRole('link') fireEvent.click(link) expect(customClick).toHaveBeenCalled() })
it('sets prefetch prop to true by default', () => { render( <PreloadLink href="/test"> Test </PreloadLink>
)
const link = screen.getByRole('link') expect(link).toHaveAttribute('data-prefetch', 'true') })
it('allows disabling prefetch', () => { render( <PreloadLink href="/test" prefetch={false}> Test </PreloadLink>
)
const link = screen.getByRole('link') expect(link).toHaveAttribute('data-prefetch', 'false') })
it('renders complex children', () => { render( <PreloadLink href="/test">
<span>Icon</span>
<span>Text</span> </PreloadLink>
)
expect(screen.getByText('Icon')).toBeInTheDocument() expect(screen.getByText('Text')).toBeInTheDocument() })
it('handles external URLs', () => { render( <PreloadLink href="https://example.com"> External Link </PreloadLink>
)
const link = screen.getByRole('link') expect(link).toHaveAttribute('href', 'https://example.com') fireEvent.mouseEnter(link) expect(mockPrefetch).toHaveBeenCalledWith('https://example.com') })
it('handles hash links', () => { render( <PreloadLink href="#section"> Hash Link </PreloadLink>
)
const link = screen.getByRole('link') expect(link).toHaveAttribute('href', '#section') fireEvent.mouseEnter(link) expect(mockPrefetch).toHaveBeenCalledWith('#section') })
it('prefetches only once on multiple mouse enters', () => { render( <PreloadLink href="/test"> Test </PreloadLink>
)
const link = screen.getByRole('link') // Multiple mouse enters fireEvent.mouseEnter(link) fireEvent.mouseEnter(link) fireEvent.mouseEnter(link) // Router.prefetch is called each time (Next.js handles deduplication) expect(mockPrefetch).toHaveBeenCalledTimes(3) expect(mockPrefetch).toHaveBeenCalledWith('/test') })
it('passes event object to onClick handler', () => { const customClick = jest.fn() render( <PreloadLink href="/test" onClick={customClick}> Test </PreloadLink>
)
const link = screen.getByRole('link') const clickEvent = new MouseEvent('click', { bubbles: true }) fireEvent(link, clickEvent) expect(customClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' })) })
it('does not call onMouseEnter if not provided', () => { render( <PreloadLink href="/test"> Test </PreloadLink>
)
const link = screen.getByRole('link') // Should not throw error expect(() => fireEvent.mouseEnter(link)).not.toThrow() })
it('maintains link functionality with prefetch', () => { render( <PreloadLink href="/posts/123"> Read Post </PreloadLink>
)
const link = screen.getByRole('link', { name: 'Read Post' }) // Verify it's still a proper link expect(link.tagName).toBe('A') expect(link).toHaveAttribute('href', '/posts/123') }) })
