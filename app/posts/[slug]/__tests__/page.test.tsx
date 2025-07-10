import { render, screen }
from '@testing-library/react' 

import Post, { generateStaticParams, generateMetadata }
from '../page' import { getPostBySlug, getAllPostSlugs, withFallback, formatDate }
from '@/lib/notion' 

import { notFound }
from 'next/navigation' // Mock dependencies jest.mock('@/lib/notion', () => ({ getPostBySlug: jest.fn(), getAllPostSlugs: jest.fn(), withFallback: jest.fn((fn) => fn()), formatDate: jest.fn((date) => new Date(date).toLocaleDateString()) }));
jest.mock('@/lib/fallback-posts', () => ({ getFallbackPostBySlug: jest.fn(() => null) }));
jest.mock('next/navigation', () => ({ notFound: jest.fn() }));
jest.mock('next/link', () => { return ({ children, href, ...props }: any) => ( <a href={href} {...props}>{children}</a> ) }) jest.mock('next/image', () => { return function Image({ src, alt, fill, ...props }: any) { return <img src={src}
alt={alt} {...props}
/> }
}) // Mock all child components jest.mock('@/components/seo/SEO', () => ({ SEO: ({ structuredData }: any) =>
<script type="application/ld+json">{JSON.stringify(structuredData)}</script>, generateArticleStructuredData: jest.fn((data) => ({ ...data, '@type': 'Article' })) }));
jest.mock('@/components/features/TableOfContents', () => { return function TableOfContents({ content }: any) { return <div data-testid="table-of-contents">Table of Contents</div> }
}) jest.mock('@/components/features/ReadingProgress', () => { return function ReadingProgress({ showPercentage, offset }: any) { return <div data-testid="reading-progress" data-show-percentage={showPercentage}
data-offset={offset}
/> }
}) jest.mock('@/components/features/SocialShare', () => ({ SocialShare: ({ url, title }: any) => ( <div data-testid="social-share" data-url={url}
data-title={title}>Share</div> ) }));
jest.mock('@/components/features/ArticleReactions', () => { return function ArticleReactions({ contentId }: any) { return <div data-testid="article-reactions" data-content-id={contentId}>Reactions</div> }
}) jest.mock('@/components/features/TagList', () => { return function TagList({ tags, size }: any) { return ( <div data-testid="tag-list" data-size={size}> {tags.map((tag: string) =>
<span key={tag}
className="tag">{tag}</span>)} </div> ) }
}) jest.mock('@/components/features/FavoriteButton', () => ({ __esModule: true, default: ({ itemId, title, size }: any) => ( <button data-testid="favorite-button" data-item-id={itemId}
data-size={size}>{title}</button> ), FloatingFavoriteButton: ({ itemId }: any) => ( <button data-testid="floating-favorite-button" data-item-id={itemId}>Floating Favorite</button> ) }));
jest.mock('@/components/ui/Container', () => ({ ContentContainer: ({ children }: any) =>
<div className="content-container">{children}</div> }));
jest.mock('@/components/comments/CommentSection', () => ({ CommentSection: ({ contentId }: any) => ( <div data-testid="comment-section" data-content-id={contentId}>Comments</div> ) }));
jest.mock('@/lib/utils/content', () => ({ calculateWordCount: jest.fn((content) => content.length), formatUpdateTime: jest.fn((date, lastEdited) => lastEdited ? 'Updated' : null) }));
const mockPost = { id: 'post-1', title: 'Test Post Title', slug: 'test-post', content: '<p>This is the post content with <strong>HTML</strong>.</p>', excerpt: 'This is the post excerpt', date: '2024-01-01', lastEditedTime: '2024-01-15', category: 'Technology', tags: ['react', 'nextjs', 'typescript'], author: { name: 'John Doe', avatar: '/avatar.jpg' }, cover: '/cover.jpg', readTime: '5 分钟' }

describe('Post Page', () => { beforeEach(() => { jest.clearAllMocks() process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com' });

describe('generateStaticParams', () => { it('returns slugs from Notion when available', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-db' ;(getAllPostSlugs as jest.Mock).mockResolvedValue(['slug1', 'slug2', 'slug3']);
const result = await generateStaticParams();
expect(result).toEqual([ { slug: 'slug1' }, { slug: 'slug2' }, { slug: 'slug3' }
]) });

it('returns fallback slugs when Notion fails', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-db' ;(getAllPostSlugs as jest.Mock).mockRejectedValue(new Error('API Error'));
const result = await generateStaticParams();
expect(result).toEqual([ { slug: 'overcome-procrastination' }, { slug: 'react-18-concurrent-features' }, { slug: 'personal-knowledge-management' }, { slug: 'design-system-thinking' }
]) });

it('returns fallback slugs when environment not configured', async () => { delete process.env.NOTION_TOKEN delete process.env.NOTION_DATABASE_ID const result = await generateStaticParams();
expect(result).toEqual([ { slug: 'overcome-procrastination' }, { slug: 'react-18-concurrent-features' }, { slug: 'personal-knowledge-management' }, { slug: 'design-system-thinking' }
]) }) });

describe('generateMetadata', () => { it('generates metadata for existing post', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost);
const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) });
expect(metadata.title).toBe('Test Post Title - 无题之墨');
expect(metadata.description).toBe('This is the post excerpt');
expect(metadata.openGraph).toMatchObject({ title: 'Test Post Title', description: 'This is the post excerpt', type: 'article', publishedTime: '2024-01-01', authors: ['John Doe'], tags: ['react', 'nextjs', 'typescript']
}) });

it('generates 404 metadata for non-existent post', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(null);
const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) });
expect(metadata.title).toBe('文章不存在 - 无题之墨');
expect(metadata.description).toBe('抱歉，找不到这篇文章。') }) });

describe('Post Component', () => { it('renders post content correctly', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.getByText('Test Post Title')).toBeInTheDocument();
expect(screen.getByText('This is the post excerpt')).toBeInTheDocument();
expect(screen.getByText('Technology')).toBeInTheDocument() });

it('calls notFound when post does not exist', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(null) await Post({ params: Promise.resolve({ slug: 'non-existent' }) });
expect(notFound).toHaveBeenCalled() });

it('renders author information', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.getByText('John Doe')).toBeInTheDocument();
expect(screen.getByText('作者')).toBeInTheDocument();
expect(screen.getByAltText('John Doe')).toHaveAttribute('src', '/avatar.jpg') });

it('renders post metadata', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.getByText('发布时间')).toBeInTheDocument();
expect(screen.getByText('阅读时间')).toBeInTheDocument();
expect(screen.getByText('5 分钟')).toBeInTheDocument();
expect(screen.getByText('字数')).toBeInTheDocument();
expect(screen.getByText('最后更新')).toBeInTheDocument() });

it('renders tags correctly', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.getByTestId('tag-list')).toBeInTheDocument();
expect(screen.getByText('react')).toBeInTheDocument();
expect(screen.getByText('nextjs')).toBeInTheDocument();
expect(screen.getByText('typescript')).toBeInTheDocument() });

it('renders social share component', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const socialShare = screen.getByTestId('social-share');
expect(socialShare).toHaveAttribute('data-url', 'https://example.com/posts/test-post');
expect(socialShare).toHaveAttribute('data-title', 'Test Post Title') });

it('renders cover image when available', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const coverImage = screen.getByAltText('Test Post Title');
expect(coverImage).toHaveAttribute('src', '/cover.jpg') });

it('does not render cover image when not available', async () => { const postWithoutCover = { ...mockPost, cover: null } ;(getPostBySlug as jest.Mock).mockResolvedValue(postWithoutCover) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.queryByAltText('Test Post Title')).not.toBeInTheDocument() });

it('renders post content as HTML', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost);
const { container } = render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const contentDiv = container.querySelector('.prose-blog');
expect(contentDiv).toHaveProperty('innerHTML', '<p>This is the post content with <strong>HTML</strong>.</p>') });

it('renders reading progress component', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const readingProgress = screen.getByTestId('reading-progress');
expect(readingProgress).toHaveAttribute('data-show-percentage', 'false');
expect(readingProgress).toHaveAttribute('data-offset', '80') });

it('renders table of contents', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.getByTestId('table-of-contents')).toBeInTheDocument() });

it('renders article reactions', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const reactions = screen.getByTestId('article-reactions');
expect(reactions).toHaveAttribute('data-content-id', 'post-1') });

it('renders comment section', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const comments = screen.getByTestId('comment-section');
expect(comments).toHaveAttribute('data-content-id', 'post-1') });

it('renders favorite buttons', async () => { ;(getPostBySlug as jest.Mock).mockResolvedValue(mockPost) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const favoriteButton = screen.getByTestId('favorite-button');
expect(favoriteButton).toHaveAttribute('data-item-id', 'post-1');
expect(favoriteButton).toHaveAttribute('data-size', 'medium');
const floatingFavorite = screen.getByTestId('floating-favorite-button');
expect(floatingFavorite).toHaveAttribute('data-item-id', 'post-1') });

it('applies correct category class', async () => { const categories = ['Technology', 'Design', 'Productivity', 'Life', 'Unknown']
for (const category of categories) { const postWithCategory = { ...mockPost, category } ;(getPostBySlug as jest.Mock).mockResolvedValue(postWithCategory);
const { rerender } = render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
const categoryBadge = screen.getByText(category) if (category === 'Unknown') { expect(categoryBadge).toHaveClass('category-badge', 'category-technology') }
else { expect(categoryBadge).toHaveClass('category-badge', `category-${category.toLowerCase()}`) }
rerender(<div />) }
});

it('does not render update time when not available', async () => { const postWithoutUpdate = { ...mockPost, lastEditedTime: null } ;(getPostBySlug as jest.Mock).mockResolvedValue(postWithoutUpdate) render(await Post({ params: Promise.resolve({ slug: 'test-post' }) }));
expect(screen.queryByText('最后更新')).not.toBeInTheDocument() }) }) })