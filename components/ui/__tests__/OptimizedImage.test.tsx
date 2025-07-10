import { render, screen, fireEvent, waitFor }
from '@testing-library/react' 

import { OptimizedImage }
from '../OptimizedImage' describe('OptimizedImage', () => { it('renders image with correct props', () => { render( <OptimizedImage src="/test-image.jpg" alt="Test image" width={400}
height={300}
/>
)
const image = screen.getByRole('img', { name: 'Test image' }) expect(image).toBeInTheDocument() expect(image).toHaveAttribute('src', '/test-image.jpg') expect(image).toHaveAttribute('width', '400') expect(image).toHaveAttribute('height', '300') })
it('shows loading placeholder initially', () => { const { container } = render( <OptimizedImage src="/test-image.jpg" alt="Test image" width={400}
height={300}
/>
)
const loadingDiv = container.querySelector('.animate-pulse') expect(loadingDiv).toBeInTheDocument() })
it('removes loading state after image loads', async () => { const { container } = render( <OptimizedImage src="/test-image.jpg" alt="Test image" width={400}
height={300}
/>
)
const image = screen.getByRole('img') // Initially has opacity-0 expect(image).toHaveClass('opacity-0') // Simulate image load fireEvent.load(image) // Should now have opacity-100 await waitFor(() => { expect(image).toHaveClass('opacity-100') }) // Loading placeholder should be gone const loadingDiv = container.querySelector('.animate-pulse') expect(loadingDiv).not.toBeInTheDocument() })
it('shows error state when image fails to load', async () => { const { container } = render( <OptimizedImage src="/invalid-image.jpg" alt="Test image" width={400}
height={300}
/>
)
const image = screen.getByRole('img') // Simulate image error fireEvent.error(image) // Should show error placeholder await waitFor(() => { const errorPlaceholder = container.querySelector('svg') expect(errorPlaceholder).toBeInTheDocument() }) })
it('applies custom className to wrapper', () => { const { container } = render( <OptimizedImage src="/test-image.jpg" alt="Test image" width={400}
height={300}
className="custom-wrapper-class" />
)
const wrapper = container.firstChild expect(wrapper).toHaveClass('custom-wrapper-class') })
it('renders with fill prop', () => { const { container } = render( <OptimizedImage src="/test-image.jpg" alt="Test image" fill />
)
const wrapper = container.firstChild expect(wrapper).toHaveClass('w-full', 'h-full') const image = screen.getByRole('img') // Fill images should have object-cover class expect(image).toHaveClass('object-cover') // Fill prop means no width/height attributes expect(image).not.toHaveAttribute('width') expect(image).not.toHaveAttribute('height') })
it('calls onLoad callback when image loads', async () => { const onLoadMock = jest.fn() render( <OptimizedImage src="/test-image.jpg" alt="Test image" width={400}
height={300}
onLoad={onLoadMock}
/>
)
const image = screen.getByRole('img') fireEvent.load(image) await waitFor(() => { expect(onLoadMock).toHaveBeenCalledTimes(1) }) })
it('uses custom sizes prop when provided', () => { render( <OptimizedImage src="/test-image.jpg" alt="Test image" fill sizes="(max-width: 640px) 100vw, 50vw" />
)
const image = screen.getByRole('img') expect(image).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 50vw') }) })