import { render, screen, waitFor, act }
from "@testing-library/react";
import LazyLoad from "../LazyLoad";
// Mock IntersectionObserver let mockObserverInstance: any let observerCallback: IntersectionObserverCallback let observedElements: Element[] = []
class MockIntersectionObserver { constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) { observerCallback = callback mockObserverInstance = this }
observe(element: Element) { observedElements.push(element) }
disconnect() { observedElements = []
}
unobserve(element: Element) { observedElements = observedElements.filter(el => el !== element) }
}
// @ts-ignore global.IntersectionObserver = MockIntersectionObserver // Helper to trigger intersection const triggerIntersection = (isIntersecting: boolean) => { const entries = observedElements.map(target => ({ isIntersecting, target, intersectionRatio: isIntersecting ? 1 : 0, boundingClientRect: {}
as DOMRectReadOnly, intersectionRect: {}
as DOMRectReadOnly, rootBounds: {}
as DOMRectReadOnly, time: Date.now() })) observerCallback(entries, mockObserverInstance) }

describe('LazyLoad', () => { beforeEach(() => { observedElements = []
jest.clearAllMocks() })
it('renders placeholder initially', () => { const { container } = render( <LazyLoad>
<div>Lazy loaded content</div> </LazyLoad> ) // Should show default placeholder const placeholder = container.querySelector('.animate-pulse') expect(placeholder).toBeInTheDocument() expect(placeholder).toHaveClass('bg-gray-100', "", 'rounded-lg') // Should not show content yet expect(screen.queryByText('Lazy loaded content')).not.toBeInTheDocument() })
it('renders custom placeholder when provided', () => { render( <LazyLoad placeholder={<div>Loading...</div>}>
<div>Content</div> </LazyLoad>
)
expect(screen.getByText('Loading...')).toBeInTheDocument() expect(screen.queryByText('Content')).not.toBeInTheDocument() })
it('renders children when intersection is triggered', async () => { render( <LazyLoad>
<div>Visible content</div> </LazyLoad> ) // Initially shows placeholder expect(screen.queryByText('Visible content')).not.toBeInTheDocument() // Trigger intersection act(() => { triggerIntersection(true) }) // Should now show content await waitFor(() => { expect(screen.getByText('Visible content')).toBeInTheDocument() }) })
it('calls onVisible callback when becoming visible', async () => { const onVisibleMock = jest.fn() render( <LazyLoad onVisible={onVisibleMock}>
<div>Content</div> </LazyLoad>
)
expect(onVisibleMock).not.toHaveBeenCalled() // Trigger intersection act(() => { triggerIntersection(true) }) await waitFor(() => { expect(onVisibleMock).toHaveBeenCalledTimes(1) }) })
it('disconnects observer after becoming visible', async () => { const disconnectSpy = jest.spyOn(MockIntersectionObserver.prototype, 'disconnect') render( <LazyLoad>
<div>Content</div> </LazyLoad> ) // Trigger intersection act(() => { triggerIntersection(true) }) await waitFor(() => { expect(disconnectSpy).toHaveBeenCalled() }) })
it('uses custom threshold and rootMargin', () => { const observerSpy = jest.fn().mockImplementation((callback, options) => { return new MockIntersectionObserver(callback, options) }) // @ts-ignore global.IntersectionObserver = observerSpy render( <LazyLoad threshold={0.5}
rootMargin="100px">
<div>Content</div> </LazyLoad>
)
expect(observerSpy).toHaveBeenCalledWith( expect.any(Function), { threshold: 0.5, rootMargin: '100px' } ) // Restore // @ts-ignore global.IntersectionObserver = MockIntersectionObserver })
it('observes the container element', () => { const observeSpy = jest.spyOn(MockIntersectionObserver.prototype, 'observe') const { container } = render( <LazyLoad>
<div>Content</div> </LazyLoad>
)
const containerElement = container.firstChild expect(observeSpy).toHaveBeenCalledWith(containerElement) })
it('cleans up observer on unmount', () => { const disconnectSpy = jest.spyOn(MockIntersectionObserver.prototype, 'disconnect') const { unmount } = render( <LazyLoad>
<div>Content</div> </LazyLoad> ) unmount() expect(disconnectSpy).toHaveBeenCalled() })
it('does not trigger multiple times', async () => { const onVisibleMock = jest.fn() render( <LazyLoad onVisible={onVisibleMock}>
<div>Content</div> </LazyLoad> ) // Trigger intersection multiple times act(() => { triggerIntersection(true) triggerIntersection(true) triggerIntersection(true) }) await waitFor(() => { // Should only be called once due to disconnect expect(onVisibleMock).toHaveBeenCalledTimes(1) }) })
it('does not render children when not intersecting', async () => { render( <LazyLoad>
<div>Hidden content</div> </LazyLoad> ) // Trigger non-intersection act(() => { triggerIntersection(false) }) // Should still show placeholder await waitFor(() => { expect(screen.queryByText('Hidden content')).not.toBeInTheDocument() }) })
it('handles null container ref gracefully', () => { // Temporarily override ref to be null const originalRef = Object.getOwnPropertyDescriptor(HTMLDivElement.prototype, 'offsetParent') Object.defineProperty(HTMLDivElement.prototype, 'offsetParent', { get: () => null, configurable: true }) const observeSpy = jest.spyOn(MockIntersectionObserver.prototype, 'observe') render( <LazyLoad>
<div>Content</div> </LazyLoad> ) // Should still call observe (React handles ref assignment) expect(observeSpy).toHaveBeenCalled() // Restore if (originalRef) { Object.defineProperty(HTMLDivElement.prototype, 'offsetParent', originalRef) }
}) })
