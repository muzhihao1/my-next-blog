/**
 * Fallback tools data for when Notion API is unavailable
 */
import type { Tool } from '../types/tool'

export const fallbackTools: Tool[] = [
  // Development Tools
  {
    id: '1',
    name: 'Visual Studio Code',
    slug: 'visual-studio-code',
    category: 'development',
    description: '功能强大的免费开源代码编辑器，支持几乎所有编程语言',
    rating: 5,
    price: 'free',
    website: 'https://code.visualstudio.com/',
    pros: [
      '完全免费且开源',
      '丰富的扩展生态系统',
      '优秀的性能和稳定性',
      '内置 Git 集成',
      '智能代码补全'
    ],
    cons: [
      '初始启动速度较慢',
      '某些扩展可能影响性能',
      '配置复杂度较高'
    ],
    useCases: [
      'Web 开发',
      '后端开发',
      '脚本编写',
      '配置文件编辑'
    ],
    review: '<p>VS Code 是我日常开发的主力工具。它的扩展系统让它能够适应任何开发场景，从前端到后端，从脚本到系统编程。特别推荐的扩展包括 GitLens、Prettier、ESLint 等。</p>',
    alternatives: ['Sublime Text', 'Atom', 'WebStorm'],
    tags: ['编辑器', '开发工具', 'IDE'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    category: 'development',
    description: 'AI 驱动的代码补全工具，能够理解上下文并生成代码建议',
    rating: 4,
    price: 'subscription',
    website: 'https://github.com/features/copilot',
    pros: [
      '显著提高编码效率',
      '支持多种编程语言',
      '能理解自然语言注释',
      '持续学习和改进'
    ],
    cons: [
      '需要付费订阅',
      '生成的代码需要审查',
      '可能有版权争议'
    ],
    useCases: [
      '快速原型开发',
      '重复代码生成',
      '学习新语言或框架',
      '编写测试用例'
    ],
    review: '<p>Copilot 改变了我的编程方式。它不仅能帮我快速完成重复性工作，还能在我学习新技术时提供有用的代码示例。虽然生成的代码并不总是完美，但它确实大大提高了我的生产力。</p>',
    alternatives: ['Tabnine', 'Kite', 'CodeWhisperer'],
    tags: ['AI', '代码补全', '生产力'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '3',
    name: 'Docker',
    slug: 'docker',
    category: 'development',
    description: '容器化平台，简化应用程序的部署和管理',
    rating: 5,
    price: 'freemium',
    website: 'https://www.docker.com/',
    pros: [
      '环境一致性保证',
      '快速部署和扩展',
      '资源利用效率高',
      '丰富的镜像库'
    ],
    cons: [
      '学习曲线较陡',
      'Windows 性能损耗',
      '存储占用较大'
    ],
    useCases: [
      '微服务架构',
      '开发环境搭建',
      'CI/CD 流程',
      '应用程序分发'
    ],
    review: '<p>Docker 是现代开发不可或缺的工具。它解决了"在我机器上能跑"的问题，让开发、测试和生产环境保持一致。配合 Docker Compose，可以轻松管理复杂的多容器应用。</p>',
    alternatives: ['Podman', 'containerd', 'LXC'],
    tags: ['容器', 'DevOps', '虚拟化'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  
  // Design Tools
  {
    id: '4',
    name: 'Figma',
    slug: 'figma',
    category: 'design',
    description: '基于云的协作设计工具，支持 UI/UX 设计和原型制作',
    rating: 5,
    price: 'freemium',
    website: 'https://www.figma.com/',
    pros: [
      '实时协作功能',
      '跨平台支持',
      '版本控制',
      '丰富的插件生态'
    ],
    cons: [
      '需要稳定网络',
      '离线功能有限',
      '大文件性能问题'
    ],
    useCases: [
      'UI 设计',
      '原型制作',
      '设计系统构建',
      '团队协作'
    ],
    review: '<p>Figma 革新了设计协作方式。实时协作功能让设计评审变得高效，开发者可以直接查看设计规范和导出资源。Auto Layout 功能更是让响应式设计变得简单。</p>',
    alternatives: ['Sketch', 'Adobe XD', 'Framer'],
    tags: ['设计', '协作', 'UI/UX'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '5',
    name: 'Excalidraw',
    slug: 'excalidraw',
    category: 'design',
    description: '手绘风格的在线白板工具，适合快速绘制流程图和架构图',
    rating: 4,
    price: 'free',
    website: 'https://excalidraw.com/',
    pros: [
      '简单易用',
      '手绘风格独特',
      '支持实时协作',
      '开源免费'
    ],
    cons: [
      '功能相对简单',
      '不适合精确制图',
      '导出格式有限'
    ],
    useCases: [
      '头脑风暴',
      '架构设计',
      '流程图绘制',
      '教学演示'
    ],
    review: '<p>Excalidraw 是我最喜欢的快速制图工具。它的手绘风格让技术图表看起来不那么正式，非常适合早期设计讨论。VS Code 插件版本让我可以直接在编辑器中绘图。</p>',
    alternatives: ['Draw.io', 'Miro', 'Whimsical'],
    tags: ['白板', '图表', '协作'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  
  // Productivity Tools
  {
    id: '6',
    name: 'Notion',
    slug: 'notion',
    category: 'productivity',
    description: '全能的工作空间，集笔记、数据库、看板和文档于一体',
    rating: 5,
    price: 'freemium',
    website: 'https://www.notion.so/',
    pros: [
      '功能极其丰富',
      '高度可定制',
      '数据库功能强大',
      'API 支持'
    ],
    cons: [
      '学习曲线陡峭',
      '移动端体验一般',
      '离线功能有限'
    ],
    useCases: [
      '知识管理',
      '项目管理',
      '团队协作',
      'CMS 系统'
    ],
    review: '<p>Notion 是我的第二大脑。从个人笔记到团队项目管理，从博客 CMS 到知识库，Notion 都能胜任。它的数据库功能特别强大，可以创建各种自定义视图。</p>',
    alternatives: ['Obsidian', 'Roam Research', 'Coda'],
    tags: ['笔记', '数据库', '协作'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '7',
    name: 'Raycast',
    slug: 'raycast',
    category: 'productivity',
    description: 'macOS 上的高效启动器，可扩展的生产力工具',
    rating: 5,
    price: 'freemium',
    website: 'https://www.raycast.com/',
    pros: [
      '响应速度极快',
      '丰富的扩展生态',
      '优秀的用户体验',
      '开发者友好'
    ],
    cons: [
      '仅支持 macOS',
      '某些功能需要付费',
      '扩展质量参差不齐'
    ],
    useCases: [
      '应用启动',
      '文件搜索',
      '剪贴板管理',
      '工作流自动化'
    ],
    review: '<p>Raycast 让我的 Mac 使用效率提升了一个档次。从快速启动应用到管理剪贴板历史，从搜索文档到执行脚本，几乎所有操作都可以通过键盘完成。</p>',
    alternatives: ['Alfred', 'Spotlight', 'LaunchBar'],
    tags: ['启动器', 'macOS', '效率'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '8',
    name: '1Password',
    slug: '1password',
    category: 'productivity',
    description: '安全可靠的密码管理器，支持团队共享',
    rating: 5,
    price: 'subscription',
    website: 'https://1password.com/',
    pros: [
      '安全性极高',
      '跨平台同步',
      '团队共享功能',
      '优秀的用户界面'
    ],
    cons: [
      '需要付费订阅',
      '学习成本存在',
      '离线访问限制'
    ],
    useCases: [
      '密码管理',
      '安全笔记',
      '信用卡信息',
      '团队密钥共享'
    ],
    review: '<p>1Password 是我信任的密码管理解决方案。它不仅管理密码，还能存储各种敏感信息。团队共享功能让协作更安全，SSH 密钥管理功能对开发者特别有用。</p>',
    alternatives: ['Bitwarden', 'LastPass', 'Dashlane'],
    tags: ['安全', '密码管理', '隐私'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  
  // Hardware Tools
  {
    id: '9',
    name: 'Apple AirPods Pro',
    slug: 'airpods-pro',
    category: 'hardware',
    description: '具有主动降噪功能的无线耳机，音质出色',
    rating: 4,
    price: 'paid',
    website: 'https://www.apple.com/airpods-pro/',
    pros: [
      '降噪效果出色',
      '与苹果生态无缝集成',
      '便携性极佳',
      '通话质量清晰'
    ],
    cons: [
      '价格较高',
      '电池寿命有限',
      '仅适合苹果用户'
    ],
    useCases: [
      '日常通勤',
      '视频会议',
      '专注工作',
      '运动健身'
    ],
    review: '<p>AirPods Pro 是我的日常必备。降噪功能让我能在嘈杂环境中专注工作，通透模式又能让我随时感知周围。虽然价格不菲，但考虑到使用频率，还是物有所值。</p>',
    alternatives: ['Sony WF-1000XM4', 'Bose QuietComfort', 'Jabra Elite'],
    tags: ['耳机', '音频', '苹果'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '10',
    name: 'LG UltraFine 5K',
    slug: 'lg-ultrafine-5k',
    category: 'hardware',
    description: '27 英寸 5K 分辨率显示器，专为 Mac 设计',
    rating: 4,
    price: 'paid',
    website: 'https://www.lg.com/us/monitors/lg-27md5kl-b-5k-uhd-led-monitor',
    pros: [
      '5K 超高分辨率',
      '色彩准确度高',
      'USB-C 一线连接',
      '内置扬声器和摄像头'
    ],
    cons: [
      '价格昂贵',
      '仅一个接口',
      '非 Mac 兼容性差'
    ],
    useCases: [
      '专业设计',
      '视频剪辑',
      '编程开发',
      '内容创作'
    ],
    review: '<p>这款显示器是 Mac 用户的理想选择。5K 分辨率让文字锐利清晰，色彩还原准确。USB-C 一线连接简化了桌面布线。虽然价格不菲，但对于专业工作来说是值得的投资。</p>',
    alternatives: ['Apple Studio Display', 'Dell UltraSharp', 'BenQ PD3220U'],
    tags: ['显示器', '5K', 'Mac'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  
  // Service Tools
  {
    id: '11',
    name: 'Vercel',
    slug: 'vercel',
    category: 'service',
    description: '前端应用部署平台，与 Next.js 完美集成',
    rating: 5,
    price: 'freemium',
    website: 'https://vercel.com/',
    pros: [
      '部署速度极快',
      '自动 HTTPS',
      '全球 CDN',
      '优秀的开发体验'
    ],
    cons: [
      '免费层限制较多',
      '仅适合前端应用',
      '价格较高'
    ],
    useCases: [
      'Next.js 应用部署',
      '静态网站托管',
      'JAMstack 应用',
      '预览部署'
    ],
    review: '<p>Vercel 让部署变得如此简单。Git push 即可自动部署，预览 URL 功能让团队协作更顺畅。虽然免费层有限制，但对于个人项目完全够用。</p>',
    alternatives: ['Netlify', 'Cloudflare Pages', 'Railway'],
    tags: ['部署', '托管', 'CDN'],
    featured: true,
    lastUpdated: '2024-01-15T08:00:00Z'
  },
  {
    id: '12',
    name: 'Cloudflare',
    slug: 'cloudflare',
    category: 'service',
    description: '全球 CDN 和安全服务提供商',
    rating: 5,
    price: 'freemium',
    website: 'https://www.cloudflare.com/',
    pros: [
      '免费层功能丰富',
      '全球节点覆盖',
      'DDoS 防护',
      'Workers 边缘计算'
    ],
    cons: [
      '高级功能收费',
      '配置较复杂',
      '某些地区访问受限'
    ],
    useCases: [
      'CDN 加速',
      'DNS 管理',
      '网站安全',
      '边缘计算'
    ],
    review: '<p>Cloudflare 是网站的第一道防线。免费的 CDN 服务已经足够强大，Workers 让我能在边缘运行代码。最近的 R2 存储服务也很有竞争力。</p>',
    alternatives: ['Fastly', 'AWS CloudFront', 'Akamai'],
    tags: ['CDN', '安全', 'DNS'],
    featured: false,
    lastUpdated: '2024-01-15T08:00:00Z'
  }
]