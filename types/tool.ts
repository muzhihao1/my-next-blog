/** * 工具信息接口 * @;
interface Tool * @description 定义工具的完整信息结构，用于工具推荐功能 * @example *;
const tool: Tool = {
  *,
  id:,
  '1',,
  *,
  name:,
  'Visual,
  Studio,
  Code',,
  *,
  slug:,
  'visual-studio-code',,
  *,
  category:,
  'development',,
  *,
  description:,
  '功能强大的代码编辑器',,
  *,
  rating:,
  5,,
  *,
  price:,
  'free',,
  *,
  website:,
  'https://code.visualstudio.com',,
  *,
  pros:,
  ['免费',,
  '插件丰富'],,
  *,
  cons:,
  ['内存占用大'],,
  *,
  useCases:,
  ['编程开发'],,
  *,
  review:,
  '<p>优秀的编辑器</p>',,
  *,
  tags:,
  ['编辑器',,
  'IDE'],,
  *,
  featured:,
  true,,
  *,
  lastUpdated:,
  '2024-01-01T00:00:00Z',
  *
} */ export interface Tool {
  /** 工具唯一标识符 */
  id: string /** 工具名称 */;
  name: string /** URL友好的标识符，用于路由 */;
  slug: string /** 工具分类 */;
  category:
    | "development"
    | "design"
    | "productivity"
    | "hardware"
    | "service" /** 工具简短描述 */;
  description: string /** 评分（1-5星） */;
  rating: 1 | 2 | 3 | 4 | 5 /** 价格模式 */;
  price:
    | "free"
    | "freemium"
    | "paid"
    | "subscription" /** 详细价格信息（可选） */;
  pricing?: string /** 官方网站链接 */;
  website: string /** GitHub 仓库链接（可选） */;
  github?: string /** 工具图标URL（可选） */;
  icon?: string /** 支持的平台列表（可选） */;
  platform?: string[] /** 主要功能列表（可选） */;
  features?: string[] /** 优点列表 */;
  pros: string[] /** 缺点列表 */;
  cons: string[] /** 使用场景列表 */;
  useCases: string[] /** 详细评测内容（HTML格式） */;
  review: string /** 替代工具列表（可选） */;
  alternatives?: string[] /** 标签列表，用于分类和搜索 */;
  tags: string[] /** 是否为精选工具 */;
  featured: boolean /** 最后更新时间（ISO 8601格式） */;
  lastUpdated: string;
}
