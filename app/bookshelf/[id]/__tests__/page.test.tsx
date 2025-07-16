import { render, screen }
from '@testing-library/react' 

import BookDetailPage, { generateMetadata, generateStaticParams }
from '../page' import { fallbackBooks }
from '@/lib/fallback-books' 

import { notFound }
from 'next/navigation' // Mock dependencies jest.mock('next/navigation', () => ({ notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }));
jest.mock('remark', () => ({ remark: jest.fn().mockReturnValue({ use: jest.fn().mockReturnValue({ process: jest.fn().mockImplementation((markdown) => ({ toString: () => `<p>${markdown}</p>` })) }) }) }));
jest.mock('remark-html', () => jest.fn());
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, fill, className }: any) => ( <img src={src}
alt={alt}
className={className}
data-fill={fill}
/> ) }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href, className }: any) => ( <a href={href}
className={className}>{children}</a> ) }));
jest.mock('@/components/seo/StructuredData', () => ({ StructuredData: ({ type, data }: any) => ( <div data-testid="structured-data" data-type={type}
data-data={JSON.stringify(data)}
/> ), generateBookStructuredData: (data: any) => ({ ...data, '@type': 'Book' }) }));
jest.mock('@/lib/fallback-books', () => ({ fallbackBooks: [ { id: '1', title: '设计模式：可复用面向对象软件的基础', author: 'Erich Gamma等', isbn: '9787111618973', category: '技术', status: 'read', rating: 5, startDate: '2024-01-01', finishDate: '2024-02-15', cover: 'https://example.com/book1.jpg', notes: '这是一本关于设计模式的书籍笔记。\n\n## 主要收获\n\n1. 单一职责原则', takeaways: '设计模式是解决常见问题的最佳实践', tags: ['设计模式', '软件工程'], publishYear: 2019, pages: 395, language: '中文' }, { id: '2', title: 'Clean Code', author: 'Robert C. Martin', category: '技术', status: 'reading', rating: 4, startDate: '2024-03-01', cover: 'https://example.com/book2.jpg', tags: ['编程', '代码质量'], pages: 464 }, { id: '3', title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', status: 'want-to-read', rating: 5, cover: 'https://example.com/book3.jpg', tags: ['历史', '人类学']
}
]}));
describe('BookDetail Page', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders book detail with all information', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params })) // Title and author expect(screen.getByText('设计模式：可复用面向对象软件的基础')).toBeInTheDocument();
expect(screen.getByText('Erich Gamma等')).toBeInTheDocument() // Category and publish info expect(screen.getByText('技术')).toBeInTheDocument();
expect(screen.getByText('2019年出版')).toBeInTheDocument();
expect(screen.getByText('中文')).toBeInTheDocument() // Status expect(screen.getByText('已读')).toBeInTheDocument() // Reading dates (formatted with toLocaleDateString);
expect(screen.getByText(/2024/)).toBeInTheDocument();
expect(screen.getByText('阅读时间')).toBeInTheDocument() // Pages expect(screen.getByText('395 页')).toBeInTheDocument() // ISBN expect(screen.getByText('9787111618973')).toBeInTheDocument() // Tags expect(screen.getByText('设计模式')).toBeInTheDocument();
expect(screen.getByText('软件工程')).toBeInTheDocument() // Takeaways expect(screen.getByText('核心收获')).toBeInTheDocument();
expect(screen.getByText('设计模式是解决常见问题的最佳实践')).toBeInTheDocument() // Notes section expect(screen.getByText('读书笔记')).toBeInTheDocument() });

it('renders rating stars correctly', async () => { const params = Promise.resolve({ id: '1' });
const { container } = render(await BookDetailPage({ params }));
const stars = container.querySelectorAll('svg');
const filledStars = container.querySelectorAll('.text-yellow-400');
expect(stars.length).toBeGreaterThanOrEqual(5) // At least 5 stars expect(filledStars).toHaveLength(5) // 5 filled stars for rating 5 });

it('renders book cover image', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
const coverImage = screen.getByAltText('设计模式：可复用面向对象软件的基础');
expect(coverImage).toHaveAttribute('src', 'https://example.com/book1.jpg') });

it('renders back to bookshelf link', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
const backLink = screen.getByText('返回书架');
expect(backLink.closest('a')).toHaveAttribute('href', '/bookshelf') });

it('converts markdown notes to HTML', async () => { const params = Promise.resolve({ id: '1' });
const { container } = render(await BookDetailPage({ params }));
const notesSection = container.querySelector('.prose');
expect(notesSection).toBeInTheDocument();
expect(notesSection?.innerHTML).toContain('<p>') });

it('renders structured data for SEO', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
const structuredData = screen.getByTestId('structured-data');
expect(structuredData).toHaveAttribute('data-type', 'Book');
const data = JSON.parse(structuredData.getAttribute('data-data') || '{}');
expect(data.title).toBe('设计模式：可复用面向对象软件的基础');
expect(data.author).toBe('Erich Gamma等');
expect(data.isbn).toBe('9787111618973') });

it('handles book with minimal information', async () => { const params = Promise.resolve({ id: '3' }) render(await BookDetailPage({ params })) // Should render basic info expect(screen.getByText('人类简史')).toBeInTheDocument();
expect(screen.getByText('尤瓦尔·赫拉利')).toBeInTheDocument();
expect(screen.getByText('想读')).toBeInTheDocument() // Should not render optional fields expect(screen.queryByText('阅读时间')).not.toBeInTheDocument();
expect(screen.queryByText('页数')).not.toBeInTheDocument();
expect(screen.queryByText('ISBN')).not.toBeInTheDocument();
expect(screen.queryByText('核心收获')).not.toBeInTheDocument();
expect(screen.queryByText('读书笔记')).not.toBeInTheDocument() });

it('calls notFound when book does not exist', async () => { const params = Promise.resolve({ id: 'non-existent' }) await expect(BookDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
expect(notFound).toHaveBeenCalledTimes(1) });

it('shows correct status color for different statuses', async () => { // Test "reading" status const params2 = Promise.resolve({ id: '2' });
const { container: container2 } = render(await BookDetailPage({ params: params2 }));
const readingStatus = container2.querySelector('.bg-yellow-100');
expect(readingStatus).toHaveTextContent('在读') // Clear previous render jest.clearAllMocks() // Test "want-to-read" status const params3 = Promise.resolve({ id: '3' });
const { container: container3 } = render(await BookDetailPage({ params: params3 }));
const wantToReadStatus = container3.querySelector('.bg-blue-100');
expect(wantToReadStatus).toHaveTextContent('想读') });

it('handles empty notes gracefully', async () => { const params = Promise.resolve({ id: '2' }) render(await BookDetailPage({ params })) // Should not render notes section if no notes expect(screen.queryByText('读书笔记')).not.toBeInTheDocument() });

it('renders all tags correctly', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
const book = fallbackBooks[0]
book.tags.forEach(tag => { expect(screen.getByText(tag)).toBeInTheDocument() }) });

it('handles markdown conversion errors gracefully', async () => { // Mock remark to throw error const mockRemark = jest.requireMock('remark') mockRemark.remark.mockReturnValueOnce({ use: jest.fn().mockReturnValue({ process: jest.fn().mockRejectedValue(new Error('Markdown error')) }) });
const params = Promise.resolve({ id: '1' });
const { container } = render(await BookDetailPage({ params })) // Should still render the page expect(screen.getByText('设计模式：可复用面向对象软件的基础')).toBeInTheDocument() });

it('displays publish year when available', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
expect(screen.getByText('2019年出版')).toBeInTheDocument() });

it('displays language when available', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params }));
expect(screen.getByText('中文')).toBeInTheDocument() });

it('formats dates correctly', async () => { const params = Promise.resolve({ id: '1' }) render(await BookDetailPage({ params })) // Check that dates are formatted const dateText = screen.getByText(/2024/);
expect(dateText).toBeInTheDocument() }) });

describe('generateMetadata', () => { it('generates correct metadata for existing book', async () => { const params = Promise.resolve({ id: '1' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('设计模式：可复用面向对象软件的基础 - Erich Gamma等');
expect(metadata.description).toBe('阅读笔记：设计模式：可复用面向对象软件的基础，作者：Erich Gamma等');
expect(metadata.openGraph?.title).toBe('设计模式：可复用面向对象软件的基础');
expect(metadata.openGraph?.type).toBe('book') });

it('generates fallback metadata for non-existent book', async () => { const params = Promise.resolve({ id: 'non-existent' });
const metadata = await generateMetadata({ params });
expect(metadata.title).toBe('书籍不存在');
expect(metadata.description).toBe('抱歉，找不到这本书。') }) });

describe('generateStaticParams', () => { it('generates params for all fallback books', async () => { const params = await generateStaticParams();
expect(params).toHaveLength(fallbackBooks.length);
expect(params).toEqual( expect.arrayContaining([ { id: '1' }, { id: '2' }, { id: '3' }
]) ) }) })