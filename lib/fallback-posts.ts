/**
 * Fallback posts data for when Notion API is unavailable
 * 当 Notion API 不可用时的后备文章数据
 */
import type { BlogPost } from '../types/notion'

export const fallbackPosts: BlogPost[] = [ { id: '1', title: "战胜拖延的策略：从'冷启动'到'热启动'", slug: 'overcome-procrastination', excerpt: "战胜拖延的策略，从'冷启动'到'热启动'。", date: '2024-11-24', readTime: '4 min read', category: 'Productivity', author: { name: 'Zhihao Mu', avatar: '/images/default-avatar.svg' }, tags: ['生产力', '拖延', '效率'], published: true, createdTime: '2024-11-24T00:00:00.000Z', lastEditedTime: '2024-11-24T00:00:00.000Z', content: ` <p>拖延是许多人在工作和生活中都会遇到的问题。我发现许多拖延的根本原因，是任务处于"冷启动"状态——也就是说，任务对我们来说太陌生、太庞大或太困难，让我们不知道从何开始。</p>
<h2>拖延的困境</h2>
<p>当任务处于冷启动状态时，我们的大脑很容易产生抗拒。就像冬天早晨要离开温暖的被窝一样，开始一项陌生的任务需要消耗大量的心理能量。结果就是，我们会不断推迟，直到截止日期逼近。</p>
<h2>冷启动与热启动</h2>
<p>为什么有些任务我们可以毫不费力地开始？因为它们处于"热启动"状态。打开微信聊天、刷社交媒体，这些任务对我们的大脑来说是熟悉的、容易的，不需要太多的认知负荷。</p>
<p>关键在于：<strong>如何把重要的任务从冷启动转变为热启动？</strong></p>
<h2>降低启动阻力的策略</h2>
<h3>1. 分解任务，让它变得不那么吓人</h3>
<p>与其想着"我要写一份完整的报告"，不如把任务分解为：</p>
<ul>
<li>列出报告的大纲</li>
<li>写出引言的第一段</li>
<li>收集三个关键数据</li> </ul>
<p>记住：<em>开始永远比完美更重要。</em></p> ` }, { id: '2', title: '理解 React 18 的并发特性', slug: 'react-18-concurrent-features', excerpt: '深入探讨 React 18 带来的并发渲染机制，以及如何在项目中有效利用这些新特性。', date: '2024-11-20', readTime: '6 min read', category: 'Technology', author: { name: 'Zhihao Mu', avatar: '/images/default-avatar.svg' }, tags: ['React', 'JavaScript', '前端'], published: true, createdTime: '2024-11-20T00:00:00.000Z', lastEditedTime: '2024-11-20T00:00:00.000Z', content: ` <p>React 18 引入了备受期待的并发特性，这是 React 发展历程中的一个重要里程碑。这些新特性不仅提升了应用的性能，更重要的是改善了用户体验。</p>
<h2>什么是并发渲染？</h2>
<p>在传统的 React 中，一旦开始渲染，就必须完成整个组件树的渲染。这种"全有或全无"的方式在处理大型更新时可能导致界面卡顿。</p>
<p>并发渲染允许 React 中断长时间运行的渲染任务，让出控制权处理更紧急的任务（如用户输入），然后再继续之前的渲染。</p>
<h2>主要的并发特性</h2>
<h3>1. Automatic Batching</h3>
<p>React 18 扩展了批处理的范围，现在 Promise、setTimeout 和原生事件处理器中的更新也会被自动批处理。</p>
<h2>总结</h2>
<p>React 18 的并发特性代表了前端框架发展的新方向。通过更智能的渲染策略，我们可以构建既快速又流畅的用户界面。</p> ` }, { id: '3', title: '构建高效的个人知识管理系统', slug: 'personal-knowledge-management', excerpt: '如何使用现代工具和方法论，构建一个适合自己的知识管理体系。', date: '2024-11-15', readTime: '5 min read', category: 'Productivity', author: { name: 'Zhihao Mu', avatar: '/images/default-avatar.svg' }, tags: ['知识管理', '生产力', 'Notion'], published: true, createdTime: '2024-11-15T00:00:00.000Z', lastEditedTime: '2024-11-15T00:00:00.000Z', content: ` <p>在信息爆炸的时代，如何有效管理和利用知识成为了一个重要课题。一个好的个人知识管理系统不仅能帮助我们更好地学习和记忆，还能促进创新思维的产生。</p>
<h2>为什么需要知识管理系统？</h2>
<p>我们每天接触大量信息：文章、视频、播客、会议笔记……如果没有系统化的管理，这些信息很快就会被遗忘。</p>
<p>记住，最重要的不是拥有完美的系统，而是开始行动并持续改进。你的知识管理系统应该随着你的需求一起成长。</p> ` }, { id: '4', title: '设计系统的思考：从组件到体验', slug: 'design-system-thinking', excerpt: '探讨如何构建一个既灵活又一致的设计系统，以及在实践中遇到的挑战。', date: '2024-11-10', readTime: '7 min read', category: 'Design', author: { name: 'Zhihao Mu', avatar: '/images/default-avatar.svg' }, tags: ['设计系统', 'UI/UX', '组件'], published: true, createdTime: '2024-11-10T00:00:00.000Z', lastEditedTime: '2024-11-10T00:00:00.000Z', content: ` <p>设计系统不仅仅是一套UI组件库，它是产品设计语言的完整表达。一个成熟的设计系统能够确保产品体验的一致性，提高团队协作效率，并为产品的长期演进提供坚实基础。</p>
<h2>设计系统的层次</h2>
<p>我喜欢将设计系统想象成一座冰山：表层是UI组件和样式，中层是设计原则和模式，深层是品牌价值和用户体验理念。</p>
<p>设计系统是一个持续演进的生命体，而不是一个静态的交付物。拥抱变化，保持学习，你的设计系统就会随着产品一起成长。</p> ` }
]
export function getFallbackPosts(): BlogPost[] {
  return fallbackPosts
}
export function getFallbackPostBySlug(slug: string): BlogPost | null {
  return fallbackPosts.find(post => post.slug === slug) || null
}