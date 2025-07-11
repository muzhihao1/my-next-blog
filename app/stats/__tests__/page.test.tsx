import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatsPage from "../page";
import StatsClient from "../StatsClient";
import { getBlogStatistics } from "@/lib/statistics";
import type { BlogStatistics } from "@/lib/statistics";

// Mock dependencies
jest.mock('@/lib/statistics', () => ({
  getBlogStatistics: jest.fn()
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href}
      className={className}>
      {children}
    </a>
  )
}));
const mockStatistics: BlogStatistics = {
  posts: {
    total: 42,
    categories: {
      '技术': 20,
      '生活': 10,
      '思考': 8,
      '其他': 4
    },
    tags: {
      'React': 15,
      'Next.js': 12,
      'TypeScript': 10,
      'JavaScript': 8,
      'CSS': 6,
      'Node.js': 5,
      'Docker': 3,
      'Git': 2
    },
    totalWords: 125000,
    averageWords: 2976,
    totalReadingTime: 625,
    latestPost: {
      title: '使用 Next.js 15 构建现代化博客',
      date: '2024-01-15',
      slug: 'nextjs-15-blog'
    }
  },
  projects: {
    total: 15,
    active: 3,
    completed: 10,
    categories: {
      '前端': 8,
      '后端': 4,
      '全栈': 3
    },
    technologies: {
      'React': 10,
      'TypeScript': 8,
      'Node.js': 6,
      'PostgreSQL': 4,
      'Docker': 3,
      'Redis': 2
    }
  },
  books: {
    total: 85,
    read: 50,
    reading: 5,
    wantToRead: 30,
    categories: {
      '技术': 35,
      '文学': 20,
      '历史': 15,
      '哲学': 10,
      '其他': 5
    },
    averageRating: 4.2,
    totalPages: 25000
  },
  tools: {
    total: 25,
    categories: {
      '开发工具': 10,
      '设计工具': 5,
      '效率工具': 5,
      '在线服务': 3,
      '硬件设备': 2
    },
    featured: 8,
    averageRating: 4.5
  },
  overall: {
    totalContent: 167,
    lastUpdated: '2024-01-15T08:00:00Z'
  }
}
// Helper to render async server components
async function renderAsync(component: Promise<JSX.Element>) {
  const resolvedComponent = await component
  return render(resolvedComponent)
}

describe('StatsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('renders stats page with initial statistics', async () => {
    ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics)
    await renderAsync(StatsPage())
    
    // Page title
    expect(screen.getByText('数据统计')).toBeInTheDocument();
    expect(screen.getByText('博客内容数据概览和分析')).toBeInTheDocument()
    
    // Overview cards
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('文章总数')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('项目总数')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('书籍总数')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('工具总数')).toBeInTheDocument()
  });

  it('passes statistics to client component', async () => {
    ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics)
    await renderAsync(StatsPage())
    
    // Check that statistics are displayed
    expect(screen.getByText('125,000 字')).toBeInTheDocument();
    expect(screen.getByText('2,976 字/篇')).toBeInTheDocument()
  })
});

describe('StatsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })
  
  afterEach(() => {
    jest.restoreAllMocks()
  });

  it('renders all statistics sections', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Section titles
    expect(screen.getByText('📝 文章统计')).toBeInTheDocument();
    expect(screen.getByText('🚀 项目统计')).toBeInTheDocument();
    expect(screen.getByText('📚 阅读统计')).toBeInTheDocument();
    expect(screen.getByText('🛠️ 工具统计')).toBeInTheDocument()
  });

  it('displays post statistics correctly', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Basic data
    expect(screen.getByText('总字数')).toBeInTheDocument();
    expect(screen.getByText('125,000 字')).toBeInTheDocument();
    expect(screen.getByText('平均字数')).toBeInTheDocument();
    expect(screen.getByText('2,976 字/篇')).toBeInTheDocument();
    expect(screen.getByText('总阅读时间')).toBeInTheDocument();
    expect(screen.getByText('625 分钟')).toBeInTheDocument()
    
    // Latest post
    expect(screen.getByText('最新文章')).toBeInTheDocument();
    expect(screen.getByText('使用 Next.js 15 构建现代化博客')).toBeInTheDocument();
    const postLink = screen.getByRole('link', { name: '使用 Next.js 15 构建现代化博客' });
    expect(postLink).toHaveAttribute('href', '/posts/nextjs-15-blog')
  });

  it('displays category distribution with progress bars', () => {
    const { container } = render(<StatsClient initialStats={mockStatistics} />)
    
    // Category distribution
    expect(screen.getByText('分类分布')).toBeInTheDocument()
    
    // Find the category section specifically
    const categorySection = screen.getByText('分类分布').closest('.bg-white');
    expect(categorySection).toHaveTextContent('技术');
    expect(categorySection).toHaveTextContent('20 篇')
    
    // Check progress bar width
    const progressBars = categorySection?.querySelectorAll('.bg-blue-600');
    expect(progressBars?.length).toBeGreaterThan(0);
    expect(progressBars?.[0]).toHaveStyle({ width: '48%' }) // 20/42 ≈ 48%
  });

  it('displays popular tags', () => {
    render(<StatsClient initialStats={mockStatistics} />);
    
    expect(screen.getByText('热门标签')).toBeInTheDocument();
    expect(screen.getByText('React (15)')).toBeInTheDocument();
    expect(screen.getByText('Next.js (12)')).toBeInTheDocument();
    expect(screen.getByText('TypeScript (10)')).toBeInTheDocument()
  });

  it('displays project statistics', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Project status
    expect(screen.getByText('项目状态')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument()
    
    // Technologies
    expect(screen.getByText('技术栈使用')).toBeInTheDocument();
    expect(screen.getByText('React (10)')).toBeInTheDocument();
    expect(screen.getByText('TypeScript (8)')).toBeInTheDocument()
  });

  it('displays reading statistics', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Reading progress
    expect(screen.getByText('阅读进度')).toBeInTheDocument()
    
    // Find the reading progress section specifically
    const readingProgressSection = screen.getByText('阅读进度').closest('.bg-white');
    expect(readingProgressSection).toHaveTextContent('已读');
    expect(readingProgressSection).toHaveTextContent('50 本');
    expect(readingProgressSection).toHaveTextContent('在读');
    expect(readingProgressSection).toHaveTextContent('5 本');
    expect(readingProgressSection).toHaveTextContent('想读');
    expect(readingProgressSection).toHaveTextContent('30 本')
    
    // Reading data
    const readingDataSection = screen.getByText('阅读数据').closest('.bg-white');
    expect(readingDataSection).toHaveTextContent('平均评分');
    expect(readingDataSection).toHaveTextContent('⭐ 4.2');
    expect(readingDataSection).toHaveTextContent('总页数');
    expect(readingDataSection).toHaveTextContent('25,000 页')
  });

  it('displays tool statistics', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Tool overview
    expect(screen.getByText('工具概览')).toBeInTheDocument();
    expect(screen.getByText('精选工具')).toBeInTheDocument();
    expect(screen.getByText('8 个')).toBeInTheDocument();
    expect(screen.getAllByText('平均评分').length).toBeGreaterThan(0);
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument()
    
    // Tool categories
    expect(screen.getByText('工具分类')).toBeInTheDocument();
    expect(screen.getByText('开发工具')).toBeInTheDocument();
    expect(screen.getByText('10 个')).toBeInTheDocument()
  });

  it('displays overall statistics', () => {
    render(<StatsClient initialStats={mockStatistics} />);
    
    expect(screen.getByText('167')).toBeInTheDocument();
    expect(screen.getByText('总内容数')).toBeInTheDocument();
    expect(screen.getByText(/最后更新:/)).toBeInTheDocument()
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    const updatedStats = {
      ...mockStatistics,
      posts: { ...mockStatistics.posts, total: 45 }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedStats
    })
    
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Initial state - should show 42
    expect(screen.getByText('42')).toBeInTheDocument();
    
    const refreshButton = screen.getByRole('button', { name: '刷新数据' })
    await user.click(refreshButton)
    
    // Wait for update
    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument()
    })
    
    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalledWith('/api/statistics')
  });

  it('handles refresh error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<StatsClient initialStats={mockStatistics} />);
    
    const refreshButton = screen.getByRole('button', { name: '刷新数据' })
    await user.click(refreshButton)
    
    await waitFor(() => {
      expect(screen.getByText('刷新数据')).toBeInTheDocument()
    })
    
    // Original data should still be displayed
    expect(screen.getByText('42')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  });

  it('formats large numbers correctly', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Check Chinese number formatting
    expect(screen.getByText('125,000 字')).toBeInTheDocument();
    expect(screen.getByText('25,000 页')).toBeInTheDocument()
  });

  it('calculates percentages correctly', () => {
    const { container } = render(<StatsClient initialStats={mockStatistics} />)
    
    // Check category percentage calculation
    // 技术: 20/42 = 47.6% ≈ 48%
    const techProgressBar = container.querySelector('.bg-blue-600');
    expect(techProgressBar).toHaveStyle({ width: '48%' })
  });

  it('shows top 5 items in category lists', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Book categories should show top 5
    const bookCategorySection = screen.getByText('书籍分类').closest('div');
    const categoryItems = bookCategorySection?.querySelectorAll('.flex.justify-between');
    expect(categoryItems?.length).toBe(5)
  });

  it('shows top 20 tags', () => {
    const statsWithManyTags = {
      ...mockStatistics,
      posts: {
        ...mockStatistics.posts,
        tags: Object.fromEntries(
          Array.from({ length: 25 }, (_, i) => [`Tag${i}`, 25 - i])
        )
      }
    }
    
    render(<StatsClient initialStats={statsWithManyTags} />);
    
    const tagSection = screen.getByText('热门标签').closest('div');
    const tags = tagSection?.querySelectorAll('.px-3.py-1');
    expect(tags?.length).toBe(20)
  });

  it('handles empty statistics gracefully', () => {
    const emptyStats: BlogStatistics = {
      posts: {
        total: 0,
        categories: {},
        tags: {},
        totalWords: 0,
        averageWords: 0,
        totalReadingTime: 0
      },
      projects: {
        total: 0,
        active: 0,
        completed: 0,
        categories: {},
        technologies: {}
      },
      books: {
        total: 0,
        read: 0,
        reading: 0,
        wantToRead: 0,
        categories: {},
        averageRating: 0,
        totalPages: 0
      },
      tools: {
        total: 0,
        categories: {},
        featured: 0,
        averageRating: 0
      },
      overall: {
        totalContent: 0,
        lastUpdated: new Date().toISOString()
      }
    }
    
    render(<StatsClient initialStats={emptyStats} />)
    
    // Should render without errors
    expect(screen.getByText('数据统计')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  });

  it('handles missing latest post', () => {
    const statsWithoutLatest = {
      ...mockStatistics,
      posts: {
        ...mockStatistics.posts,
        latestPost: undefined
      }
    }
    
    render(<StatsClient initialStats={statsWithoutLatest} />)
    
    // Should not show latest post section
    expect(screen.queryByText('最新文章')).not.toBeInTheDocument()
  });

  it('applies correct styling classes', () => {
    render(<StatsClient initialStats={mockStatistics} />)
    
    // Check for responsive grid classes
    const overviewGrid = screen.getByText('文章总数').closest('.grid');
    expect(overviewGrid).toHaveClass('grid-cols-2', 'md:grid-cols-4')
  })
})
