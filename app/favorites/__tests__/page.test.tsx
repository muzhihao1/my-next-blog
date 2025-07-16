import { render, screen, fireEvent, waitFor }
from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavoritesPage from "../page";
import { useFavorites, FavoriteType }
from "@/lib/hooks/useFavorites";
// Mock the useFavorites hook jest.mock('@/lib/hooks/useFavorites', () => ({ ...jest.requireActual('@/lib/hooks/useFavorites'), useFavorites: jest.fn(), FavoriteType: { POST: 'post', PROJECT: 'project', BOOK: 'book', TOOL: 'tool' }, formatFavoriteDate: jest.fn((date) => { const d = new Date(date) return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` }), getFavoriteStats: jest.fn((favorites) => ({ total: favorites.length, byType: favorites.reduce((acc: any, item: any) => { acc[item.type] = (acc[item.type] || 0) + 1 return acc }, {}) })) }));
jest.mock('next/link', () => { return ({ children, href, ...props }: any) => ( <a href={href} {...props}>{children}</a> ) }) jest.mock('next/image', () => { return function Image({ src, alt, fill, ...props }: any) { return <img src={src}
alt={alt} {...props}
/> }
}) jest.mock('@/components/features/FavoriteButton', () => ({ __esModule: true, default: ({ itemId, onToggle, size, showText }: any) => ( <button data-testid={`favorite-button-${itemId}`}
onClick={onToggle}
data-size={size}
data-show-text={showText} > {showText !== false ? 'Remove' : '❤️'} </button> ) }));
const mockFavorites = [ { id: 'post-1', type: FavoriteType.POST, title: 'React Best Practices', description: 'Learn the best practices for React development', thumbnail: '/images/react.jpg', slug: 'react-best-practices', favoriteDate: new Date('2024-01-15') }, { id: 'project-1', type: FavoriteType.PROJECT, title: 'E-commerce Platform', description: 'A modern e-commerce solution', thumbnail: '/images/ecommerce.jpg', slug: 'ecommerce-platform', favoriteDate: new Date('2024-01-14') }, { id: 'book-1', type: FavoriteType.BOOK, title: 'Clean Code', description: 'A handbook of agile software craftsmanship', thumbnail: '/images/clean-code.jpg', favoriteDate: new Date('2024-01-13') }, { id: 'tool-1', type: FavoriteType.TOOL, title: 'VS Code', description: 'Code editor redefined', favoriteDate: new Date('2024-01-12') }
]

describe('Favorites Page', () => { const mockUseFavorites = { favorites: mockFavorites, isLoading: false, clearFavorites: jest.fn(), getFavoritesByType: jest.fn((type) => mockFavorites.filter(f => f.type === type) ), addFavorite: jest.fn(), removeFavorite: jest.fn(), isFavorite: jest.fn() }

beforeEach(() => { jest.clearAllMocks() ;(useFavorites as jest.Mock).mockReturnValue(mockUseFavorites) });

it('renders page title and total count', () => { render(<FavoritesPage />
);
expect(screen.getByText('我的收藏')).toBeInTheDocument();
expect(screen.getByText('共收藏了 4 个内容')).toBeInTheDocument() });

it('renders loading state', () => { ;(useFavorites as jest.Mock).mockReturnValue({ ...mockUseFavorites, isLoading: true });
const { container } = render(<FavoritesPage />
);
expect(container.querySelector('.animate-pulse')).toBeInTheDocument() });

it('renders statistics for each type', () => { const { container } = render(<FavoritesPage />) // Check statistics section const statsGrid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
expect(statsGrid).toBeInTheDocument() // Check that all type stats are shown const statBoxes = statsGrid?.querySelectorAll('.bg-white.dark\\:bg-gray-800');
expect(statBoxes).toHaveLength(4) // Check labels exist (there are multiple instances of each);
expect(screen.getAllByText('文章').length).toBeGreaterThan(0);
expect(screen.getAllByText('项目').length).toBeGreaterThan(0);
expect(screen.getAllByText('书籍').length).toBeGreaterThan(0);
expect(screen.getAllByText('工具').length).toBeGreaterThan(0) });

it('renders all favorite items', () => { render(<FavoritesPage />
);
expect(screen.getByText('React Best Practices')).toBeInTheDocument();
expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
expect(screen.getByText('Clean Code')).toBeInTheDocument();
expect(screen.getByText('VS Code')).toBeInTheDocument() });

it('filters favorites by type when type button is clicked', async () => { const user = userEvent.setup() render(<FavoritesPage />) // Click on 文章 (posts) filter const postFilterButton = screen.getAllByText('文章')[1] // Second one is the filter button await user.click(postFilterButton) // Should only show post items expect(screen.getByText('React Best Practices')).toBeInTheDocument();
expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
expect(screen.queryByText('VS Code')).not.toBeInTheDocument() });

it('shows all items when 全部 is clicked', async () => { const user = userEvent.setup() render(<FavoritesPage />) // First filter by type await user.click(screen.getAllByText('文章')[1]);
expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument() // Then click 全部 await user.click(screen.getByText('全部')) // Should show all items again expect(screen.getByText('React Best Practices')).toBeInTheDocument();
expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
expect(screen.getByText('Clean Code')).toBeInTheDocument();
expect(screen.getByText('VS Code')).toBeInTheDocument() });

it('searches favorites by title', async () => { const user = userEvent.setup() render(<FavoritesPage />
);
const searchInput = screen.getByPlaceholderText('搜索收藏...') await user.type(searchInput, 'React') // Should only show items matching search expect(screen.getByText('React Best Practices')).toBeInTheDocument();
expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();
expect(screen.queryByText('VS Code')).not.toBeInTheDocument() });

it('searches favorites by description', async () => { const user = userEvent.setup() render(<FavoritesPage />
);
const searchInput = screen.getByPlaceholderText('搜索收藏...') await user.type(searchInput, 'agile') // Should show items with matching description expect(screen.getByText('Clean Code')).toBeInTheDocument();
expect(screen.queryByText('React Best Practices')).not.toBeInTheDocument() });

it('sorts favorites by date (default)', () => { render(<FavoritesPage />
);
const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent) // Should be sorted by date descending (newest first);
expect(titles).toEqual([ 'React Best Practices', 'E-commerce Platform', 'Clean Code', 'VS Code' ]) });

it('sorts favorites by title when selected', async () => { const user = userEvent.setup() render(<FavoritesPage />
);
const sortSelect = screen.getByRole('combobox') await user.selectOptions(sortSelect, 'title');
const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent) // Should be sorted alphabetically expect(titles).toEqual([ 'Clean Code', 'E-commerce Platform', 'React Best Practices', 'VS Code' ]) });

it('calls clearFavorites when clear button is clicked', async () => { const user = userEvent.setup() render(<FavoritesPage />
);
const clearButton = screen.getByText('清空收藏') await user.click(clearButton);
expect(mockUseFavorites.clearFavorites).toHaveBeenCalledTimes(1) });

it('renders empty state when no favorites', () => { ;(useFavorites as jest.Mock).mockReturnValue({ ...mockUseFavorites, favorites: []
}) render(<FavoritesPage />
);
expect(screen.getByText('还没有收藏任何内容')).toBeInTheDocument();
expect(screen.getByText('去探索内容')).toHaveAttribute('href', '/') });

it('renders empty search state when no matches', async () => { const user = userEvent.setup() render(<FavoritesPage />
);
const searchInput = screen.getByPlaceholderText('搜索收藏...') await user.type(searchInput, 'nonexistent');
expect(screen.getByText('没有找到匹配的收藏')).toBeInTheDocument() // Should not show explore button when searching expect(screen.queryByText('去探索内容')).not.toBeInTheDocument() });

it('renders favorite cards with correct links', () => { render(<FavoritesPage />) // Check post link const postLink = screen.getAllByRole('link', { name: /React Best Practices/ })[0]
expect(postLink).toHaveAttribute('href', '/posts/react-best-practices') // Check project link const projectLink = screen.getAllByRole('link', { name: /E-commerce Platform/ })[0]
expect(projectLink).toHaveAttribute('href', '/projects/ecommerce-platform') // Check book link const bookLink = screen.getAllByRole('link', { name: /Clean Code/ })[0]
expect(bookLink).toHaveAttribute('href', '/bookshelf/book-1') // Check tool link const toolLink = screen.getAllByRole('link', { name: /VS Code/ })[0]
expect(toolLink).toHaveAttribute('href', '/tools#tool-1') });

it('renders thumbnails when available', () => { render(<FavoritesPage />
);
const thumbnail = screen.getByAltText('React Best Practices');
expect(thumbnail).toHaveAttribute('src', '/images/react.jpg') });

it('renders favorite dates correctly', () => { render(<FavoritesPage />
);
expect(screen.getByText('2024-01-15')).toBeInTheDocument();
expect(screen.getByText('2024-01-14')).toBeInTheDocument();
expect(screen.getByText('2024-01-13')).toBeInTheDocument();
expect(screen.getByText('2024-01-12')).toBeInTheDocument() });

it('applies correct type colors to badges', () => { const { container } = render(<FavoritesPage />) // Find badges within the favorite cards (not the filter buttons);
const favoriteCards = container.querySelectorAll('.group.relative.bg-white') // Check first card (post type);
const postBadge = favoriteCards[0].querySelector('.bg-blue-100');
expect(postBadge).toBeInTheDocument();
expect(postBadge).toHaveTextContent('文章') // Check second card (project type);
const projectBadge = favoriteCards[1].querySelector('.bg-green-100');
expect(projectBadge).toBeInTheDocument();
expect(projectBadge).toHaveTextContent('项目') // Check third card (book type);
const bookBadge = favoriteCards[2].querySelector('.bg-purple-100');
expect(bookBadge).toBeInTheDocument();
expect(bookBadge).toHaveTextContent('书籍') // Check fourth card (tool type);
const toolBadge = favoriteCards[3].querySelector('.bg-orange-100');
expect(toolBadge).toBeInTheDocument();
expect(toolBadge).toHaveTextContent('工具') });

it('combines filtering and searching', async () => { const user = userEvent.setup() render(<FavoritesPage />) // First filter by project type await user.click(screen.getAllByText('项目')[1]) // Then search const searchInput = screen.getByPlaceholderText('搜索收藏...') await user.type(searchInput, 'commerce') // Should show only projects matching search expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
expect(screen.queryByText('React Best Practices')).not.toBeInTheDocument() });

it('does not show clear button when no favorites', () => { ;(useFavorites as jest.Mock).mockReturnValue({ ...mockUseFavorites, favorites: []
}) render(<FavoritesPage />
);
expect(screen.queryByText('清空收藏')).not.toBeInTheDocument() }) })
