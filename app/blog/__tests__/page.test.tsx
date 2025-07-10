import { render, screen }
from "@testing-library/react";
import BlogPage from "../page";
import { getPublishedPosts, withFallback, formatDate }
from "@/lib/notion";
// Mock dependencies jest.mock('@/lib/notion', () => ({ getPublishedPosts: jest.fn(), withFallback: jest.fn((fn) => fn()), formatDate: jest.fn((date) => new Date(date).toLocaleDateString()) }));
jest.mock('@/lib/fallback-posts', () => ({ getFallbackPosts: jest.fn(() => []) }));
jest.mock('next/link', () => { return ({ children, href, ...props }: any) => ( <a href={href} {...props}>{children}</a> ) }) jest.mock('@/components/ui/Container', () => ({ PageContainer: ({ children, className, size }: any) => ( <div className={className}
data-size={size}>{children}</div> ) }));
const mockPosts = [ { id: '1', title: 'First Blog Post', slug: 'first-blog-post', excerpt: 'This is the first blog post excerpt', date: '2024-01-01', category: 'Technology', tags: ['javascript', 'react', 'nextjs'], author: 'John Doe', readTime: '5 分钟' }, { id: '2', title: 'Design Principles', slug: 'design-principles', excerpt: 'Learn about design principles', date: '2024-01-02', category: 'Design', tags: ['ui', 'ux'], author: 'Jane Smith', readTime: '8 分钟' }, { id: '3', title: 'Productivity Tips', slug: 'productivity-tips', excerpt: 'Boost your productivity with these tips', date: '2024-01-03', category: 'Productivity', tags: ['tips', 'workflow'], author: 'Bob Johnson', readTime: '3 分钟' }, { id: '4', title: 'Life Lessons', slug: 'life-lessons', excerpt: 'Important life lessons I learned', date: '2024-01-04', category: 'Life', tags: ['personal'], author: 'Alice Brown', readTime: '6 分钟' }, { id: '5', title: 'Unknown Category Post', slug: 'unknown-category', excerpt: 'Post with unknown category', date: '2024-01-05', category: 'Random', tags: [], author: 'Test User', readTime: '4 分钟' }
]

describe('Blog Page', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders page title and description', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage());
expect(screen.getByText('博客文章')).toBeInTheDocument();
expect(screen.getByText('分享技术见解、设计思考和生活感悟')).toBeInTheDocument() });

it('renders all blog posts', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage());
mockPosts.forEach(post => { expect(screen.getByText(post.title)).toBeInTheDocument();
expect(screen.getByText(post.excerpt)).toBeInTheDocument() }) });

it('renders post links correctly', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage());
mockPosts.forEach(post => { const link = screen.getByRole('link', { name: post.title });
expect(link).toHaveAttribute('href', `/posts/${post.slug}`) }) });

it('renders category badges with correct classes', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage());
const techCategory = screen.getByText('Technology');
expect(techCategory).toHaveClass('category-badge', 'category-technology');
const designCategory = screen.getByText('Design');
expect(designCategory).toHaveClass('category-badge', 'category-design');
const productivityCategory = screen.getByText('Productivity');
expect(productivityCategory).toHaveClass('category-badge', 'category-productivity');
const lifeCategory = screen.getByText('Life');
expect(lifeCategory).toHaveClass('category-badge', 'category-life') // Unknown category should fall back to technology style const unknownCategory = screen.getByText('Random');
expect(unknownCategory).toHaveClass('category-badge', 'category-technology') });

it('renders post metadata correctly', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage()) // Check that formatDate is called for each post expect(formatDate).toHaveBeenCalledTimes(mockPosts.length) mockPosts.forEach(post => { expect(formatDate).toHaveBeenCalledWith(post.date) }) // Check read time mockPosts.forEach(post => { expect(screen.getByText(post.readTime)).toBeInTheDocument() }) });

it('renders tags for posts that have them', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage()) // First post should show first 2 tags expect(screen.getByText('javascript')).toBeInTheDocument();
expect(screen.getByText('react')).toBeInTheDocument() // Third tag should not be shown (limited to 2);
expect(screen.queryByText('nextjs')).not.toBeInTheDocument() // Other posts' tags expect(screen.getByText('ui')).toBeInTheDocument();
expect(screen.getByText('ux')).toBeInTheDocument();
expect(screen.getByText('tips')).toBeInTheDocument();
expect(screen.getByText('workflow')).toBeInTheDocument() });

it('does not render tag section for posts without tags', async () => { const postWithoutTags = [{ id: '1', title: 'No Tags Post', slug: 'no-tags', excerpt: 'Post without tags', date: '2024-01-01', category: 'Technology', tags: [], author: 'Author', readTime: '5 分钟' }
];(getPublishedPosts as jest.Mock).mockResolvedValue(postWithoutTags);
const { container } = render(await BlogPage()) // Should not have any tag elements expect(container.querySelectorAll('.tag')).toHaveLength(0) });

it('renders empty state when no posts', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue([]) render(await BlogPage());
expect(screen.getByText('暂无文章')).toBeInTheDocument() });

it('uses withFallback for data fetching', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) render(await BlogPage());
expect(withFallback).toHaveBeenCalledWith( expect.any(Function), expect.any(Array) ) });

it('renders posts in a responsive grid layout', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = render(await BlogPage());
const grid = container.querySelector('.grid.gap-8.md\\:grid-cols-2.lg\\:grid-cols-3');
expect(grid).toBeInTheDocument();
expect(grid?.children).toHaveLength(mockPosts.length) });

it('uses PageContainer with correct size', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = render(await BlogPage());
const pageContainer = container.querySelector('[data-size="xl"]');
expect(pageContainer).toBeInTheDocument() });

it('limits tags display to 2 per post', async () => { const postWithManyTags = [{ id: '1', title: 'Many Tags Post', slug: 'many-tags', excerpt: 'Post with many tags', date: '2024-01-01', category: 'Technology', tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], author: 'Author', readTime: '5 分钟' }
];(getPublishedPosts as jest.Mock).mockResolvedValue(postWithManyTags) render(await BlogPage());
expect(screen.getByText('tag1')).toBeInTheDocument();
expect(screen.getByText('tag2')).toBeInTheDocument();
expect(screen.queryByText('tag3')).not.toBeInTheDocument();
expect(screen.queryByText('tag4')).not.toBeInTheDocument();
expect(screen.queryByText('tag5')).not.toBeInTheDocument() });

it('applies article-card class to posts', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = render(await BlogPage());
const articles = container.querySelectorAll('.article-card');
expect(articles).toHaveLength(mockPosts.length) });

it('renders metadata separator correctly', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue([mockPosts[0]]) render(await BlogPage()) // Should have separator between date and read time expect(screen.getByText('·')).toBeInTheDocument() }) })
