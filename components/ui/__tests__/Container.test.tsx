import { render, screen }
from '@testing-library/react' 
import Container, { PageContainer, ContentContainer }
from '../Container' describe('Container', () => { it('renders children correctly', () => { render( <Container>
<div>Test content</div> </Container>
)
expect(screen.getByText('Test content')).toBeInTheDocument() })
it('applies default size class (lg)', () => { const { container } = render( <Container>Content</Container>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('max-w-6xl') })
it('applies custom size classes', () => { const sizes = { sm: 'max-w-3xl', md: 'max-w-4xl', lg: 'max-w-6xl', xl: 'max-w-7xl', full: 'max-w-full' }
Object.entries(sizes).forEach(([size, expectedClass]) => { const { container } = render( <Container size={size as any}>Content</Container>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass(expectedClass) }) })
it('applies default padding classes', () => { const { container } = render( <Container>Content</Container>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8') })
it('removes padding when noPadding is true', () => { const { container } = render( <Container noPadding>Content</Container>
)
const containerDiv = container.firstChild expect(containerDiv).not.toHaveClass('px-4') expect(containerDiv).not.toHaveClass('sm:px-6') expect(containerDiv).not.toHaveClass('lg:px-8') })
it('applies custom className', () => { const { container } = render( <Container className="custom-class">Content</Container>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('custom-class') })
it('combines all classes correctly', () => { const { container } = render( <Container size="xl" className="custom-class"> Content </Container>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass( 'mx-auto', 'w-full', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', 'custom-class' ) })
it('renders complex nested content', () => { render( <Container>
<header>Header</header>
<main>
<h1>Title</h1>
<p>Paragraph</p> </main>
<footer>Footer</footer> </Container>
)
expect(screen.getByText('Header')).toBeInTheDocument() expect(screen.getByText('Title')).toBeInTheDocument() expect(screen.getByText('Paragraph')).toBeInTheDocument() expect(screen.getByText('Footer')).toBeInTheDocument() }) })
describe('PageContainer', () => { it('renders children correctly', () => { render( <PageContainer>
<div>Page content</div> </PageContainer>
)
expect(screen.getByText('Page content')).toBeInTheDocument() })
it('applies vertical padding', () => { const { container } = render( <PageContainer>Content</PageContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('py-16') })
it('uses default size lg', () => { const { container } = render( <PageContainer>Content</PageContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('max-w-6xl') })
it('accepts custom size prop', () => { const { container } = render( <PageContainer size="sm">Content</PageContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('max-w-3xl') })
it('combines custom className with default classes', () => { const { container } = render( <PageContainer className="custom-page-class">Content</PageContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('py-16', 'custom-page-class') })
it('always includes padding (no noPadding prop)', () => { const { container } = render( <PageContainer>Content</PageContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8') }) })
describe('ContentContainer', () => { it('renders children correctly', () => { render( <ContentContainer>
<div>Article content</div> </ContentContainer>
)
expect(screen.getByText('Article content')).toBeInTheDocument() })
it('uses sm size for readability', () => { const { container } = render( <ContentContainer>Content</ContentContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('max-w-3xl') })
it('applies vertical padding', () => { const { container } = render( <ContentContainer>Content</ContentContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('py-8') })
it('accepts custom className', () => { const { container } = render( <ContentContainer className="prose prose-lg">Content</ContentContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('py-8', 'prose', 'prose-lg') })
it('always includes horizontal padding', () => { const { container } = render( <ContentContainer>Content</ContentContainer>
)
const containerDiv = container.firstChild expect(containerDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8') })
it('renders markdown-like content structure', () => { render( <ContentContainer>
<h1>Article Title</h1>
<p>First paragraph</p>
<p>Second paragraph</p>
<blockquote>A quote</blockquote> </ContentContainer>
)
expect(screen.getByText('Article Title')).toBeInTheDocument() expect(screen.getByText('First paragraph')).toBeInTheDocument() expect(screen.getByText('Second paragraph')).toBeInTheDocument() expect(screen.getByText('A quote')).toBeInTheDocument() }) })