import { render, screen }
from "@testing-library/react";
import TagsPage from "../page";
import { getPosts }
from "@/lib/notion";
import { getProjects }
from "@/lib/notion/projects";
import { fallbackPosts }
from "@/lib/fallback-posts";
import { fallbackProjects }
from "@/lib/fallback-projects";
// Mock dependencies jest.mock('@/lib/notion', () => ({ getPosts: jest.fn() }));
jest.mock('@/lib/notion/projects', () => ({ getProjects: jest.fn() }));
jest.mock('@/lib/fallback-posts', () => ({ fallbackPosts: [ { id: '1', title: 'Test Post 1', tags: ['Next.js', 'React', 'TypeScript']
}, { id: '2', title: 'Test Post 2', tags: ['JavaScript', 'Node.js', 'React']
}, { id: '3', title: 'Test Post 3', tags: ['CSS', 'HTML', 'JavaScript']
}
]}));
jest.mock('@/lib/fallback-projects', () => ({ fallbackProjects: [ { id: 'p1', title: 'Project 1', tags: ['React', 'Node.js', 'MongoDB']
}, { id: 'p2', title: 'Project 2', tags: ['Next.js', 'TypeScript', 'PostgreSQL']
}
]}));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href, className, style, onClick }: any) => ( <a href={href}
className={className}
style={style}
onClick={onClick}> {children} </a> ) }));
jest.mock('@/components/features/TagList', () => ({ TagCloud: ({ tags }: any) => ( <div data-testid="tag-cloud"> {tags.map((tag: any) => ( <div key={tag.slug}
data-testid={`cloud-tag-${tag.slug}`}> {tag.name} ({tag.count}) - weight: {tag.weight.toFixed(2)} </div> ))} </div> ) }));
jest.mock('@/types/tag', () => { const originalModule = jest.requireActual('@/types/tag') return { ...originalModule, createTagSlug: (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''), getTagColor: (slug: string) => { const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const hash = slug.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) return colors[hash % colors.length]
}
} });

describe('TagsPage', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders page title and description', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
expect(screen.getByText('标签')).toBeInTheDocument();
expect(screen.getByText('探索不同主题的内容')).toBeInTheDocument() });

it('displays tag cloud section', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
expect(screen.getByText('标签云')).toBeInTheDocument();
expect(screen.getByTestId('tag-cloud')).toBeInTheDocument() });

it('calculates tag statistics correctly', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects);
const { container } = render(await TagsPage()) // React tag should have 2 posts + 1 project = 3 total const reactCard = container.querySelector('a[href="/tags/react"]');
expect(reactCard).toBeInTheDocument();
expect(reactCard).toHaveTextContent('总计：3 个内容');
expect(reactCard).toHaveTextContent('文章：2 篇');
expect(reactCard).toHaveTextContent('项目：1 个') // Next.js tag should have 1 post + 1 project = 2 total const nextCard = container.querySelector('a[href="/tags/nextjs"]');
expect(nextCard).toBeInTheDocument();
expect(nextCard).toHaveTextContent('总计：2 个内容') });

it('displays correct post and project counts for tags', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects);
const { container } = render(await TagsPage()) // Find React tag card const reactCard = container.querySelector('a[href="/tags/react"]');
expect(reactCard).toBeInTheDocument();
expect(reactCard).toHaveTextContent('文章：2 篇');
expect(reactCard).toHaveTextContent('项目：1 个') });

it('sorts tags by total count in descending order', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
const tagLinks = screen.getAllByRole('link', { name: /^#/ });
const tagNames = tagLinks.map(link => link.textContent) // React (3), JavaScript (2), Next.js (2), Node.js (2) should come before others expect(tagNames[0]).toContain('React') });

it('displays all tags section with correct count', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage()) // Should show "所有标签 (X)" where X is the unique tag count expect(screen.getByText(/所有标签 \(\d+\)/)).toBeInTheDocument() });

it('shows tag colors', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects);
const { container } = render(await TagsPage()) // Check that color indicators are rendered const colorIndicators = container.querySelectorAll('div[style*="background-color"]');
expect(colorIndicators.length).toBeGreaterThan(0) });

it('renders statistics section with correct values', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage()) // Total posts expect(screen.getByText('3')).toBeInTheDocument();
expect(screen.getByText('已标记文章')).toBeInTheDocument() // Total projects expect(screen.getByText('2')).toBeInTheDocument();
expect(screen.getByText('已标记项目')).toBeInTheDocument() // Tag count should be displayed expect(screen.getByText('标签总数')).toBeInTheDocument() });

it('generates correct tag cloud data with weights', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage()) // React has the highest count (3), so should have weight 1.00 expect(screen.getByTestId('cloud-tag-react')).toHaveTextContent('weight: 1.00') });

it('handles empty posts and projects', async () => { ;(getPosts as jest.Mock).mockResolvedValue([]) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await TagsPage());
expect(screen.getByText('标签')).toBeInTheDocument();
expect(screen.getByText('所有标签 (0)')).toBeInTheDocument() });

it('uses fallback data when API calls fail', async () => { ;(getPosts as jest.Mock).mockResolvedValue(null) ;(getProjects as jest.Mock).mockResolvedValue(null) render(await TagsPage()) // Should still render tags from fallback data expect(screen.getByText('#React')).toBeInTheDocument();
expect(screen.getByText('#Next.js')).toBeInTheDocument() });

it('creates proper links for each tag', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
const reactLink = screen.getByRole('link', { name: /#React/ });
expect(reactLink).toHaveAttribute('href', '/tags/react');
const nextLink = screen.getByRole('link', { name: /#Next.js/ });
expect(nextLink).toHaveAttribute('href', '/tags/nextjs') });

it('includes view all indicator for each tag', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
const viewAllElements = screen.getAllByText('查看全部');
expect(viewAllElements.length).toBeGreaterThan(0) });

it('handles tags with special characters correctly', async () => { const postsWithSpecialTags = [ { id: '1', title: 'Post', tags: ['C++', 'Node.js', 'ASP.NET']
}
];(getPosts as jest.Mock).mockResolvedValue(postsWithSpecialTags) ;(getProjects as jest.Mock).mockResolvedValue([]) render(await TagsPage()) // Tags should be displayed and have proper slugs expect(screen.getByText(/#C\+\+/)).toBeInTheDocument();
expect(screen.getByText(/#Node\.js/)).toBeInTheDocument() });

it('applies hover effects classes', async () => { ;(getPosts as jest.Mock).mockResolvedValue(fallbackPosts) ;(getProjects as jest.Mock).mockResolvedValue(fallbackProjects) render(await TagsPage());
const tagLinks = screen.getAllByRole('link', { name: /^#/ });
expect(tagLinks[0]).toHaveClass('hover:shadow-xl');
expect(tagLinks[0]).toHaveClass('transition-all') }) })
