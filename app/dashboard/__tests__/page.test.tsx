import { render, screen }
from "@testing-library/react";
import DashboardPage from "../page";
import { getBlogStatistics }
from "@/lib/statistics";
// Mock dependencies jest.mock('@/lib/statistics', () => ({ getBlogStatistics: jest.fn() }));
jest.mock('@/components/dashboard/ContentDashboard', () => { return function ContentDashboard({ statistics }: any) { return ( <div data-testid="content-dashboard">
<h1>数据仪表板</h1>
<div data-testid="statistics">
<div>文章总数: {statistics.posts.total}</div>
<div>评论总数: {statistics.comments.total}</div>
<div>点赞总数: {statistics.likes.total}</div>
<div>访问量: {statistics.views.total}</div>
<div>活跃用户: {statistics.users.activeCount}</div> </div> </div> ) }
});
const mockStatistics = { posts: { total: 120, published: 100, draft: 20, thisMonth: 8, lastMonth: 12, growth: -33.33 }, comments: { total: 500, thisMonth: 45, lastMonth: 38, growth: 18.42, averagePerPost: 5 }, likes: { total: 1200, thisMonth: 150, lastMonth: 120, growth: 25, topPosts: []
}, views: { total: 50000, thisMonth: 5000, lastMonth: 4500, growth: 11.11, averagePerPost: 500 }, users: { total: 1000, activeCount: 250, newThisMonth: 50, retention: 0.75 }, categories: { Technology: 40, Design: 30, Productivity: 20, Life: 30 }, tags: { popular: ['react', 'nextjs', 'typescript', 'design', 'productivity'], trending: ['ai', 'chatgpt', 'web3']
}, performance: { avgLoadTime: 1.2, avgTimeOnPage: 180, bounceRate: 0.35 }
}

describe('Dashboard Page', () => { beforeEach(() => { jest.clearAllMocks() });

it('renders ContentDashboard component', async () => { ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics) render(await DashboardPage());
expect(screen.getByTestId('content-dashboard')).toBeInTheDocument() });

it('passes statistics to ContentDashboard', async () => { ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics) render(await DashboardPage());
expect(screen.getByText('文章总数: 120')).toBeInTheDocument();
expect(screen.getByText('评论总数: 500')).toBeInTheDocument();
expect(screen.getByText('点赞总数: 1200')).toBeInTheDocument();
expect(screen.getByText('访问量: 50000')).toBeInTheDocument();
expect(screen.getByText('活跃用户: 250')).toBeInTheDocument() });

it('calls getBlogStatistics on render', async () => { ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics) render(await DashboardPage());
expect(getBlogStatistics).toHaveBeenCalledTimes(1) });

it('renders with correct layout classes', async () => { ;(getBlogStatistics as jest.Mock).mockResolvedValue(mockStatistics);
const { container } = render(await DashboardPage());
const pageWrapper = container.firstChild as HTMLElement expect(pageWrapper).toHaveClass('min-h-screen', 'bg-gray-50', "", 'py-16');
const maxWidthContainer = container.querySelector('.max-w-7xl');
expect(maxWidthContainer).toBeInTheDocument();
expect(maxWidthContainer).toHaveClass('mx-auto') });

it('handles empty statistics gracefully', async () => { const emptyStatistics = { posts: { total: 0, published: 0, draft: 0, thisMonth: 0, lastMonth: 0, growth: 0 }, comments: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, averagePerPost: 0 }, likes: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, topPosts: []
}, views: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0, averagePerPost: 0 }, users: { total: 0, activeCount: 0, newThisMonth: 0, retention: 0 }, categories: {}, tags: { popular: [], trending: []
}, performance: { avgLoadTime: 0, avgTimeOnPage: 0, bounceRate: 0 }
};(getBlogStatistics as jest.Mock).mockResolvedValue(emptyStatistics) render(await DashboardPage());
expect(screen.getByText('文章总数: 0')).toBeInTheDocument();
expect(screen.getByText('评论总数: 0')).toBeInTheDocument();
expect(screen.getByText('点赞总数: 0')).toBeInTheDocument();
expect(screen.getByText('访问量: 0')).toBeInTheDocument();
expect(screen.getByText('活跃用户: 0')).toBeInTheDocument() });

it('handles error from getBlogStatistics', async () => { const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation() ;(getBlogStatistics as jest.Mock).mockRejectedValue(new Error('Failed to fetch statistics'));
await expect(DashboardPage()).rejects.toThrow('Failed to fetch statistics') consoleErrorSpy.mockRestore() }) })
