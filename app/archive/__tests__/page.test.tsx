import { render, screen }
from "@testing-library/react";
import ArchivePage from "../page";
import { getPublishedPosts }
from "@/lib/notion";
import { fallbackPosts }
from "@/lib/fallback-posts";
// Mock dependencies jest.mock('@/lib/notion', () => ({ getPublishedPosts: jest.fn() }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href, className }: any) => ( <a href={href}
className={className}> {children} </a> ) }));
const mockPosts = [ { id: '1', title: 'Next.js 15 新特性详解', slug: 'nextjs-15-features', excerpt: '深入了解 Next.js 15 的新功能', date: '2024-01-15', category: '技术', tags: ['Next.js', 'React']
}, { id: '2', title: 'React Server Components 实践', slug: 'react-server-components', excerpt: 'RSC 在实际项目中的应用', date: '2024-01-10', category: '技术', tags: ['React', 'RSC']
}, { id: '3', title: '2023年技术总结', slug: '2023-tech-summary', excerpt: '回顾2023年的技术成长', date: '2023-12-25', category: '总结', tags: ['年度总结']
}, { id: '4', title: 'TypeScript 5.0 新特性', slug: 'typescript-5-features', excerpt: 'TypeScript 5.0 带来的改进', date: '2023-03-16', category: '技术', tags: ['TypeScript']
}, { id: '5', title: '前端性能优化实践', slug: 'frontend-performance', excerpt: '提升网站性能的实用技巧', date: '2022-11-20', category: '技术', tags: ['性能优化']
}
]
jest.mock('@/lib/fallback-posts', () => ({ fallbackPosts: [ { id: 'fallback-1', title: 'Fallback Post', slug: 'fallback-post', excerpt: 'This is a fallback post', date: '2024-01-01', category: 'Test', tags: ['fallback']
}
]})) // Helper to render async server components async function renderAsync(component: Promise<JSX.Element>) { const resolvedComponent = await component return render(resolvedComponent) }

describe('ArchivePage', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders archive page with posts grouped by year', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) await renderAsync(ArchivePage()) // Page title and description expect(screen.getByText('文章归档')).toBeInTheDocument();
expect(screen.getByText('所有文章按时间排序')).toBeInTheDocument() // Year headers expect(screen.getByText('2024')).toBeInTheDocument();
expect(screen.getByText('2023')).toBeInTheDocument();
expect(screen.getByText('2022')).toBeInTheDocument() // Post counts - use getAllByText since there are multiple (2 篇);
const twoPostsElements = screen.getAllByText('(2 篇)');
expect(twoPostsElements).toHaveLength(2) // 2024 and 2023 both have 2 posts expect(screen.getByText('(1 篇)')).toBeInTheDocument() // 2022 has 1 post });

it('displays posts under correct year groups', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = await renderAsync(ArchivePage()) // Find year sections const year2024Section = screen.getByText('2024').closest('div');
const year2023Section = screen.getByText('2023').closest('div') // Check 2024 posts expect(year2024Section).toHaveTextContent('Next.js 15 新特性详解');
expect(year2024Section).toHaveTextContent('React Server Components 实践') // Check 2023 posts expect(year2023Section).toHaveTextContent('2023年技术总结');
expect(year2023Section).toHaveTextContent('TypeScript 5.0 新特性') });

it('sorts years in descending order', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) await renderAsync(ArchivePage());
const yearHeaders = screen.getAllByRole('heading', { level: 2 });
const years = yearHeaders.map(h => h.textContent?.match(/\d{4}/)?.[0]);
expect(years).toEqual(['2024', '2023', '2022']) });

it('formats dates correctly in Chinese format', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) await renderAsync(ArchivePage()) // Check date formatting (toLocaleDateString in Chinese outputs MM/DD format);
expect(screen.getByText('01/15')).toBeInTheDocument();
expect(screen.getByText('01/10')).toBeInTheDocument();
expect(screen.getByText('12/25')).toBeInTheDocument() });

it('creates correct links for posts', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = await renderAsync(ArchivePage());
const links = container.querySelectorAll('a');
expect(links[0]).toHaveAttribute('href', '/posts/nextjs-15-features');
expect(links[1]).toHaveAttribute('href', '/posts/react-server-components');
expect(links[2]).toHaveAttribute('href', '/posts/2023-tech-summary') });

it('displays post excerpts', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts) await renderAsync(ArchivePage());
expect(screen.getByText('深入了解 Next.js 15 的新功能')).toBeInTheDocument();
expect(screen.getByText('RSC 在实际项目中的应用')).toBeInTheDocument();
expect(screen.getByText('回顾2023年的技术成长')).toBeInTheDocument() });

it('applies hover styles classes', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = await renderAsync(ArchivePage());
const links = container.querySelectorAll('a');
expect(links[0]).toHaveClass('hover:bg-gray-50', 'dark:hover:bg-gray-800/50') });

it('handles empty posts array', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue([]) await renderAsync(ArchivePage());
expect(screen.getByText('暂无文章')).toBeInTheDocument() });

it('uses fallback posts when API fails', async () => { ;(getPublishedPosts as jest.Mock).mockRejectedValue(new Error('API Error'));
await renderAsync(ArchivePage());
expect(screen.getByText('Fallback Post')).toBeInTheDocument();
expect(screen.getByText('This is a fallback post')).toBeInTheDocument() });

it('groups posts correctly when multiple posts in same year', async () => { const postsWithSameYear = [ ...mockPosts, { id: '6', title: 'Another 2024 Post', slug: 'another-2024-post', excerpt: 'Another post from 2024', date: '2024-05-20', category: '技术', tags: ['Test']
}
];(getPublishedPosts as jest.Mock).mockResolvedValue(postsWithSameYear) await renderAsync(ArchivePage()) // Should show 3 posts for 2024 expect(screen.getByText('(3 篇)')).toBeInTheDocument() });

it('handles single post in a year', async () => { const singlePost = [{ id: '1', title: 'Single Post', slug: 'single-post', excerpt: 'Only post in 2024', date: '2024-06-15', category: '技术', tags: ['Single']
}
];(getPublishedPosts as jest.Mock).mockResolvedValue(singlePost) await renderAsync(ArchivePage());
expect(screen.getByText('2024')).toBeInTheDocument();
expect(screen.getByText('(1 篇)')).toBeInTheDocument() });

it('preserves post order within year groups', async () => { const postsInOrder = [ { id: '1', title: 'December Post', slug: 'december-post', excerpt: 'Post from December', date: '2024-12-25', category: '技术', tags: ['Test']
}, { id: '2', title: 'January Post', slug: 'january-post', excerpt: 'Post from January', date: '2024-01-05', category: '技术', tags: ['Test']
}
];(getPublishedPosts as jest.Mock).mockResolvedValue(postsInOrder);
const { container } = await renderAsync(ArchivePage());
const year2024Section = screen.getByText('2024').closest('div');
const articles = year2024Section?.querySelectorAll('article') // Posts should appear in the order they were returned (not re-sorted by date);
expect(articles?.[0]).toHaveTextContent('December Post');
expect(articles?.[1]).toHaveTextContent('January Post') });

it('applies responsive spacing and layout', async () => { ;(getPublishedPosts as jest.Mock).mockResolvedValue(mockPosts);
const { container } = await renderAsync(ArchivePage());
const mainContainer = container.firstChild expect(mainContainer).toHaveClass('max-w-4xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8') });

it('handles posts from future years', async () => { const futurePost = [{ id: '1', title: 'Future Post', slug: 'future-post', excerpt: 'Post from the future', date: '2025-01-01', category: '未来', tags: ['Future']
}
];(getPublishedPosts as jest.Mock).mockResolvedValue(futurePost) await renderAsync(ArchivePage());
expect(screen.getByText('2025')).toBeInTheDocument();
expect(screen.getByText('Future Post')).toBeInTheDocument() }) })
