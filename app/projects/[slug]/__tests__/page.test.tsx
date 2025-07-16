import { render, screen }
from '@testing-library/react' 

import ProjectDetailPage, { generateStaticParams, generateMetadata }
from '../page' import { getProjects, getProjectBySlug }
from '@/lib/notion/projects' 

import { notFound }
from 'next/navigation' // Mock dependencies jest.mock('@/lib/notion/projects', () => ({ getProjects: jest.fn(), getProjectBySlug: jest.fn() }));
const mockProjects = [ { id: '1', title: 'Test Project', slug: 'test-project', description: 'A comprehensive test project', content: '# Project Overview\n\nThis is the project content in **markdown**.', thumbnail: '/images/project-thumb.jpg', category: 'website', techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], status: 'active' as const, featured: true, startDate: '2024-01-01', endDate: '2024-06-01', demoUrl: 'https://demo.example.com', githubUrl: 'https://github.com/user/project', tags: ['frontend', 'fullstack', 'responsive'], screenshots: ['/screenshot1.jpg', '/screenshot2.jpg'], keyFeatures: ['Real-time updates', 'Mobile responsive', 'Dark mode support'], developmentProcess: 'We used agile methodology with 2-week sprints', codeSnippets: [ { filename: 'app.tsx', language: 'typescript', code: 'const App = () =>
<div>Hello</div>' }
], challenges: ['Performance optimization', 'Cross-browser compatibility'], solutions: ['Implemented lazy loading', 'Used polyfills for older browsers'], metrics: { users: 5000, performance: '95/100 Lighthouse score', achievement: 'Featured on Product Hunt' }
}, { id: '2', title: 'Minimal Project', slug: 'minimal-project', description: 'A project with minimal fields', content: 'Simple content', category: 'opensource', techStack: ['Python'], status: 'completed' as const, featured: false, startDate: '2023-01-01' }
]
jest.mock('@/lib/fallback-projects', () => { const projects = [ { id: '1', title: 'Test Project', slug: 'test-project', description: 'A comprehensive test project', content: '# Project Overview\n\nThis is the project content in **markdown**.', thumbnail: '/images/project-thumb.jpg', category: 'website', techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], status: 'active' as const, featured: true, startDate: '2024-01-01', endDate: '2024-06-01', demoUrl: 'https://demo.example.com', githubUrl: 'https://github.com/user/project', tags: ['frontend', 'fullstack', 'responsive'], screenshots: ['/screenshot1.jpg', '/screenshot2.jpg'], keyFeatures: ['Real-time updates', 'Mobile responsive', 'Dark mode support'], developmentProcess: 'We used agile methodology with 2-week sprints', codeSnippets: [ { filename: 'app.tsx', language: 'typescript', code: 'const App = () =>
<div>Hello</div>' }
], challenges: ['Performance optimization', 'Cross-browser compatibility'], solutions: ['Implemented lazy loading', 'Used polyfills for older browsers'], metrics: { users: 5000, performance: '95/100 Lighthouse score', achievement: 'Featured on Product Hunt' }
}, { id: '2', title: 'Minimal Project', slug: 'minimal-project', description: 'A project with minimal fields', content: 'Simple content', category: 'opensource', techStack: ['Python'], status: 'completed' as const, featured: false, startDate: '2023-01-01' }
]
return { fallbackProjects: projects }
}) jest.mock('next/navigation', () => ({ notFound: jest.fn() }));
jest.mock('next/link', () => { return ({ children, href, ...props }: any) => ( <a href={href} {...props}>{children}</a> ) }) jest.mock('next/image', () => { return function Image({ src, alt, fill, ...props }: any) { return <img src={src}
alt={alt} {...props}
/> }
}) jest.mock('remark', () => ({ remark: () => ({ use: () => ({ process: async (content: string) => ({ toString: () => `<h1>Project Overview</h1>
<p>This is the project content in <strong>markdown</strong>.</p>` }) }) }) })) // Mock child components jest.mock('@/components/seo/StructuredData', () => ({ StructuredData: ({ type, data }: any) => ( <script type="application/ld+json" data-type={type}> {JSON.stringify(data)} </script> ) }));
jest.mock('@/components/features/CodeSnippet', () => ({ CodeSnippet: ({ files }: any) => ( <div data-testid="code-snippet"> {files.map((file: any, idx: number) => ( <div key={idx}
data-filename={file.filename}> {file.code} </div> ))} </div> ) }));
jest.mock('@/components/features/SocialShare', () => ({ SocialShare: ({ url, title, description, tags }: any) => ( <div data-testid="social-share" data-url={url}
data-title={title}> Social Share </div> ) }));
jest.mock('@/components/features/TagList', () => { return function TagList({ tags, size }: any) { return ( <div data-testid="tag-list" data-size={size}> {tags.map((tag: string) => ( <span key={tag}
className="tag">{tag}</span> ))} </div> ) }
}) jest.mock('@/components/features/FavoriteButton', () => ({ __esModule: true, default: ({ itemId, itemType, size }: any) => ( <button data-testid="favorite-button" data-item-id={itemId}
data-size={size}> Favorite </button> ) }));
describe('Project Detail Page', () => { beforeEach(() => { jest.clearAllMocks() process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com' });

describe('generateStaticParams', () => { it('returns slugs from getProjects when available', async () => { ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const result = await generateStaticParams();
expect(result).toEqual([ { slug: 'test-project' }, { slug: 'minimal-project' }
]) });

it('returns fallback slugs when getProjects returns empty', async () => { ;(getProjects as jest.Mock).mockResolvedValue([]);
const result = await generateStaticParams();
expect(result).toEqual([ { slug: 'test-project' }, { slug: 'minimal-project' }
]) }) });

describe('generateMetadata', () => { it('generates metadata for existing project from API', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]);
const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'test-project' }) });
expect(metadata.title).toBe('Test Project - 项目展示');
expect(metadata.description).toBe('A comprehensive test project');
expect(metadata.openGraph).toMatchObject({ title: 'Test Project', description: 'A comprehensive test project', type: 'website', images: ['/images/project-thumb.jpg']
}) });

it('generates metadata from fallback when API returns null', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(null);
const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'test-project' }) });
expect(metadata.title).toBe('Test Project - 项目展示');
expect(metadata.description).toBe('A comprehensive test project') });

it('generates 404 metadata for non-existent project', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(null);
const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) });
expect(metadata.title).toBe('项目不存在');
expect(metadata.description).toBe('抱歉，找不到这个项目。') }) });

describe('Project Component', () => { it('renders complete project with all features', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) })) // Basic info expect(screen.getByText('Test Project')).toBeInTheDocument();
expect(screen.getByText('A comprehensive test project')).toBeInTheDocument() // Status badges expect(screen.getByText('进行中')).toBeInTheDocument();
expect(screen.getByText('精选项目')).toBeInTheDocument() // Tags expect(screen.getByText('frontend')).toBeInTheDocument();
expect(screen.getByText('fullstack')).toBeInTheDocument();
expect(screen.getByText('responsive')).toBeInTheDocument() // External links const demoLink = screen.getByRole('link', { name: /在线演示/ });
expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
expect(demoLink).toHaveAttribute('target', '_blank');
const githubLink = screen.getByRole('link', { name: /查看源码/ });
expect(githubLink).toHaveAttribute('href', 'https://github.com/user/project') // Tech stack expect(screen.getByText('React')).toBeInTheDocument();
expect(screen.getByText('TypeScript')).toBeInTheDocument();
expect(screen.getByText('Next.js')).toBeInTheDocument();
expect(screen.getByText('Tailwind CSS')).toBeInTheDocument() // Timeline expect(screen.getByText('开始时间')).toBeInTheDocument();
expect(screen.getByText('结束时间')).toBeInTheDocument() // Metrics expect(screen.getByText('5,000')).toBeInTheDocument() // users expect(screen.getByText('95/100 Lighthouse score')).toBeInTheDocument();
expect(screen.getByText('Featured on Product Hunt')).toBeInTheDocument() // Screenshots expect(screen.getByAltText('Test Project 截图 1')).toHaveAttribute('src', '/screenshot1.jpg');
expect(screen.getByAltText('Test Project 截图 2')).toHaveAttribute('src', '/screenshot2.jpg') // Key features expect(screen.getByText('Real-time updates')).toBeInTheDocument();
expect(screen.getByText('Mobile responsive')).toBeInTheDocument();
expect(screen.getByText('Dark mode support')).toBeInTheDocument() // Development process expect(screen.getByText('We used agile methodology with 2-week sprints')).toBeInTheDocument() // Code snippets expect(screen.getByTestId('code-snippet')).toBeInTheDocument() // Challenges and solutions expect(screen.getByText('Performance optimization')).toBeInTheDocument();
expect(screen.getByText('Implemented lazy loading')).toBeInTheDocument() });

it('renders minimal project without optional fields', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[1]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'minimal-project' }) }));
expect(screen.getByText('Minimal Project')).toBeInTheDocument();
expect(screen.getByText('已完成')).toBeInTheDocument() // Should not render optional sections expect(screen.queryByText('精选项目')).not.toBeInTheDocument();
expect(screen.queryByText('结束时间')).not.toBeInTheDocument();
expect(screen.queryByRole('link', { name: /在线演示/ })).not.toBeInTheDocument();
expect(screen.queryByRole('link', { name: /查看源码/ })).not.toBeInTheDocument();
expect(screen.queryByText('项目截图')).not.toBeInTheDocument();
expect(screen.queryByText('主要功能')).not.toBeInTheDocument();
expect(screen.queryByText('项目成果')).not.toBeInTheDocument();
expect(screen.queryByTestId('code-snippet')).not.toBeInTheDocument();
expect(screen.queryByText('技术挑战与解决方案')).not.toBeInTheDocument() });

it('calls notFound when project does not exist', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(null) await ProjectDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) });
expect(notFound).toHaveBeenCalled() });

it('falls back to fallbackProjects when API returns null', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(null) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
expect(screen.getByText('Test Project')).toBeInTheDocument() });

it('renders back link correctly', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
const backLink = screen.getByRole('link', { name: /返回项目列表/ });
expect(backLink).toHaveAttribute('href', '/projects') });

it('renders social share with correct props', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
const socialShare = screen.getByTestId('social-share');
expect(socialShare).toHaveAttribute('data-url', 'https://example.com/projects/test-project');
expect(socialShare).toHaveAttribute('data-title', 'Test Project') });

it('renders favorite button with correct props', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
const favoriteButton = screen.getByTestId('favorite-button');
expect(favoriteButton).toHaveAttribute('data-item-id', '1');
expect(favoriteButton).toHaveAttribute('data-size', 'medium') });

it('applies correct status badge styles', async () => { const activeProject = { ...mockProjects[1], status: 'active' as const };
const completedProject = { ...mockProjects[1], status: 'completed' as const };
const archivedProject = { ...mockProjects[1], status: 'archived' as const }
// Test active status ;(getProjectBySlug as jest.Mock).mockResolvedValue(activeProject);
const { rerender } = render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test' }) }));
expect(screen.getByText('进行中')).toHaveClass('bg-green-100', 'text-green-700') // Test completed status ;(getProjectBySlug as jest.Mock).mockResolvedValue(completedProject) rerender(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test' }) }));
expect(screen.getByText('已完成')).toHaveClass('bg-blue-100', 'text-blue-700') // Test archived status ;(getProjectBySlug as jest.Mock).mockResolvedValue(archivedProject) rerender(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test' }) }));
expect(screen.getByText('已归档')).toHaveClass('bg-gray-100', 'text-gray-700') });

it('renders markdown content as HTML', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]);
const { container } = render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
const contentDiv = container.querySelector('.prose');
expect(contentDiv).toHaveProperty('innerHTML', expect.stringContaining('<h1>Project Overview</h1>'));
expect(contentDiv).toHaveProperty('innerHTML', expect.stringContaining('<strong>markdown</strong>')) });

it('formats dates correctly', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]) render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) })) // Check that dates are formatted expect(screen.getByText('2024/1/1')).toBeInTheDocument() // Start date expect(screen.getByText('2024/6/1')).toBeInTheDocument() // End date });

it('renders structured data correctly', async () => { ;(getProjectBySlug as jest.Mock).mockResolvedValue(mockProjects[0]);
const { container } = render(await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) }));
const structuredData = container.querySelector('script[type="application/ld+json"]');
expect(structuredData).toHaveAttribute('data-type', 'SoftwareApplication');
const data = JSON.parse(structuredData?.textContent || '{}');
expect(data).toMatchObject({ name: 'Test Project', description: 'A comprehensive test project', url: 'https://example.com/projects/test-project', image: '/images/project-thumb.jpg', dateCreated: '2024-01-01', applicationCategory: 'website' }) }) }) })