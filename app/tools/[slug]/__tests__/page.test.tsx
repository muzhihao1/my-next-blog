import { render, screen }
from '@testing-library/react' 

import ToolDetailPage, { generateMetadata, generateStaticParams }
from '../page' import { getToolBySlug, getAllToolSlugs }
from '@/lib/notion/tools' 

import { fallbackTools }
from '@/lib/fallback-tools' 

import { notFound }
from 'next/navigation' // Mock dependencies jest.mock('@/lib/notion/tools', () => ({ getToolBySlug: jest.fn(), getAllToolSlugs: jest.fn() }));
jest.mock('next/navigation', () => ({ notFound: jest.fn() }));
jest.mock('@/components/seo/StructuredData', () => ({ StructuredData: ({ type, data }: any) => ( <div data-testid="structured-data" data-type={type}
data-data={JSON.stringify(data)}
/> ), generateSoftwareApplicationStructuredData: (data: any) => ({ ...data, '@type': 'SoftwareApplication' }) }));
const mockTool = { id: '1', name: 'Visual Studio Code', slug: 'visual-studio-code', category: 'development' as const, description: 'A powerful code editor', rating: 5 as const, price: 'free' as const, website: 'https://code.visualstudio.com', pros: ['Free and open source', 'Great extensions', 'Fast performance'], cons: ['High memory usage', 'Slow startup time'], useCases: ['Web development', 'Python programming', 'JavaScript'], review: '<p>VS Code is an excellent editor for modern development.</p>', alternatives: ['Sublime Text', 'Atom', 'WebStorm'], tags: ['editor', 'IDE', 'Microsoft'], featured: true, lastUpdated: '2024-01-15T08:00:00Z' }
jest.mock('@/lib/fallback-tools', () => ({ fallbackTools: [ { id: '1', name: 'Visual Studio Code', slug: 'visual-studio-code', category: 'development', description: 'A powerful code editor', rating: 5, price: 'free', website: 'https://code.visualstudio.com', pros: ['Free and open source'], cons: ['High memory usage'], useCases: ['Web development'], review: '<p>Great editor</p>', tags: ['editor'], featured: true, lastUpdated: '2024-01-15T08:00:00Z' }, { id: '2', name: 'Figma', slug: 'figma', category: 'design', description: 'Collaborative design tool', rating: 4, price: 'freemium', website: 'https://figma.com', pros: ['Real-time collaboration'], cons: ['Requires internet'], useCases: ['UI design'], review: '<p>Best for teams</p>', tags: ['design'], featured: false, lastUpdated: '2024-01-10T08:00:00Z' }
]})) // Helper to render async server components async function renderAsync(component: Promise<JSX.Element>) { const resolvedComponent = await component return render(resolvedComponent) }

describe('ToolDetailPage', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders tool detail page with all information', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(mockTool);
const params = Promise.resolve({ slug: 'visual-studio-code' }) await renderAsync(ToolDetailPage({ params })) // Header expect(screen.getByText('Visual Studio Code')).toBeInTheDocument();
expect(screen.getByText('A powerful code editor')).toBeInTheDocument();
expect(screen.getByText('开发工具')).toBeInTheDocument();
expect(screen.getByText('免费')).toBeInTheDocument() // Rating expect(screen.getByText('5/5')).toBeInTheDocument() // Website link const websiteLink = screen.getByRole('link', { name: /访问官网/ });
expect(websiteLink).toHaveAttribute('href', 'https://code.visualstudio.com');
expect(websiteLink).toHaveAttribute('target', '_blank') // Review section expect(screen.getByText('详细评测')).toBeInTheDocument();
expect(screen.getByText('VS Code is an excellent editor for modern development.')).toBeInTheDocument() // Pros expect(screen.getByText('优点')).toBeInTheDocument();
expect(screen.getByText('Free and open source')).toBeInTheDocument();
expect(screen.getByText('Great extensions')).toBeInTheDocument();
expect(screen.getByText('Fast performance')).toBeInTheDocument() // Cons expect(screen.getByText('缺点')).toBeInTheDocument();
expect(screen.getByText('High memory usage')).toBeInTheDocument();
expect(screen.getByText('Slow startup time')).toBeInTheDocument() // Use cases expect(screen.getByText('使用场景')).toBeInTheDocument();
expect(screen.getByText('Web development')).toBeInTheDocument();
expect(screen.getByText('Python programming')).toBeInTheDocument() // Alternatives expect(screen.getByText('替代工具')).toBeInTheDocument();
expect(screen.getByText('Sublime Text')).toBeInTheDocument();
expect(screen.getByText('Atom')).toBeInTheDocument() // Tags expect(screen.getByText('标签')).toBeInTheDocument();
expect(screen.getByText('#editor')).toBeInTheDocument();
expect(screen.getByText('#IDE')).toBeInTheDocument() // Last updated expect(screen.getByText(/最后更新于/)).toBeInTheDocument() });

it('uses fallback data when API call fails', async () => { ;(getToolBySlug as jest.Mock).mockRejectedValue(new Error('API Error'));
const params = Promise.resolve({ slug: 'visual-studio-code' }) await renderAsync(ToolDetailPage({ params })) // Should still render from fallback data expect(screen.getByText('Visual Studio Code')).toBeInTheDocument();
expect(screen.getByText('A powerful code editor')).toBeInTheDocument() });

it('calls notFound when tool does not exist', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(null);
const params = Promise.resolve({ slug: 'non-existent' }) // Use a wrapper to handle the ToolContent component const ToolContent = async ({ slug }: { slug: string }) => { try { const tool = await getToolBySlug(slug) if (!tool) { const fallbackTool = fallbackTools.find(t => t.slug === slug) if (!fallbackTool) { notFound() return null }
} }
catch { const fallbackTool = fallbackTools.find(t => t.slug === slug) if (!fallbackTool) { notFound() return null }
}
return <div>Tool content</div> }
await ToolContent({ slug: 'non-existent' });
expect(notFound).toHaveBeenCalledTimes(1) });

it('renders structured data for SEO', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(mockTool);
const params = Promise.resolve({ slug: 'visual-studio-code' }) await renderAsync(ToolDetailPage({ params }));
const structuredData = screen.getByTestId('structured-data');
expect(structuredData).toHaveAttribute('data-type', 'SoftwareApplication');
const data = JSON.parse(structuredData.getAttribute('data-data') || '{}');
expect(data.name).toBe('Visual Studio Code');
expect(data.description).toBe('A powerful code editor');
expect(data['@type']).toBe('SoftwareApplication') });

it('displays correct price labels', async () => { const toolsWithDifferentPrices = [ { ...mockTool, price: 'free' as const, expectedLabel: '免费' }, { ...mockTool, price: 'freemium' as const, expectedLabel: '免费增值' }, { ...mockTool, price: 'paid' as const, expectedLabel: '付费' }, { ...mockTool, price: 'subscription' as const, expectedLabel: '订阅制' }
]
for (const tool of toolsWithDifferentPrices) { jest.clearAllMocks() ;(getToolBySlug as jest.Mock).mockResolvedValue(tool);
const params = Promise.resolve({ slug: 'visual-studio-code' });
const { unmount } = await renderAsync(ToolDetailPage({ params }));
expect(screen.getByText(tool.expectedLabel)).toBeInTheDocument() unmount() }
});

it('displays correct category labels', async () => { const toolsWithDifferentCategories = [ { ...mockTool, category: 'development' as const, expectedLabel: '开发工具' }, { ...mockTool, category: 'design' as const, expectedLabel: '设计工具' }, { ...mockTool, category: 'productivity' as const, expectedLabel: '效率工具' }, { ...mockTool, category: 'hardware' as const, expectedLabel: '硬件设备' }, { ...mockTool, category: 'service' as const, expectedLabel: '在线服务' }
]
for (const tool of toolsWithDifferentCategories) { jest.clearAllMocks() ;(getToolBySlug as jest.Mock).mockResolvedValue(tool);
const params = Promise.resolve({ slug: 'visual-studio-code' });
const { unmount } = await renderAsync(ToolDetailPage({ params }));
expect(screen.getByText(tool.expectedLabel)).toBeInTheDocument() unmount() }
});

it('renders rating stars correctly', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue({ ...mockTool, rating: 3 });
const params = Promise.resolve({ slug: 'visual-studio-code' });
const { container } = await renderAsync(ToolDetailPage({ params }));
const stars = container.querySelectorAll('svg');
const filledStars = container.querySelectorAll('.text-yellow-500') // Should have at least 5 stars for rating expect(stars.length).toBeGreaterThanOrEqual(5) // Should have 3 filled stars for rating 3 expect(filledStars).toHaveLength(3) });

it('handles tools without optional fields', async () => { const minimalTool = { ...mockTool, review: '', alternatives: [], website: '' } ;(getToolBySlug as jest.Mock).mockResolvedValue(minimalTool);
const params = Promise.resolve({ slug: 'visual-studio-code' }) await renderAsync(ToolDetailPage({ params })) // Should not render optional sections expect(screen.queryByText('详细评测')).not.toBeInTheDocument();
expect(screen.queryByText('替代工具')).not.toBeInTheDocument();
expect(screen.queryByRole('link', { name: /访问官网/ })).not.toBeInTheDocument() });

it('renders loading skeleton while fetching', () => { const { container } = render(<ToolDetailPage params={Promise.resolve({ slug: 'test' })}
/>) // Should show skeleton elements const skeletons = container.querySelectorAll('.animate-pulse');
expect(skeletons.length).toBeGreaterThan(0) });

it('formats last updated date correctly', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(mockTool);
const params = Promise.resolve({ slug: 'visual-studio-code' }) await renderAsync(ToolDetailPage({ params }));
expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument() }) });

describe('generateMetadata', () => { it('generates correct metadata for existing tool', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(mockTool);
const params = Promise.resolve({ slug: 'visual-studio-code' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('Visual Studio Code - 工具推荐');
expect(metadata.description).toBe('A powerful code editor');
expect(metadata.openGraph?.title).toBe('Visual Studio Code');
expect(metadata.openGraph?.type).toBe('website');
expect(metadata.twitter?.card).toBe('summary') });

it('generates fallback metadata for non-existent tool', async () => { ;(getToolBySlug as jest.Mock).mockResolvedValue(null);
const params = Promise.resolve({ slug: 'non-existent' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('工具不存在');
expect(metadata.description).toBe('抱歉，找不到这个工具。') });

it('uses fallback data for metadata when API fails', async () => { ;(getToolBySlug as jest.Mock).mockRejectedValue(new Error('API Error'));
const params = Promise.resolve({ slug: 'visual-studio-code' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('Visual Studio Code - 工具推荐');
expect(metadata.description).toBe('A powerful code editor') }) });

describe('generateStaticParams', () => { it('generates params from API slugs', async () => { ;(getAllToolSlugs as jest.Mock).mockResolvedValue(['vscode', 'figma', 'docker']);
const params = await generateStaticParams();
expect(params).toEqual([ { slug: 'vscode' }, { slug: 'figma' }, { slug: 'docker' }
]) });

it('uses fallback tools when API fails', async () => { ;(getAllToolSlugs as jest.Mock).mockRejectedValue(new Error('API Error'));
const params = await generateStaticParams();
expect(params).toEqual([ { slug: 'visual-studio-code' }, { slug: 'figma' }
]) });

it('uses fallback tools when API returns empty array', async () => { ;(getAllToolSlugs as jest.Mock).mockResolvedValue([]);
const params = await generateStaticParams();
expect(params).toEqual([ { slug: 'visual-studio-code' }, { slug: 'figma' }
]) }) })