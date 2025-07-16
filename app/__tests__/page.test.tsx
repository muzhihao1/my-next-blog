import { render, screen } from "@testing-library/react";
import Home from "../page";
import { getPublishedPosts } from "@/lib/notion";
import { getProjects } from "@/lib/notion/projects";
// Mock dependencies jest.mock('@/lib/notion', () => ({ getPublishedPosts: jest.fn(), withFallback: jest.fn((fn, fallback) => fn()), formatDate: jest.fn((date) => new Date(date).toLocaleDateString()) }));
jest.mock('@/lib/notion/projects', () => ({ getProjects: jest.fn() }));
jest.mock('@/lib/fallback-posts', () => ({ fallbackPosts: []
}));
jest.mock('@/lib/fallback-projects', () => ({ fallbackProjects: []
}));
jest.mock('next/link', () => { return ({ children, href, ...props }: any) => ( <a href={href} {...props}>{children}</a> ) }) // Mock child components jest.mock('@/components/ui/OptimizedImage', () => ({ OptimizedImage: ({ alt, ...props }: any) =>
<img alt={alt} {...props}
/> }));
jest.mock('@/components/ui/Container', () => { return ({ children, className }: any) => ( <div className={className}>{children}</div> ) }) jest.mock('@/components/sections/StatsSection', () => { return;
function StatsSection() { return <div data-testid="stats-section">Stats Section</div> }
}) jest.mock('@/components/widgets/StatsWidget', () => { return;
function StatsWidget() { return <div data-testid="stats-widget">Stats Widget</div> }
}) jest.mock('@/components/features/HomeClient', () => { return;
function HomeClient({ children }: any) { return <div data-testid="home-client">{children}</div> }
});
const mockPosts = [ { id: '1', title: 'Test Post 1', slug: 'test-post-1', excerpt: 'This is test post 1', date: '2024-01-01', category: 'Technology', tags: ['test'], author: 'Test Author' }, { id: '2', title: 'Test Post 2', slug: 'test-post-2', excerpt: 'This is test post 2', date: '2024-01-02', category: 'Design', tags: ['design'], author: 'Test Author' }, { id: '3', title: 'Test Post 3', slug: 'test-post-3', excerpt: 'This is test post 3', date: '2024-01-03', category: 'Life', tags: ['life'], author: 'Test Author' }
];
const mockProjects = [ { id: '1', title: 'Featured Project 1', slug: 'featured-project-1', description: 'This is a featured project', thumbnail: '/images/project1.jpg', techStack: ['React', 'TypeScript', 'Next.js'], featured: true }, { id: '2', title: 'Featured Project 2', slug: 'featured-project-2', description: 'Another featured project', thumbnail: '/images/project2.jpg', techStack: ['Vue', 'JavaScript', 'Nuxt'], featured: true }, { id: '3', title: 'Featured Project 3', slug: 'featured-project-3', description: 'Third featured project', thumbnail: '/images/project3.jpg', techStack: ['Python', 'Django', 'PostgreSQL'], featured: true }, { id: '4', title: 'Regular Project', slug: 'regular-project', description: 'This is not featured', thumbnail: '/images/project4.jpg', techStack: ['Go', 'Docker'], featured: false }
];
describe('Home Page', () => { beforeEach(() => { jest.clearAllMocks() });
it('renders hero section with correct content', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const { container } = render(await Home());
expect(screen.getByText(/欢迎来到我的/)).toBeInTheDocument();
expect(screen.getByText('数字花园')).toBeInTheDocument();
expect(screen.getByText(/在这里，我分享技术见解/)).toBeInTheDocument() // Check CTA buttons;
const projectsLink = screen.getByRole('link', { name: '查看项目' });
expect(projectsLink).toHaveAttribute('href', '/projects');
const blogLink = screen.getByRole('link', { name: '阅读博客' });
expect(blogLink).toHaveAttribute('href', '/blog') });
it('renders client components', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects) render(await Home());
expect(screen.getByTestId('home-client')).toBeInTheDocument();
expect(screen.getByTestId('stats-section')).toBeInTheDocument();
expect(screen.getByTestId('stats-widget')).toBeInTheDocument() });
it('renders featured projects section with correct data', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects) render(await Home());
expect(screen.getByText('精选项目')).toBeInTheDocument();
expect(screen.getByText('探索我最引以为豪的作品')).toBeInTheDocument() // Should only show featured projects expect(screen.getByText('Featured Project 1')).toBeInTheDocument();
expect(screen.getByText('Featured Project 2')).toBeInTheDocument();
expect(screen.getByText('Featured Project 3')).toBeInTheDocument();
expect(screen.queryByText('Regular Project')).not.toBeInTheDocument() // Check project links;
const projectLink = screen.getByRole('link', { name: /Featured Project 1/ });
expect(projectLink).toHaveAttribute('href', '/projects/featured-project-1') });
it('renders tech stack for projects', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects) render(await Home());
expect(screen.getByText('React')).toBeInTheDocument();
expect(screen.getByText('TypeScript')).toBeInTheDocument();
expect(screen.getByText('Next.js')).toBeInTheDocument() });
it('renders recent posts section with correct data', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await Home());
expect(screen.getByText('最新文章')).toBeInTheDocument();
expect(screen.getByText('技术思考与经验分享')).toBeInTheDocument() // Should show first 3 posts expect(screen.getByText('Test Post 1')).toBeInTheDocument();
expect(screen.getByText('Test Post 2')).toBeInTheDocument();
expect(screen.getByText('Test Post 3')).toBeInTheDocument() // Check post links;
const postLink = screen.getByRole('link', { name: /Test Post 1/ });
expect(postLink).toHaveAttribute('href', '/posts/test-post-1') });
it('renders post categories with correct styling', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await Home());
const techCategory = screen.getByText('Technology');
expect(techCategory).toHaveClass('category-badge', 'category-technology');
const designCategory = screen.getByText('Design');
expect(designCategory).toHaveClass('category-badge', 'category-design');
const lifeCategory = screen.getByText('Life');
expect(lifeCategory).toHaveClass('category-badge', 'category-life') });
it('renders view all links', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects) render(await Home());
const allProjectsLink = screen.getByRole('link', { name: /查看所有项目/ });
expect(allProjectsLink).toHaveAttribute('href', '/projects');
const allPostsLink = screen.getByRole('link', { name: /查看所有文章/ });
expect(allPostsLink).toHaveAttribute('href', '/blog') });
it('handles empty posts and projects gracefully', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue([]) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await Home()) // Hero section should still render expect(screen.getByText(/欢迎来到我的/)).toBeInTheDocument() // Section headers should still render expect(screen.getByText('精选项目')).toBeInTheDocument();
expect(screen.getByText('最新文章')).toBeInTheDocument() });
it('limits featured projects to 3', async () => { const manyProjects = Array(10).fill(null).map((_, i) => ({ id: `${i}`, title: `Project ${i}`, slug: `project-${i}`, description: `Description ${i}`, thumbnail: `/images/project${i}.jpg`, techStack: ['Tech'], featured: true })) ;(getPublishedPosts as jest.Mock).mockResolvedValue([]) ;(getProjects as jest.Mock).mockResolvedValue(manyProjects) render(await Home()) // Should only show first 3 featured projects expect(screen.getByText('Project 0')).toBeInTheDocument();
expect(screen.getByText('Project 1')).toBeInTheDocument();
expect(screen.getByText('Project 2')).toBeInTheDocument();
expect(screen.queryByText('Project 3')).not.toBeInTheDocument() });
it('limits recent posts to 3', async () => { const manyPosts = Array(10).fill(null).map((_, i) => ({ id: `${i}`, title: `Post ${i}`, slug: `post-${i}`, excerpt: `Excerpt ${i}`, date: '2024-01-01', category: 'Technology', tags: ['test'], author: 'Author' })) ;(getPublishedPosts as jest.Mock).mockResolvedValue(manyPosts) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await Home()) // Should only show first 3 posts expect(screen.getByText('Post 0')).toBeInTheDocument();
expect(screen.getByText('Post 1')).toBeInTheDocument();
expect(screen.getByText('Post 2')).toBeInTheDocument();
expect(screen.queryByText('Post 3')).not.toBeInTheDocument() });
it('renders post dates correctly', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await Home()) // formatDate should be called for each post;
const { formatDate } = require('@/lib/notion');
expect(formatDate).toHaveBeenCalledWith('2024-01-01');
expect(formatDate).toHaveBeenCalledWith('2024-01-02');
expect(formatDate).toHaveBeenCalledWith('2024-01-03') });
it('applies correct styling classes', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) ;(getProjects as jest.Mock).mockResolvedValue(mockProjects);
const { container } = render(await Home()) // Check for gradient background expect(container.querySelector('.bg-gradient-to-b')).toBeInTheDocument() // Check for responsive grid expect(container.querySelector('.grid.md\\:grid-cols-3')).toBeInTheDocument() // Check for section backgrounds expect(container.querySelector('.bg-gray-50.dark\\:bg-gray-900')).toBeInTheDocument() }) })
