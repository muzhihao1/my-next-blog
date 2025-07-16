import { render, screen }
from '@testing-library/react' 

import TagDetailPage, { generateMetadata, generateStaticParams }
from '../page' import { getPosts }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { notFound }
from 'next/navigation' // Mock dependencies jest.mock('@/lib/notion', () => ({ getPosts: jest.fn() }));
jest.mock('@/lib/notion/projects', () => ({ getProjects: jest.fn() }));
jest.mock('next/navigation', () => ({ notFound: jest.fn() }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href, className }: any) => ( <a href={href}
className={className}> {children} </a> ) }));
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, fill, className }: any) => ( <img src={src}
alt={alt}
className={className}
data-fill={fill}
/> ) }));
const mockPosts = [ { id: '1', title: 'Next.js Guide', slug: 'nextjs-guide', excerpt: 'Learn Next.js basics', tags: ['Next.js', 'React', 'JavaScript'], date: '2024-01-15', readTime: '5 min', category: 'Frontend', cover: '/images/post1.jpg' }, { id: '2', title: 'React Hooks', slug: 'react-hooks', excerpt: 'Deep dive into hooks', tags: ['React', 'JavaScript'], date: '2024-01-10', readTime: '8 min', category: 'Frontend' }, { id: '3', title: 'Node.js Basics', slug: 'nodejs-basics', excerpt: 'Getting started with Node.js', tags: ['Node.js', 'Backend'], date: '2024-01-05', readTime: '6 min', category: 'Backend', cover: '/images/post3.jpg' }
]
const mockProjects = [ { id: 'p1', title: 'E-commerce Platform', slug: 'ecommerce-platform', description: 'Modern e-commerce solution', tags: ['React', 'Node.js', 'MongoDB'], startDate: '2023-06-01', status: 'completed', thumbnail: '/images/project1.jpg' }, { id: 'p2', title: 'Blog Engine', slug: 'blog-engine', description: 'Static blog generator', tags: ['Next.js', 'TypeScript'], startDate: '2023-08-01', status: 'active' }
]
jest.mock('@/lib/fallback-posts', () => ({ fallbackPosts: []
}));
jest.mock('@/lib/fallback-projects', () => ({ fallbackProjects: []
}));
describe('TagDetailPage', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders tag detail page with posts and projects', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' }) render(await TagDetailPage({ params })) // Header expect(screen.getByText('#React')).toBeInTheDocument();
expect(screen.getByText('共 3 个相关内容')).toBeInTheDocument() // Posts section expect(screen.getByText('文章 (2)')).toBeInTheDocument();
expect(screen.getByText('Next.js Guide')).toBeInTheDocument();
expect(screen.getByText('React Hooks')).toBeInTheDocument() // Projects section expect(screen.getByText('项目 (1)')).toBeInTheDocument();
expect(screen.getByText('E-commerce Platform')).toBeInTheDocument() });

it('handles encoded tag names', async () => { const postsWithEncodedTags = [{ ...mockPosts[0], tags: ['C++', 'Node.js']
}
];(getPosts as jest.Mock).mockResolvedValue(postsWithEncodedTags) ;(getProjects as jest.Mock).mockResolvedValue([]);
const params = Promise.resolve({ tag: 'nodejs' }) render(await TagDetailPage({ params }));
expect(screen.getByText('#Node.js')).toBeInTheDocument();
expect(screen.getByText('Next.js Guide')).toBeInTheDocument() });

it('displays only posts when no projects have the tag', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'javascript' }) render(await TagDetailPage({ params }));
expect(screen.getByText('#JavaScript')).toBeInTheDocument();
expect(screen.getByText('共 2 个相关内容')).toBeInTheDocument();
expect(screen.getByText('文章 (2)')).toBeInTheDocument();
expect(screen.queryByText(/项目 \(/)).not.toBeInTheDocument() });

it('displays only projects when no posts have the tag', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'mongodb' }) render(await TagDetailPage({ params }));
expect(screen.getByText('#MongoDB')).toBeInTheDocument();
expect(screen.getByText('共 1 个相关内容')).toBeInTheDocument();
expect(screen.getByText('项目 (1)')).toBeInTheDocument();
expect(screen.queryByText(/文章 \(/)).not.toBeInTheDocument() });

it('calls notFound when tag has no content', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'nonexistent' }) render(await TagDetailPage({ params }));
expect(notFound).toHaveBeenCalledTimes(1) });

it('renders content cards with correct information', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' }) render(await TagDetailPage({ params })) // Post card details expect(screen.getByText('Learn Next.js basics')).toBeInTheDocument();
expect(screen.getByText('5 min')).toBeInTheDocument();
expect(screen.getAllByText('Frontend').length).toBeGreaterThan(0) // Project card details expect(screen.getByText('Modern e-commerce solution')).toBeInTheDocument();
expect(screen.getByText('已完成')).toBeInTheDocument() });

it('renders correct links for content', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' });
const { container } = render(await TagDetailPage({ params })) // Check post links const postLink = container.querySelector('a[href="/posts/nextjs-guide"]');
expect(postLink).toBeInTheDocument() // Check project links const projectLink = container.querySelector('a[href="/projects/ecommerce-platform"]');
expect(projectLink).toBeInTheDocument() });

it('renders return to home link', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' }) render(await TagDetailPage({ params }));
const homeLink = screen.getByRole('link', { name: /返回首页/ });
expect(homeLink).toHaveAttribute('href', '/') });

it('renders content type badges correctly', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' }) render(await TagDetailPage({ params })) // Check for type badges expect(screen.getAllByText('文章').length).toBeGreaterThan(0);
expect(screen.getAllByText('项目').length).toBeGreaterThan(0) });

it('formats dates correctly', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' });
const { container } = render(await TagDetailPage({ params })) // Dates should be formatted const timeElements = container.querySelectorAll('time');
expect(timeElements.length).toBeGreaterThan(0);
expect(timeElements[0].textContent).toMatch(/2024/) });

it('renders thumbnails when available', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = Promise.resolve({ tag: 'react' }) render(await TagDetailPage({ params })) // Check for images const postImage = screen.getByAltText('Next.js Guide');
expect(postImage).toHaveAttribute('src', '/images/post1.jpg');
const projectImage = screen.getByAltText('E-commerce Platform');
expect(projectImage).toHaveAttribute('src', '/images/project1.jpg') });

it('handles projects with different statuses', async () => { ;(getPosts as jest.Mock).mockResolvedValue([]) ;(getProjects as jest.Mock).mockResolvedValue([ { ...mockProjects[0], tags: ['Test'], status: 'completed' }, { ...mockProjects[1], tags: ['Test'], status: 'active' }, { ...mockProjects[1], id: 'p3', title: 'Archived', tags: ['Test'], status: 'archived' }
]);
const params = Promise.resolve({ tag: 'test' }) render(await TagDetailPage({ params }));
expect(screen.getByText('已完成')).toBeInTheDocument();
expect(screen.getByText('进行中')).toBeInTheDocument();
expect(screen.getByText('已归档')).toBeInTheDocument() }) });

describe('generateMetadata', () => { it('generates correct metadata for tag', async () => { const params = Promise.resolve({ tag: 'react' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('react - 标签');
expect(metadata.description).toBe('查看所有标记为"react"的文章和项目') });

it('handles encoded tags in metadata', async () => { const params = Promise.resolve({ tag: 'c%2B%2B' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('c++ - 标签');
expect(metadata.description).toBe('查看所有标记为"c++"的文章和项目') }) });

describe('generateStaticParams', () => { it('generates params for all unique tags', async () => { ;(getPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const params = await generateStaticParams() // Should include all unique tags from posts and projects const tagSlugs = params.map(p => p.tag);
expect(tagSlugs).toContain('nextjs');
expect(tagSlugs).toContain('react');
expect(tagSlugs).toContain('javascript');
expect(tagSlugs).toContain('nodejs');
expect(tagSlugs).toContain('mongodb');
expect(tagSlugs).toContain('typescript') });

it('uses fallback data when API fails', async () => { ;(getPosts as jest.Mock).mockResolvedValue(null) ;(getProjects as jest.Mock).mockResolvedValue(null);
const params = await generateStaticParams() // Should return empty array when using empty fallback data expect(params).toEqual([]) }) })