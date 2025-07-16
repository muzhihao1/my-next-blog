/**
 * 标签系统类型定义
 * @module types/tag
 * @description 定义标签系统的核心类型和接口
 */

/**
 * 标签基础信息
 * @interface Tag
 * @property {string} id - 标签唯一标识符
 * @property {string} name - 标签名称
 * @property {string} slug - URL友好的标签标识
 * @property {string} [description] - 标签描述（可选）
 * @property {string} [color] - 标签颜色（可选，十六进制颜色值）
 * @property {number} count - 使用该标签的内容数量
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 标签创建输入
 * @interface TagInput
 * @property {string} name - 标签名称
 * @property {string} [description] - 标签描述（可选）
 * @property {string} [color] - 标签颜色（可选）
 */
export interface TagInput {
  name: string;
  description?: string;
  color?: string;
}

/**
 * 标签云项目
 * @interface TagCloudItem
 * @property {string} name - 标签名称
 * @property {string} slug - 标签标识
 * @property {number} count - 使用次数
 * @property {number} weight - 权重（用于调整显示大小）
 */
export interface TagCloudItem {
  name: string;
  slug: string;
  count: number;
  weight: number;
}

/**
 * 标签关联类型
 * @enum {string}
 */
export enum TaggedContentType {
  POST = "post",
  PROJECT = "project",
  BOOK = "book",
  TOOL = "tool",
}

/**
 * 标签关联内容
 * @interface TaggedContent
 * @property {string} id - 内容ID
 * @property {TaggedContentType} type - 内容类型
 * @property {string} title - 内容标题
 * @property {string} [slug] - 内容URL标识
 * @property {Date} createdAt - 创建时间
 */
export interface TaggedContent {
  id: string;
  type: TaggedContentType;
  title: string;
  slug?: string;
  createdAt: Date;
}

/**
 * 标签分组
 * @interface TagGroup
 * @property {string} name - 分组名称
 * @property {Tag[]} tags - 该分组下的标签列表
 * @property {number} totalCount - 分组内容总数
 */
export interface TagGroup {
  name: string;
  tags: Tag[];
  totalCount: number;
}

/**
 * 标签统计信息
 * @interface TagStats
 * @property {number} totalTags - 标签总数
 * @property {number} totalTaggedContent - 已标记内容总数
 * @property {Record<TaggedContentType, number>} contentByType - 各类型内容数量
 * @property {Tag[]} mostUsedTags - 最常用的标签
 * @property {Tag[]} recentTags - 最近创建的标签
 */
export interface TagStats {
  totalTags: number;
  totalTaggedContent: number;
  contentByType: Record<TaggedContentType, number>;
  mostUsedTags: Tag[];
  recentTags: Tag[];
}

/**
 * 创建标签的 URL slug
 * @function createTagSlug
 * @param {string} tagName - 标签名称
 * @returns {string} URL 友好的标签标识
 * @description 将标签名称转换为 URL 友好的格式，支持中文转拼音
 */
export function createTagSlug(tagName: string): string {
  // 简单的 slug 生成，移除特殊字符并转换为小写
  return tagName
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 保留字母、数字和中文
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的破折号
    .replace(/-+/g, '-'); // 将多个破折号替换为单个
}

/**
 * 获取标签的默认颜色
 * @function getTagColor
 * @param {string} tagName - 标签名称
 * @returns {string} 十六进制颜色值
 * @description 根据标签名称生成一个固定的颜色值
 */
export function getTagColor(tagName: string): string {
  // 预定义的颜色数组
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#6366f1', // indigo
  ];
  
  // 使用标签名称的哈希值来选择颜色
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
