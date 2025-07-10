import { render, screen }
from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookshelfPage from "../page";
import BookshelfClient from "../BookshelfClient";
import { getBooks }
from "@/lib/notion/books";
import type { Book }
from "@/types/book";
// Mock dependencies jest.mock('@/lib/notion/books', () => ({ getBooks: jest.fn() }));
jest.mock('../BookshelfClient', () => { return function MockBookshelfClient({ books }: { books: Book[]
}) { return ( <div data-testid="bookshelf-client">
<h1>我的书架</h1>
<div data-testid="books-count">{books.length}
books</div>
<div data-testid="books-list"> {books.map(book => ( <div key={book.id}
data-testid={`book-${book.id}`}> {book.title}
by {book.author} </div> ))} </div> </div> ) }
});
const mockBooks: Book[] = [ { id: '1', title: '深入浅出设计模式', author: 'Eric Freeman', isbn: '978-0596007126', category: '技术', status: 'read', rating: 5, startDate: '2024-01-01', finishDate: '2024-01-15', cover: '/images/book1.jpg', takeaways: '设计模式的核心思想', tags: ['设计模式', '编程', '架构'], publishYear: 2004, pages: 694, language: '中文' }, { id: '2', title: '代码整洁之道', author: 'Robert C. Martin', category: '技术', status: 'reading', rating: 4, startDate: '2024-02-01', cover: '/images/book2.jpg', tags: ['编程', '重构'], pages: 464 }, { id: '3', title: '人月神话', author: 'Frederick P. Brooks Jr.', category: '管理', status: 'want-to-read', rating: 5, cover: '/images/book3.jpg', tags: ['项目管理', '软件工程']
}
]

describe('Bookshelf Page', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders BookshelfClient with books from getBooks', async () => { ;(getBooks as jest.Mock).mockResolvedValue(mockBooks) render(await BookshelfPage());
expect(screen.getByTestId('bookshelf-client')).toBeInTheDocument();
expect(screen.getByText('3 books')).toBeInTheDocument() });

it('passes all books to BookshelfClient', async () => { ;(getBooks as jest.Mock).mockResolvedValue(mockBooks) render(await BookshelfPage());
expect(screen.getByText('深入浅出设计模式 by Eric Freeman')).toBeInTheDocument();
expect(screen.getByText('代码整洁之道 by Robert C. Martin')).toBeInTheDocument();
expect(screen.getByText('人月神话 by Frederick P. Brooks Jr.')).toBeInTheDocument() });

it('handles empty books array', async () => { ;(getBooks as jest.Mock).mockResolvedValue([]) render(await BookshelfPage());
expect(screen.getByText('0 books')).toBeInTheDocument() });

it('calls getBooks exactly once', async () => { ;(getBooks as jest.Mock).mockResolvedValue(mockBooks) render(await BookshelfPage());
expect(getBooks).toHaveBeenCalledTimes(1) }) }) // Mock additional dependencies for BookshelfClient jest.mock('@/components/features/BookCard', () => { return function BookCard({ book, view }: any) { return ( <div data-testid={`book-card-${book.id}`}
data-view={view}>
<h3>{book.title}</h3>
<p>{book.author}</p>
<span>{book.status}</span> </div> ) }
}) jest.mock('@/components/features/ViewToggle', () => { return function ViewToggle({ view, onViewChange }: any) { return ( <div>
<button onClick={() => onViewChange('grid')}
aria-label="grid view">Grid</button>
<button onClick={() => onViewChange('list')}
aria-label="list view">List</button> </div> ) }
}) jest.mock('@/components/ui/LazyLoad', () => { return function LazyLoad({ children }: any) { return <div data-testid="lazy-load-wrapper">{children}</div> }
}) jest.mock('@/components/ui/Container', () => ({ PageContainer: ({ children, size }: any) => ( <div data-size={size}
className="page-container">{children}</div> ) }));
describe('BookshelfClient Component', () => { // Import the real component for client-side testing const RealBookshelfClient = jest.requireActual('../BookshelfClient').default beforeEach(() => { jest.clearAllMocks() });

it('renders page title and description', () => { render(<RealBookshelfClient books={mockBooks}
/>
);
expect(screen.getByText('我的书架')).toBeInTheDocument();
expect(screen.getByText('记录阅读历程，分享知识收获')).toBeInTheDocument() });

it('displays correct statistics', () => { const { container } = render(<RealBookshelfClient books={mockBooks}
/>) // Total expect(screen.getByText('3')).toBeInTheDocument();
expect(screen.getByText('总数')).toBeInTheDocument() // Check all statistics are displayed const stats = container.querySelectorAll('.text-2xl.font-bold');
expect(stats).toHaveLength(5) // Check specific labels exist (use getAllByText since they appear in multiple places);
expect(screen.getAllByText('已读').length).toBeGreaterThan(0);
expect(screen.getAllByText('在读').length).toBeGreaterThan(0);
expect(screen.getAllByText('想读').length).toBeGreaterThan(0) // Average rating (only 'read' books with rating);
expect(screen.getByText('5.0')).toBeInTheDocument();
expect(screen.getByText('平均评分')).toBeInTheDocument() });

it('filters books by status', async () => { const user = userEvent.setup();
const { container } = render(<RealBookshelfClient books={mockBooks}
/>) // Initially shows all books expect(container.querySelectorAll('[data-testid^="book-card-"]')).toHaveLength(3) // Filter by "已读" (read) - first select is status filter const selects = screen.getAllByRole('combobox');
const statusSelect = selects[0]
await user.selectOptions(statusSelect, 'read') // Should only show read books expect(screen.getByText('深入浅出设计模式')).toBeInTheDocument();
expect(screen.queryByText('代码整洁之道')).not.toBeInTheDocument();
expect(screen.queryByText('人月神话')).not.toBeInTheDocument() });

it('filters books by category', async () => { const user = userEvent.setup() render(<RealBookshelfClient books={mockBooks}
/>) // Filter by "技术" category const categorySelect = screen.getAllByRole('combobox')[1]
await user.selectOptions(categorySelect, '技术') // Should only show books in 技术 category expect(screen.getByText('深入浅出设计模式')).toBeInTheDocument();
expect(screen.getByText('代码整洁之道')).toBeInTheDocument();
expect(screen.queryByText('人月神话')).not.toBeInTheDocument() });

it('sorts books by date (default)', () => { render(<RealBookshelfClient books={mockBooks}
/>
);
const bookCards = screen.getAllByTestId(/^book-card-/) // Should be sorted by date (newest first) // Book 2 has the most recent start date (2024-02-01);
expect(bookCards[0]).toHaveTextContent('代码整洁之道') });

it('sorts books by rating', async () => { const user = userEvent.setup() render(<RealBookshelfClient books={mockBooks}
/>
);
const sortSelect = screen.getAllByRole('combobox')[2]
await user.selectOptions(sortSelect, 'rating');
const bookCards = screen.getAllByTestId(/^book-card-/) // Books with rating 5 should come first expect(bookCards[0]).toHaveTextContent(/深入浅出设计模式|人月神话/) });

it('sorts books by title', async () => { const user = userEvent.setup() render(<RealBookshelfClient books={mockBooks}
/>
);
const sortSelect = screen.getAllByRole('combobox')[2]
await user.selectOptions(sortSelect, 'title');
const bookCards = screen.getAllByTestId(/^book-card-/) // Should be sorted alphabetically by title expect(bookCards[0]).toHaveTextContent('人月神话');
expect(bookCards[1]).toHaveTextContent('代码整洁之道');
expect(bookCards[2]).toHaveTextContent('深入浅出设计模式') });

it('toggles between grid and list view', async () => { const user = userEvent.setup();
const { container } = render(<RealBookshelfClient books={mockBooks}
/>) // Initially in grid view expect(container.querySelector('.grid.grid-cols-1')).toBeInTheDocument() // Click list view button const listViewButton = screen.getByRole('button', { name: /list view/i }) await user.click(listViewButton) // Should switch to list view expect(container.querySelector('.space-y-4')).toBeInTheDocument();
expect(container.querySelector('.grid.grid-cols-1')).not.toBeInTheDocument() });

it('shows empty state when no books match filters', async () => { const user = userEvent.setup() render(<RealBookshelfClient books={mockBooks}
/>) // Filter by a category that has no books const categorySelect = screen.getAllByRole('combobox')[1]
await user.selectOptions(categorySelect, '管理') // Then filter by a status that doesn't match const statusSelect = screen.getAllByRole('combobox')[0]
await user.selectOptions(statusSelect, 'reading');
expect(screen.getByText('没有找到符合条件的书籍')).toBeInTheDocument() });

it('calculates average rating correctly', () => { const booksWithRatings: Book[] = [ { ...mockBooks[0], status: 'read', rating: 5 }, { ...mockBooks[1], status: 'read', rating: 3 }, { ...mockBooks[2], status: 'read', rating: 4 }
]
render(<RealBookshelfClient books={booksWithRatings}
/>) // Average should be (5 + 3 + 4) / 3 = 4.0 expect(screen.getByText('4.0')).toBeInTheDocument() });

it('handles books without optional fields', () => { const minimalBook: Book = { id: '4', title: 'Minimal Book', author: 'Test Author', category: 'Test', status: 'reading', rating: 3, cover: '/default.jpg', tags: []
}
render(<RealBookshelfClient books={[minimalBook]
}
/>
);
expect(screen.getByText('Minimal Book')).toBeInTheDocument() });

it('renders LazyLoad wrappers for performance', () => { const { container } = render(<RealBookshelfClient books={mockBooks}
/>) // LazyLoad components should be present const lazyLoadElements = container.querySelectorAll('[data-testid="lazy-load-wrapper"]');
expect(lazyLoadElements.length).toBe(mockBooks.length) });

it('preserves filter state when sorting changes', async () => { const user = userEvent.setup() render(<RealBookshelfClient books={mockBooks}
/>) // First filter by status const selects = screen.getAllByRole('combobox');
const statusSelect = selects[0]
await user.selectOptions(statusSelect, 'read') // Then change sort const sortSelect = selects[2]
await user.selectOptions(sortSelect, 'title') // Status filter should still be applied expect(screen.getByText('深入浅出设计模式')).toBeInTheDocument();
expect(screen.queryByText('代码整洁之道')).not.toBeInTheDocument() }) })
