// Learn more: https://github.com/testing-library/jest-dom import '@testing-library/jest-dom' // Mock Next.js router jest.mock('next/navigation', () => ({ useRouter() { return { push: jest.fn(), replace: jest.fn(), refresh: jest.fn(), back: jest.fn(), forward: jest.fn(), prefetch: jest.fn(), }
}, usePathname() { return '' }, useSearchParams() { return new URLSearchParams() }, })) // Mock Next.js Image component jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => { // eslint-disable-next-line @next/next/no-img-element const { createElement } = require('react') return createElement('img', { ...props, alt: props.alt }) }, })) // Mock window.matchMedia Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), // deprecated removeListener: jest.fn(), // deprecated addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(), })), }) // Mock IntersectionObserver global.IntersectionObserver = class IntersectionObserver { constructor() {}
disconnect() {}
observe() {}
unobserve() {}
}
as any // Mock ResizeObserver global.ResizeObserver = class ResizeObserver { constructor() {}
disconnect() {}
observe() {}
unobserve() {}
}
as any // Suppress console errors in tests const originalError = console.error beforeAll(() => { console.error = (...args) => { if ( typeof args[0] === 'string' && (args[0].includes('Warning: ReactDOM.render') || args[0].includes('Received `false` for a non-boolean attribute') || args[0].includes('React does not recognize the') || args[0].includes('blurDataURL') || args[0].includes('An update to') && args[0].includes('was not wrapped in act')) ) { return }
originalError.call(console, ...args) }
}) afterAll(() => { console.error = originalError }) // Clean up after each test afterEach(() => { jest.clearAllMocks() })
