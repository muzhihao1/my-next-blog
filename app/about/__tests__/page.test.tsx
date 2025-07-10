import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import About from "../page";
// Mock components jest.mock('@/components/features/SkillsSection', () => ({ __esModule: true, default: () =>
<div data-testid="skills-section">Skills Section Component</div> }));
jest.mock('@/components/features/Timeline', () => ({ __esModule: true, default: () =>
<div data-testid="timeline">Timeline Component</div> }));
jest.mock('@/components/features/ContactInfo', () => ({ __esModule: true, default: () =>
<div data-testid="contact-info">Contact Info Component</div> }));
jest.mock('@/components/seo/SEO', () => ({ SEO: ({ structuredData }: any) => ( <div data-testid="seo" data-structured-data={JSON.stringify(structuredData)}
/> ), generatePersonStructuredData: (data: any) => ({ '@type': 'Person', ...data }) }));
describe('About Page', () => { it('renders all sections correctly', () => { render(<About />) // Hero section expect(screen.getByText('你好，我是 Zhihao Mu')).toBeInTheDocument();
expect(screen.getByText('全栈开发者 / 技术作家 / 终身学习者')).toBeInTheDocument();
expect(screen.getByText('热爱技术，享受创造。专注于构建优雅的解决方案，分享知识与经验。')).toBeInTheDocument() // Story section expect(screen.getByText('我的故事')).toBeInTheDocument();
expect(screen.getByText(/从第一次接触编程开始/)).toBeInTheDocument();
expect(screen.getByText(/Hello World/)).toBeInTheDocument() // Section headings expect(screen.getByText('技术栈')).toBeInTheDocument();
expect(screen.getByText('职业经历')).toBeInTheDocument();
expect(screen.getByText('我的价值观')).toBeInTheDocument();
expect(screen.getByText('联系我')).toBeInTheDocument();
expect(screen.getByText('订阅博客')).toBeInTheDocument() });
it('renders hero section with avatar emoji', () => { render(<About />
);
expect(screen.getByText('👨‍💻')).toBeInTheDocument();
expect(screen.getByText('👨‍💻').parentElement).toHaveClass('w-48', 'h-48', 'rounded-full') });
it('renders story paragraphs', () => { render(<About />
);
expect(screen.getByText(/从第一次接触编程开始/)).toBeInTheDocument();
expect(screen.getByText(/这些年来，我在前端开发、后端架构、产品设计等领域都有所涉猎/)).toBeInTheDocument();
expect(screen.getByText(/除了技术，我还热爱阅读、写作和思考/)).toBeInTheDocument() });
it('renders all value cards', () => { render(<About />) // Value cards;
const values = [ { emoji: '🎯', title: '专注品质', desc: '追求卓越，关注细节。相信好的产品来自于对品质的执着追求。' }, { emoji: '🌱', title: '持续成长', desc: '保持好奇心，拥抱变化。技术日新月异，学习永无止境。' }, { emoji: '🤝', title: '开放协作', desc: '相信团队的力量，乐于分享知识。开源精神，共同进步。' }, { emoji: '💡', title: '创新思维', desc: '不满足于现状，勇于尝试新事物。用技术解决实际问题。' }
];
values.forEach(value => { expect(screen.getByText(value.emoji)).toBeInTheDocument();
expect(screen.getByText(value.title)).toBeInTheDocument();
expect(screen.getByText(value.desc)).toBeInTheDocument() }) });
it('renders component placeholders', () => { render(<About />
);
expect(screen.getByTestId('skills-section')).toBeInTheDocument();
expect(screen.getByTestId('timeline')).toBeInTheDocument();
expect(screen.getByTestId('contact-info')).toBeInTheDocument() });
it('renders newsletter subscription form', () => { render(<About />
);
expect(screen.getByText('获取最新文章更新和独家内容，每周不超过一封邮件')).toBeInTheDocument();
expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
expect(screen.getByRole('button', { name: '订阅' })).toBeInTheDocument() });
it('renders form with correct attributes', () => { render(<About />
);
const emailInput = screen.getByPlaceholderText('your@email.com');
expect(emailInput).toHaveAttribute('type', 'email');
expect(emailInput).toHaveClass('flex-1', 'px-4', 'py-2');
const submitButton = screen.getByRole('button', { name: '订阅' });
expect(submitButton).toHaveAttribute('type', 'submit');
expect(submitButton).toHaveClass('bg-primary', 'text-primary-foreground') });
it('handles form submission', async () => { const user = userEvent.setup();
const { container } = render(<About />
);
const form = container.querySelector('form');
const mockSubmit = jest.fn((e) => e.preventDefault());
form?.addEventListener('submit', mockSubmit);
const emailInput = screen.getByPlaceholderText('your@email.com');
const submitButton = screen.getByRole('button', { name: '订阅' }) await user.type(emailInput, 'test@example.com') await user.click(submitButton);
expect(emailInput).toHaveValue('test@example.com') });
it('renders SEO structured data', () => { render(<About />
);
const seoElement = screen.getByTestId('seo');
const structuredData = JSON.parse(seoElement.getAttribute('data-structured-data') || '{}');
expect(structuredData['@type']).toBe('Person');
expect(structuredData.name).toBe('Zhihao Mu');
expect(structuredData.jobTitle).toBe('全栈开发者');
expect(structuredData.location).toBe('中国');
expect(structuredData.socialLinks).toContain('https://github.com/yourusername') });
it('applies responsive layout classes', () => { const { container } = render(<About />) // Hero section responsive layout;
const heroSection = container.querySelector('.flex-col.md\\:flex-row');
expect(heroSection).toBeInTheDocument() // Values grid responsive layout;
const valuesGrid = container.querySelector('.grid.md\\:grid-cols-2');
expect(valuesGrid).toBeInTheDocument() // Newsletter form responsive layout;
const newsletterForm = container.querySelector('.flex-col.sm\\:flex-row');
expect(newsletterForm).toBeInTheDocument() });
it('applies correct styling to sections', () => { const { container } = render(<About />) // Most sections have mb-16 spacing;
const mainSections = container.querySelectorAll('section.mb-16');
expect(mainSections.length).toBeGreaterThanOrEqual(5) // Value cards styling;
const valueCards = container.querySelectorAll('.p-6.bg-card.rounded-lg.border');
expect(valueCards).toHaveLength(4) });
it('renders newsletter section with correct background', () => { const { container } = render(<About />
);
const newsletterSection = screen.getByText('订阅博客').closest('section');
expect(newsletterSection).toHaveClass('p-8', 'bg-muted', 'rounded-lg') });
it('uses correct heading hierarchy', () => { render(<About />) // h1 for main title;
const h1 = screen.getByRole('heading', { level: 1 });
expect(h1).toHaveTextContent('你好，我是 Zhihao Mu') // h2 for section titles;
const h2s = screen.getAllByRole('heading', { level: 2 });
expect(h2s).toHaveLength(5) // 我的故事, 技术栈, 职业经历, 我的价值观, 联系我 // h3 for subsections;
const h3s = screen.getAllByRole('heading', { level: 3 });
expect(h3s).toHaveLength(5) // 4 value cards + newsletter });
it('applies prose styling to story section', () => { render(<About />
);
const storySection = screen.getByText('我的故事').nextElementSibling expect(storySection).toHaveClass('prose', 'prose-gray', "", 'max-w-none') });
it('renders text with correct formatting', () => { render(<About />) // Check text sizes expect(screen.getByText('你好，我是 Zhihao Mu')).toHaveClass('text-4xl');
expect(screen.getByText('全栈开发者 / 技术作家 / 终身学习者')).toHaveClass('text-xl');
expect(screen.getByText('我的故事')).toHaveClass('text-3xl') }) })
