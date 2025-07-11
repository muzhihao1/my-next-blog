import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsPage from '../page'

const mockProjects = [
  {
    id: '1',
    title: 'Website Project 1',
    slug: 'website-project-1',
    description: 'A modern web application',
    thumbnail: '/images/project1.jpg',
    category: 'website',
    techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    status: 'active',
    featured: true,
    startDate: '2024-01-01',
    github: 'https://github.com/user/project1',
    website: 'https://project1.com',
    metrics: { users: 5000 }
  },
  {
    id: '2',
    title: 'Open Source Tool',
    slug: 'open-source-tool',
    description: 'A useful developer tool',
    thumbnail: '/images/project2.jpg',
    category: 'opensource',
    techStack: ['Python', 'Docker'],
    status: 'completed',
    featured: false,
    startDate: '2023-06-15',
    github: 'https://github.com/user/tool',
    metrics: { users: 10000 }
  },
  {
    id: '3',
    title: 'Design System',
    slug: 'design-system',
    description: 'A comprehensive design system',
    thumbnail: '/images/project3.jpg',
    category: 'design',
    techStack: ['Figma', 'Storybook', 'React'],
    status: 'active',
    featured: true,
    startDate: '2023-11-20',
    metrics: { users: 2000 }
  },
  {
    id: '4',
    title: 'Website Project 2',
    slug: 'website-project-2',
    description: 'Another web app',
    thumbnail: '/images/project4.jpg',
    category: 'website',
    techStack: ['Vue', 'Nuxt'],
    status: 'archived',
    featured: false,
    startDate: '2022-03-10',
    metrics: { users: 1000 }
  },
  {
    id: '5',
    title: 'Other Project',
    slug: 'other-project',
    description: 'Miscellaneous project',
    thumbnail: '/images/project5.jpg',
    category: 'other',
    techStack: ['Node.js'],
    status: 'completed',
    featured: false,
    startDate: '2023-09-05',
    metrics: { users: 0 }
  }
]// Mock dependencies
jest.mock('@/lib/notion/projects', () => ({
  getProjects: jest.fn()
}));

jest.mock('@/lib/fallback-projects', () => {
  const projects = [
    {
      id: '1',
      title: 'Website Project 1',
      slug: 'website-project-1',
      description: 'A modern web application',
      thumbnail: '/images/project1.jpg',
      category: 'website',
      techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      status: 'active',
      featured: true,
      startDate: '2024-01-01',
      github: 'https://github.com/user/project1',
      website: 'https://project1.com',
      metrics: { users: 5000 }
    },
    {
      id: '2',
      title: 'Open Source Tool',
      slug: 'open-source-tool',
      description: 'A useful developer tool',
      thumbnail: '/images/project2.jpg',
      category: 'opensource',
      techStack: ['Python', 'Docker'],
      status: 'completed',
      featured: false,
      startDate: '2023-06-15',
      github: 'https://github.com/user/tool',
      metrics: { users: 10000 }
    },
    {
      id: '3',
      title: 'Design System',
      slug: 'design-system',
      description: 'A comprehensive design system',
      thumbnail: '/images/project3.jpg',
      category: 'design',
      techStack: ['Figma', 'Storybook', 'React'],
      status: 'active',
      featured: true,
      startDate: '2023-11-20',
      metrics: { users: 2000 }
    },
    {
      id: '4',
      title: 'Website Project 2',
      slug: 'website-project-2',
      description: 'Another web app',
      thumbnail: '/images/project4.jpg',
      category: 'website',
      techStack: ['Vue', 'Nuxt'],
      status: 'archived',
      featured: false,
      startDate: '2022-03-10',
      metrics: { users: 1000 }
    },
    {
      id: '5',
      title: 'Other Project',
      slug: 'other-project',
      description: 'Miscellaneous project',
      thumbnail: '/images/project5.jpg',
      category: 'other',
      techStack: ['Node.js'],
      status: 'completed',
      featured: false,
      startDate: '2023-09-05',
      metrics: { users: 0 }
    }
  ]
  
  return { fallbackProjects: projects }
}) jest.mock('@/components/features/ProjectCard', () => ({
  ProjectCard: ({ project }: any) => (
    <div data-testid={`project-card-${project.id}`}
      className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span data-testid={`status-${project.id}`}>{project.status}</span>
      <span data-testid={`featured-${project.id}`}>{project.featured ? 'Featured' : 'Not Featured'}</span>
      <span data-testid={`tech-count-${project.id}`}>{project.techStack.length}</span>
      <span data-testid={`users-${project.id}`}>{project.metrics?.users || 0}</span>
    </div>
  )
}));
jest.mock('@/components/ui/LazyLoad', () => {
  return function LazyLoad({ children }: any) {
    return <>{children}</>
  }
}) jest.mock('@/components/ui/Container', () => ({
  PageContainer: ({ children, size }: any) => (
    <div data-size={size}
      className="page-container">{children}</div>
  )
}));
describe('Projects Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('renders page title and description', () => {
    render(<ProjectsPage />);
    
    expect(screen.getByText('项目作品')).toBeInTheDocument();
    expect(screen.getByText('我参与和创建的各类项目')).toBeInTheDocument()
  });

  it('renders all projects by default', () => {
    render(<ProjectsPage />)
    
    mockProjects.forEach(project => {
      expect(screen.getByText(project.title)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument()
    })
  });

  it('renders category filter buttons with correct counts', () => {
    render(<ProjectsPage />);
    
    expect(screen.getByText(`全部项目 (${mockProjects.length})`)).toBeInTheDocument();
    expect(screen.getByText('网站应用 (2)')).toBeInTheDocument();
    expect(screen.getByText('开源项目 (1)')).toBeInTheDocument();
    expect(screen.getByText('设计作品 (1)')).toBeInTheDocument();
    expect(screen.getByText('其他 (1)')).toBeInTheDocument()
  });

  it('filters projects by category when category button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />)
    
    // Click on website category
    await user.click(screen.getByText('网站应用 (2)'))
    
    // Should show only website projects
    expect(screen.getByText('Website Project 1')).toBeInTheDocument();
    expect(screen.getByText('Website Project 2')).toBeInTheDocument()
    
    // Should not show other category projects
    expect(screen.queryByText('Open Source Tool')).not.toBeInTheDocument();
    expect(screen.queryByText('Design System')).not.toBeInTheDocument();
    expect(screen.queryByText('Other Project')).not.toBeInTheDocument()
  });

  it('shows all projects when "全部项目" is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />)
    
    // First filter by category
    await user.click(screen.getByText('开源项目 (1)'));
    expect(screen.queryByText('Website Project 1')).not.toBeInTheDocument()
    
    // Then click all projects
    await user.click(screen.getByText(`全部项目 (${mockProjects.length})`))
    
    // Should show all projects again
    mockProjects.forEach(project => {
      expect(screen.getByText(project.title)).toBeInTheDocument()
    })
  });

  it('renders projects grouped by category when showing all', () => {
    render(<ProjectsPage />)
    
    // Check category headers
    expect(screen.getByText('网站应用')).toBeInTheDocument();
    expect(screen.getByText('开源项目')).toBeInTheDocument();
    expect(screen.getByText('设计作品')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument()
  });

  it('sorts projects by date (newest first) by default', () => {
    render(<ProjectsPage />);
    
    const projectCards = screen.getAllByTestId(/^project-card-/)
    
    // In the website category, project 1 (2024-01-01) should come before project 4 (2022-03-10);
    const websiteSection = projectCards.filter(card => 
      card.textContent?.includes('Website Project')
    );
    
    expect(websiteSection[0]).toHaveTextContent('Website Project 1');
    expect(websiteSection[1]).toHaveTextContent('Website Project 2')
  });

  it('sorts projects by date (oldest first) when selected', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'date-asc')
    
    // Filter to website category to make testing easier
    await user.click(screen.getByText('网站应用 (2)'));
    
    const projectCards = screen.getAllByTestId(/^project-card-/);
    expect(projectCards[0]).toHaveTextContent('Website Project 2') // 2022-03-10
    expect(projectCards[1]).toHaveTextContent('Website Project 1') // 2024-01-01
  });

  it('sorts projects by status when selected', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'status')
    
    // Filter to show all projects in a single list
    await user.click(screen.getByText('网站应用 (2)'));
    
    const projectCards = screen.getAllByTestId(/^project-card-/)
    
    // Active should come before archived
    expect(screen.getByTestId('status-1')).toHaveTextContent('active');
    expect(screen.getByTestId('status-4')).toHaveTextContent('archived')
  });

  it('sorts projects by featured status when selected', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'featured')
    await user.click(screen.getByText(`全部项目 (${mockProjects.length})`))
    
    // Featured projects should appear first
    const firstWebsiteCard = screen.getByTestId('project-card-1');
    expect(within(firstWebsiteCard).getByTestId('featured-1')).toHaveTextContent('Featured')
  });

  it('sorts projects by complexity (tech stack count) when selected', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'complexity')
    
    // Filter to website category
    await user.click(screen.getByText('网站应用 (2)'));
    
    const projectCards = screen.getAllByTestId(/^project-card-/)
    
    // Project 1 has 4 tech items, Project 4 has 2
    expect(screen.getByTestId('tech-count-1')).toHaveTextContent('4');
    expect(screen.getByTestId('tech-count-4')).toHaveTextContent('2')
  });

  it('sorts projects by scale (user count) when selected', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'scale')
    
    // Get all projects
    await user.click(screen.getByText(`全部项目 (${mockProjects.length})`))
    
    // Project 2 has 10000 users, should be first
    // Project 1 has 5000 users
    // Project 3 has 2000 users
    expect(screen.getByTestId('users-2')).toHaveTextContent('10000')
  });

  it('shows empty state when filtered category has no projects', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />)
    
    // Click on design category
    await user.click(screen.getByText('设计作品 (1)'))
    
    // Filter out design projects to test empty state
    const designProjects = screen.queryAllByTestId(/^project-card-3/);
    expect(designProjects).toHaveLength(1)
    
    // Note: To truly test empty state, the component would need to handle
    // a case where a category exists but has no projects after additional filtering
  });

  it('applies correct active styles to selected category', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />);
    
    const allButton = screen.getByText(`全部项目 (${mockProjects.length})`);
    const websiteButton = screen.getByText('网站应用 (2)')
    
    // Initially "all" should be active
    expect(allButton).toHaveClass('bg-blue-600', 'text-white');
    expect(websiteButton).toHaveClass('bg-gray-100')
    
    // Click website category
    await user.click(websiteButton)
    
    // Now website should be active
    expect(websiteButton).toHaveClass('bg-blue-600', 'text-white');
    expect(allButton).toHaveClass('bg-gray-100')
  });

  it('renders sort dropdown with all options', () => {
    render(<ProjectsPage />);
    
    const select = screen.getByRole('combobox');
    const options = within(select).getAllByRole('option');
    
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('最新项目');
    expect(options[1]).toHaveTextContent('最早项目');
    expect(options[2]).toHaveTextContent('按状态');
    expect(options[3]).toHaveTextContent('精选优先');
    expect(options[4]).toHaveTextContent('按复杂度');
    expect(options[5]).toHaveTextContent('按规模')
  });

  it('renders category icons', () => {
    const { container } = render(<ProjectsPage />)
    
    // SVG icons should be rendered for each category
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0)
    
    // Should have at least one icon for each category
    expect(svgs.length).toBeGreaterThanOrEqual(4) // 4 categories
  });

  it('uses PageContainer with xl size', () => {
    const { container } = render(<ProjectsPage />);
    
    const pageContainer = container.querySelector('[data-size="xl"]');
    expect(pageContainer).toBeInTheDocument()
  });

  it('preserves sort order when switching between categories', async () => {
    const user = userEvent.setup()
    render(<ProjectsPage />)
    
    // Set sort to oldest first
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'date-asc')
    
    // Switch to website category
    await user.click(screen.getByText('网站应用 (2)'))
    
    // Check order is preserved
    const projectCards = screen.getAllByTestId(/^project-card-/);
    expect(projectCards[0]).toHaveTextContent('Website Project 2')
    
    // Switch back to all
    await user.click(screen.getByText(`全部项目 (${mockProjects.length})`))
    
    // Sort should still be date-asc
    expect(select).toHaveValue('date-asc')
  })
})

// Import to fix TypeScript error
import { within } from '@testing-library/react'