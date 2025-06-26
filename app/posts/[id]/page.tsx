export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ]
}

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const posts: { [key: string]: { 
    title: string; 
    date: string; 
    content: string; 
    category: string;
    readTime: string;
    author: {
      name: string;
      avatar: string;
    };
  }} = {
    '1': {
      title: '战胜拖延的策略：从"冷启动"到"热启动"',
      date: '24 Nov 2024',
      category: 'Productivity',
      readTime: '4 min read',
      author: {
        name: 'Zhihao Mu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      },
      content: `
        <p>拖延是许多人在工作和生活中都会遇到的问题。我发现许多拖延的根本原因，是任务处于"冷启动"状态——也就是说，任务对我们来说太陌生、太庞大或太困难，让我们不知道从何开始。</p>

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
          <li>收集三个关键数据</li>
        </ul>

        <h3>2. 创造仪式感，建立启动信号</h3>
        
        <p>我发现建立一个简单的"启动仪式"非常有效。比如：</p>
        <ul>
          <li>泡一杯特定的茶</li>
          <li>播放专门的工作音乐</li>
          <li>整理桌面，准备好所需工具</li>
        </ul>

        <p>这些小仪式会告诉大脑："现在是工作时间了。"</p>

        <h3>3. 降低完美主义的期望</h3>
        
        <p>告诉自己："我只需要写一个糟糕的初稿"或"我只工作15分钟"。降低期望能显著减少启动阻力。一旦开始，你会发现继续下去并没有那么困难。</p>

        <h3>4. 利用已有的"热状态"</h3>
        
        <p>如果你刚完成了一项任务，大脑还处于工作状态，这时候立即开始下一项任务会容易得多。不要让自己完全"冷却"下来。</p>

        <h2>建立长期的热启动系统</h2>

        <p>真正的突破在于建立系统，让重要任务保持在"温热"状态：</p>

        <ol>
          <li><strong>每日接触</strong>：即使只有5分钟，也要每天接触重要项目</li>
          <li><strong>可视化进度</strong>：使用看板或进度条，让成就感可见</li>
          <li><strong>建立模板</strong>：为重复性任务创建模板和检查清单</li>
          <li><strong>预设环境</strong>：提前准备好工作环境和材料</li>
        </ol>

        <h2>总结</h2>

        <p>战胜拖延的关键不是依靠意志力，而是通过巧妙的策略降低任务的启动成本。当我们把任务从"冷启动"转变为"热启动"，行动就会变得自然而然。</p>

        <p>记住：<em>开始永远比完美更重要。</em></p>
      `
    },
    '2': {
      title: '理解 React 18 的并发特性',
      date: '20 Nov 2024',
      category: 'Technology',
      readTime: '6 min read',
      author: {
        name: 'Zhihao Mu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      },
      content: `
        <p>React 18 引入了备受期待的并发特性，这是 React 发展历程中的一个重要里程碑。这些新特性不仅提升了应用的性能，更重要的是改善了用户体验。</p>

        <h2>什么是并发渲染？</h2>
        
        <p>在传统的 React 中，一旦开始渲染，就必须完成整个组件树的渲染。这种"全有或全无"的方式在处理大型更新时可能导致界面卡顿。</p>

        <p>并发渲染允许 React 中断长时间运行的渲染任务，让出控制权处理更紧急的任务（如用户输入），然后再继续之前的渲染。</p>

        <h2>主要的并发特性</h2>

        <h3>1. Automatic Batching</h3>
        
        <p>React 18 扩展了批处理的范围，现在 Promise、setTimeout 和原生事件处理器中的更新也会被自动批处理：</p>

        <pre><code>// React 18 之前，只有事件处理器中的更新会被批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 触发两次重新渲染
}, 1000);

// React 18，自动批处理
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染
}, 1000);</code></pre>

        <h3>2. Transitions</h3>
        
        <p>Transitions 允许你标记某些更新为非紧急更新：</p>

        <pre><code>import { startTransition } from 'react';

// 紧急更新：显示用户输入
setInputValue(input);

// 非紧急更新：显示搜索结果
startTransition(() => {
  setSearchQuery(input);
});</code></pre>

        <h3>3. Suspense 的改进</h3>
        
        <p>React 18 中的 Suspense 支持服务端渲染，并且可以用于数据获取：</p>

        <pre><code>function ProfilePage() {
  return (
    &lt;Suspense fallback={&lt;Spinner /&gt;}&gt;
      &lt;ProfileDetails /&gt;
      &lt;Suspense fallback={&lt;SkeletonPosts /&gt;}&gt;
        &lt;ProfilePosts /&gt;
      &lt;/Suspense&gt;
    &lt;/Suspense&gt;
  );
}</code></pre>

        <h2>实际应用场景</h2>

        <h3>优化搜索功能</h3>
        
        <p>使用 <code>useDeferredValue</code> 来延迟非关键更新：</p>

        <pre><code>function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  return (
    &lt;div&gt;
      &lt;SearchInput value={query} /&gt;
      &lt;Suspense fallback={&lt;Loading /&gt;}&gt;
        &lt;Results query={deferredQuery} /&gt;
      &lt;/Suspense&gt;
    &lt;/div&gt;
  );
}</code></pre>

        <h3>大列表渲染</h3>
        
        <p>使用 transitions 来保持界面响应：</p>

        <pre><code>function FilterableList({ items }) {
  const [filter, setFilter] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  function handleChange(e) {
    setFilter(e.target.value);
    startTransition(() => {
      setFilteredItems(items.filter(item => 
        item.includes(e.target.value)
      ));
    });
  }

  return (
    &lt;&gt;
      &lt;input value={filter} onChange={handleChange} /&gt;
      &lt;List items={filteredItems} /&gt;
    &lt;/&gt;
  );
}</code></pre>

        <h2>性能影响</h2>

        <p>并发特性的引入带来了显著的性能提升：</p>

        <ul>
          <li><strong>更好的输入响应性</strong>：用户输入不会被长时间的渲染阻塞</li>
          <li><strong>更流畅的动画</strong>：动画和过渡效果不会因为其他更新而卡顿</li>
          <li><strong>更快的页面加载</strong>：通过 Suspense 和流式 SSR，用户可以更快看到内容</li>
        </ul>

        <h2>迁移建议</h2>

        <p>升级到 React 18 是渐进式的：</p>

        <ol>
          <li>更新依赖并使用新的 <code>createRoot</code> API</li>
          <li>测试现有功能，确保没有破坏性变化</li>
          <li>逐步采用新特性，从 automatic batching 开始</li>
          <li>在性能关键的地方引入 transitions 和 Suspense</li>
        </ol>

        <h2>总结</h2>

        <p>React 18 的并发特性代表了前端框架发展的新方向。通过更智能的渲染策略，我们可以构建既快速又流畅的用户界面。关键是理解这些特性的适用场景，并在合适的地方使用它们。</p>
      `
    },
    '3': {
      title: '构建高效的个人知识管理系统',
      date: '15 Nov 2024',
      category: 'Productivity',
      readTime: '5 min read',
      author: {
        name: 'Zhihao Mu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      },
      content: `
        <p>在信息爆炸的时代，如何有效管理和利用知识成为了一个重要课题。一个好的个人知识管理系统不仅能帮助我们更好地学习和记忆，还能促进创新思维的产生。</p>

        <h2>为什么需要知识管理系统？</h2>
        
        <p>我们每天接触大量信息：文章、视频、播客、会议笔记……如果没有系统化的管理，这些信息很快就会被遗忘。更糟糕的是，当我们需要某个信息时，往往找不到它在哪里。</p>

        <p>一个有效的知识管理系统应该能够：</p>
        <ul>
          <li>快速捕获信息</li>
          <li>方便检索和回顾</li>
          <li>促进知识的连接和创新</li>
          <li>支持长期的知识积累</li>
        </ul>

        <h2>构建系统的核心原则</h2>

        <h3>1. 简单易用</h3>
        
        <p>系统越复杂，越难坚持使用。选择工具时，优先考虑那些能够快速上手、界面简洁的选项。记住，最好的系统是你会持续使用的系统。</p>

        <h3>2. 统一入口</h3>
        
        <p>建立一个中心化的收集点，所有信息都先进入这里，然后再进行整理。这可以是：</p>
        <ul>
          <li>一个笔记应用的收件箱</li>
          <li>一个专门的文件夹</li>
          <li>一个待办事项列表</li>
        </ul>

        <h3>3. 定期整理</h3>
        
        <p>设置固定的时间来整理和回顾你的知识库。我建议：</p>
        <ul>
          <li>每日：快速整理当天收集的信息</li>
          <li>每周：深度整理和建立连接</li>
          <li>每月：回顾和优化系统</li>
        </ul>

        <h2>我的知识管理工作流</h2>

        <h3>第一步：捕获</h3>
        
        <p>使用以下工具快速捕获信息：</p>
        <ul>
          <li><strong>Notion</strong>：主要知识库，存储长期笔记</li>
          <li><strong>Apple Notes</strong>：快速记录想法和灵感</li>
          <li><strong>Readwise</strong>：自动同步阅读标注</li>
          <li><strong>截图工具</strong>：保存重要的视觉信息</li>
        </ul>

        <h3>第二步：处理</h3>
        
        <p>对收集的信息进行加工：</p>
        <ol>
          <li>添加标签和分类</li>
          <li>用自己的话重写关键概念</li>
          <li>建立与已有知识的连接</li>
          <li>提取可执行的行动点</li>
        </ol>

        <h3>第三步：连接</h3>
        
        <p>知识的价值在于连接。我使用以下方法：</p>
        <ul>
          <li><strong>双向链接</strong>：在 Notion 中创建页面间的引用</li>
          <li><strong>主题页面</strong>：为重要主题创建索引页</li>
          <li><strong>定期回顾</strong>：通过回顾发现新的连接</li>
        </ul>

        <h3>第四步：创造</h3>
        
        <p>知识管理的最终目的是创造新的价值：</p>
        <ul>
          <li>写作博客文章</li>
          <li>制作教程或课程</li>
          <li>解决实际问题</li>
          <li>产生新的想法</li>
        </ul>

        <h2>工具推荐</h2>

        <p>根据不同需求，我推荐以下工具组合：</p>

        <h3>极简主义者</h3>
        <ul>
          <li>Apple Notes + 文件夹系统</li>
          <li>优点：简单、免费、跨设备同步</li>
        </ul>

        <h3>进阶用户</h3>
        <ul>
          <li>Notion 或 Obsidian</li>
          <li>优点：功能强大、支持数据库和双向链接</li>
        </ul>

        <h3>研究者</h3>
        <ul>
          <li>Roam Research 或 RemNote</li>
          <li>优点：专为学术研究设计、支持间隔重复</li>
        </ul>

        <h2>常见陷阱</h2>

        <p>在构建知识管理系统时，要避免以下错误：</p>

        <ol>
          <li><strong>过度复杂化</strong>：不要花太多时间在系统本身</li>
          <li><strong>只收集不整理</strong>：定期清理和组织是必要的</li>
          <li><strong>追求完美</strong>：接受系统会不断演化的事实</li>
          <li><strong>工具崇拜</strong>：工具只是手段，内容才是目的</li>
        </ol>

        <h2>开始行动</h2>

        <p>如果你还没有知识管理系统，我建议从以下步骤开始：</p>

        <ol>
          <li>选择一个简单的笔记工具</li>
          <li>创建基本的文件夹结构</li>
          <li>养成每日记录的习惯</li>
          <li>每周花30分钟整理笔记</li>
          <li>根据使用情况逐步优化</li>
        </ol>

        <p>记住，最重要的不是拥有完美的系统，而是开始行动并持续改进。你的知识管理系统应该随着你的需求一起成长。</p>
      `
    },
    '4': {
      title: '设计系统的思考：从组件到体验',
      date: '10 Nov 2024',
      category: 'Design',
      readTime: '7 min read',
      author: {
        name: 'Zhihao Mu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
      },
      content: `
        <p>设计系统不仅仅是一套UI组件库，它是产品设计语言的完整表达。一个成熟的设计系统能够确保产品体验的一致性，提高团队协作效率，并为产品的长期演进提供坚实基础。</p>

        <h2>设计系统的层次</h2>
        
        <p>我喜欢将设计系统想象成一座冰山：</p>

        <ul>
          <li><strong>表层</strong>：UI组件和样式</li>
          <li><strong>中层</strong>：设计原则和模式</li>
          <li><strong>深层</strong>：品牌价值和用户体验理念</li>
        </ul>

        <p>许多团队只关注表层，但真正让设计系统发挥价值的，是那些看不见的部分。</p>

        <h2>构建设计系统的关键步骤</h2>

        <h3>1. 审计现有设计</h3>
        
        <p>开始构建设计系统之前，先要了解现状：</p>
        <ul>
          <li>收集所有现有的设计稿和组件</li>
          <li>识别重复和不一致的地方</li>
          <li>记录各种设计决策的原因</li>
          <li>了解开发团队的技术栈和限制</li>
        </ul>

        <h3>2. 定义设计原则</h3>
        
        <p>设计原则是所有决策的基础。例如，我们的设计原则可能包括：</p>

        <blockquote>
          <p><strong>清晰优于美观</strong>：当两者冲突时，我们选择更清晰的方案。</p>
          <p><strong>一致性带来信任</strong>：用户应该能预测界面的行为。</p>
          <p><strong>每个元素都有目的</strong>：如果不能说明其价值，就应该移除。</p>
        </blockquote>

        <h3>3. 建立设计令牌（Design Tokens）</h3>
        
        <p>设计令牌是设计系统的原子单位：</p>

        <pre><code>// 颜色令牌
$color-primary: #007AFF;
$color-danger: #FF3B30;
$color-text-primary: #000000;
$color-text-secondary: #8E8E93;

// 间距令牌
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;

// 字体令牌
$font-size-body: 16px;
$font-size-heading: 24px;
$line-height-tight: 1.2;
$line-height-normal: 1.5;</code></pre>

        <h3>4. 构建组件库</h3>
        
        <p>组件应该是：</p>
        <ul>
          <li><strong>可组合的</strong>：小组件可以组合成大组件</li>
          <li><strong>可配置的</strong>：通过属性控制行为和样式</li>
          <li><strong>可访问的</strong>：遵循WCAG标准</li>
          <li><strong>有文档的</strong>：包含使用示例和最佳实践</li>
        </ul>

        <h2>实践中的挑战</h2>

        <h3>保持灵活性 vs 确保一致性</h3>
        
        <p>这是设计系统面临的核心矛盾。太严格会限制创新，太灵活又会失去一致性。我的解决方案是：</p>

        <ol>
          <li>为80%的常见场景提供标准解决方案</li>
          <li>为20%的特殊情况提供扩展机制</li>
          <li>建立明确的"打破规则"流程</li>
        </ol>

        <h3>版本管理和更新</h3>
        
        <p>设计系统需要不断演进，但每次更新都可能影响使用它的产品。建议：</p>

        <ul>
          <li>使用语义化版本号（主版本.次版本.补丁）</li>
          <li>提供详细的更新日志和迁移指南</li>
          <li>设置过渡期，允许渐进式升级</li>
          <li>建立反馈机制，收集使用者意见</li>
        </ul>

        <h3>跨团队协作</h3>
        
        <p>设计系统的成功依赖于不同角色的通力合作：</p>

        <ul>
          <li><strong>设计师</strong>：定义视觉语言和交互模式</li>
          <li><strong>开发者</strong>：实现组件并确保技术可行性</li>
          <li><strong>产品经理</strong>：确保系统满足业务需求</li>
          <li><strong>内容策略师</strong>：定义语言风格和文案规范</li>
        </ul>

        <h2>衡量设计系统的成功</h2>

        <p>如何知道设计系统是否成功？我关注以下指标：</p>

        <ol>
          <li><strong>采用率</strong>：团队使用设计系统组件的比例</li>
          <li><strong>一致性分数</strong>：产品中设计一致性的程度</li>
          <li><strong>开发效率</strong>：使用系统后的开发速度提升</li>
          <li><strong>用户满意度</strong>：最终用户的体验反馈</li>
        </ol>

        <h2>设计系统的未来</h2>

        <p>随着技术发展，设计系统也在演进：</p>

        <ul>
          <li><strong>AI辅助设计</strong>：自动生成符合系统规范的设计</li>
          <li><strong>跨平台统一</strong>：一套系统适配所有平台</li>
          <li><strong>动态主题</strong>：根据用户偏好自动调整</li>
          <li><strong>无代码集成</strong>：让非技术人员也能使用</li>
        </ul>

        <h2>给初学者的建议</h2>

        <p>如果你刚开始构建设计系统：</p>

        <ol>
          <li>从小处着手，不要试图一次解决所有问题</li>
          <li>先规范最常用的组件（按钮、表单、卡片）</li>
          <li>建立清晰的文档，并保持更新</li>
          <li>定期收集反馈，快速迭代</li>
          <li>记住：完成比完美更重要</li>
        </ol>

        <p>设计系统是一个持续演进的生命体，而不是一个静态的交付物。拥抱变化，保持学习，你的设计系统就会随着产品一起成长。</p>
      `
    }
  }

  const post = posts[id] || { 
    title: '文章不存在', 
    date: '', 
    content: '<p>抱歉，找不到这篇文章。</p>',
    category: '',
    readTime: '',
    author: { name: '', avatar: '' }
  }

  return (
    <article className="py-12">
      <div className="container-narrow">
        <header className="mb-12">
          <div className="mb-6">
            <span className="text-pink-600 text-sm font-medium uppercase tracking-wide">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light leading-tight mb-6">
            {post.title}
          </h1>
          
          <div className="flex items-center">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="author-avatar mr-3"
            />
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium text-gray-700">{post.author.name}</span>
              <span className="mx-2">·</span>
              <time>{post.date}</time>
              <span className="mx-2">·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        <div 
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-12">
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← 返回首页
            </a>
            
            <div className="flex gap-4">
              <button className="text-gray-400 hover:text-pink-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 10-15.432 0m15.432 0a9.001 9.001 0 01-15.432 0m15.432 0A8.961 8.961 0 0112 21a8.961 8.961 0 01-5.716-2.026" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium mb-3">订阅获取更多内容</h3>
            <p className="text-gray-600 mb-6">
              每周分享关于技术、设计和生活的思考
            </p>
            <form className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-pink-600"
              />
              <button 
                type="submit"
                className="btn-subscribe rounded-l-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </footer>
      </div>
    </article>
  )
}