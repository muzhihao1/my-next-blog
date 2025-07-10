/** * 标签管理模块 * @module lib/tags/tag-manager * @description 提供标签的创建、查询、更新和删除功能 */
import { Tag, TagInput, TagCloudItem, TaggedContent, TaggedContentType, TagFilterOptions, TagStats, createTagSlug, isValidTagName, getTagColor }
from '@/types/tag' /** * 标签存储键名 */
const TAGS_STORAGE_KEY = 'blog_tags' const TAG_RELATIONS_KEY = 'blog_tag_relations' /** * 标签管理器类 * @class TagManager * @description 管理标签的增删改查操作，使用 LocalStorage 进行持久化 */
export class TagManager { private tags: Map<string, Tag> private relations: Map<string, Set<string>> // tagId -> contentIds constructor() { this.tags = new Map() this.relations = new Map() this.loadFromStorage() }
/** * 从本地存储加载标签数据 * @private */
private loadFromStorage(): void { if (typeof window === 'undefined') return try { const tagsData = localStorage.getItem(TAGS_STORAGE_KEY) const relationsData = localStorage.getItem(TAG_RELATIONS_KEY) if (tagsData) { const parsed = JSON.parse(tagsData) Object.entries(parsed).forEach(([id, tag]) => { this.tags.set(id, { ...tag as Tag, createdAt: new Date((tag as any).createdAt), updatedAt: new Date((tag as any).updatedAt) }) }) }
if (relationsData) { const parsed = JSON.parse(relationsData) Object.entries(parsed).forEach(([tagId, contentIds]) => { this.relations.set(tagId, new Set(contentIds as string[])) }) }
}
catch (error) { console.error('Failed to load tags from storage:', error) }
}/** * 保存标签数据到本地存储 * @private */
private saveToStorage(): void { if (typeof window === 'undefined') return try { const tagsData = Object.fromEntries(this.tags) const relationsData = Object.fromEntries( Array.from(this.relations.entries()).map(([tagId, contentIds]) => [ tagId, Array.from(contentIds) ]) ) localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagsData)) localStorage.setItem(TAG_RELATIONS_KEY, JSON.stringify(relationsData)) }
catch (error) { console.error('Failed to save tags to storage:', error) }
}/** * 创建新标签 * @param {TagInput}
input - 标签输入数据 * @returns {Tag} 创建的标签 * @throws {Error} 当标签名称无效或已存在时 */
createTag(input: TagInput): Tag { if (!isValidTagName(input.name)) { throw new Error('Invalid tag name') }
const slug = createTagSlug(input.name) const existingTag = this.getTagBySlug(slug) if (existingTag) { throw new Error(`Tag with slug "${slug}" already exists`) }
const id = `tag_${Date.now()}
_${Math.random().toString(36).substr(2, 9)}` const now = new Date() const tag: Tag = { id, name: input.name.trim(), slug, description: input.description?.trim(), color: input.color || getTagColor(id), count: 0, createdAt: now, updatedAt: now }
this.tags.set(id, tag) this.relations.set(id, new Set()) this.saveToStorage() return tag }
/** * 获取所有标签 * @param {TagFilterOptions} [options] - 筛选选项 * @returns {Tag[]
}标签列表 */
getAllTags(options?: TagFilterOptions): Tag[] { let tags = Array.from(this.tags.values()) // 搜索过滤 if (options?.search) { const searchLower = options.search.toLowerCase() tags = tags.filter(tag => tag.name.toLowerCase().includes(searchLower) || tag.description?.toLowerCase().includes(searchLower) ) }
// 最小使用次数过滤 if (options?.minCount !== undefined) { const minCount = options.minCount tags = tags.filter(tag => tag.count >= minCount) }
// 排序 const sortBy = options?.sortBy || 'name' const sortOrder = options?.sortOrder || 'asc' tags.sort((a, b) => { let comparison = 0 switch (sortBy) { case 'name': comparison = a.name.localeCompare(b.name) break
case 'count': comparison = a.count - b.count break
case 'createdAt': comparison = a.createdAt.getTime() - b.createdAt.getTime() break }
return sortOrder === 'asc' ? comparison : -comparison }) return tags }
/** * 根据ID获取标签 * @param {string}
id - 标签ID * @returns {Tag | null} 标签对象或null */
getTagById(id: string): Tag | null { return this.tags.get(id) || null }
/** * 根据slug获取标签 * @param {string}
slug - 标签slug * @returns {Tag | null} 标签对象或null */
getTagBySlug(slug: string): Tag | null { return Array.from(this.tags.values()).find(tag => tag.slug === slug) || null }
/** * 更新标签 * @param {string}
id - 标签ID * @param {Partial<TagInput>}
updates - 更新内容 * @returns {Tag} 更新后的标签 * @throws {Error} 当标签不存在时 */
updateTag(id: string, updates: Partial<TagInput>): Tag { const tag = this.tags.get(id) if (!tag) { throw new Error(`Tag with id "${id}" not found`) }
const updatedTag: Tag = { ...tag, ...updates, id: tag.id, // 确保ID不被更改 slug: updates.name ? createTagSlug(updates.name) : tag.slug, updatedAt: new Date() }
this.tags.set(id, updatedTag) this.saveToStorage() return updatedTag }
/** * 删除标签 * @param {string}
id - 标签ID * @throws {Error} 当标签不存在时 */
deleteTag(id: string): void { if (!this.tags.has(id)) { throw new Error(`Tag with id "${id}" not found`) }
this.tags.delete(id) this.relations.delete(id) this.saveToStorage() }
/** * 为内容添加标签 * @param {string}
contentId - 内容ID * @param {string[]
}
tagIds - 标签ID列表 * @param {TaggedContentType}
contentType - 内容类型 */
addTagsToContent(contentId: string, tagIds: string[], contentType: TaggedContentType): void { tagIds.forEach(tagId => { const tag = this.tags.get(tagId) if (!tag) { console.warn(`Tag with id "${tagId}" not found`) return }
const contentSet = this.relations.get(tagId) || new Set() const contentKey = `${contentType}:${contentId}` if (!contentSet.has(contentKey)) { contentSet.add(contentKey) this.relations.set(tagId, contentSet) // 更新标签计数 tag.count = contentSet.size tag.updatedAt = new Date() this.tags.set(tagId, tag) }
}) this.saveToStorage() }
/** * 从内容移除标签 * @param {string}
contentId - 内容ID * @param {string[]
}
tagIds - 标签ID列表 * @param {TaggedContentType}
contentType - 内容类型 */
removeTagsFromContent(contentId: string, tagIds: string[], contentType: TaggedContentType): void { tagIds.forEach(tagId => { const tag = this.tags.get(tagId) const contentSet = this.relations.get(tagId) if (tag && contentSet) { const contentKey = `${contentType}:${contentId}` contentSet.delete(contentKey) // 更新标签计数 tag.count = contentSet.size tag.updatedAt = new Date() this.tags.set(tagId, tag) }
}) this.saveToStorage() }
/** * 获取内容的所有标签 * @param {string}
contentId - 内容ID * @param {TaggedContentType}
contentType - 内容类型 * @returns {Tag[]
}标签列表 */
getContentTags(contentId: string, contentType: TaggedContentType): Tag[] { const contentKey = `${contentType}:${contentId}` const tags: Tag[] = []
this.relations.forEach((contentSet, tagId) => { if (contentSet.has(contentKey)) { const tag = this.tags.get(tagId) if (tag) { tags.push(tag) }
} }) return tags }
/** * 生成标签云数据 * @param {number} [limit] - 限制数量 * @returns {TagCloudItem[]
}标签云项目列表 */
generateTagCloud(limit?: number): TagCloudItem[] { let tags = this.getAllTags({ sortBy: 'count', sortOrder: 'desc' }) if (limit && limit > 0) { tags = tags.slice(0, limit) }
const maxCount = Math.max(...tags.map(t => t.count), 1) const minCount = Math.min(...tags.map(t => t.count), 0) const range = maxCount - minCount || 1 return tags.map(tag => ({ name: tag.name, slug: tag.slug, count: tag.count, weight: 0.5 + (tag.count - minCount) / range * 0.5 // 0.5 to 1.0 })) }
/** * 获取标签统计信息 * @returns {TagStats} 统计信息 */
getStats(): TagStats { const tags = Array.from(this.tags.values()) const contentByType: Record<TaggedContentType, number> = { [TaggedContentType.POST]: 0, [TaggedContentType.PROJECT]: 0, [TaggedContentType.BOOK]: 0, [TaggedContentType.TOOL]: 0 }
let totalTaggedContent = 0 this.relations.forEach(contentSet => { contentSet.forEach(contentKey => { const [type] = contentKey.split(':') if (type in contentByType) { contentByType[type as TaggedContentType]++ totalTaggedContent++ }
}) }) return { totalTags: tags.length, totalTaggedContent, contentByType, mostUsedTags: tags .sort((a, b) => b.count - a.count) .slice(0, 10), recentTags: tags .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) .slice(0, 10) }
}/** * 批量导入标签 * @param {TagInput[]
}
tagInputs - 标签输入列表 * @returns {Tag[]
}创建的标签列表 */
importTags(tagInputs: TagInput[]): Tag[] { const createdTags: Tag[] = []
tagInputs.forEach(input => { try { const tag = this.createTag(input) createdTags.push(tag) }
catch (error) { console.warn(`Failed to import tag "${input.name}":`, error) }
}) return createdTags }
/** * 导出所有标签数据 * @returns {Object} 导出的数据 */
exportData(): { tags: Tag[], relations: Record<string, string[]> } { return { tags: Array.from(this.tags.values()), relations: Object.fromEntries( Array.from(this.relations.entries()).map(([tagId, contentIds]) => [ tagId, Array.from(contentIds) ]) ) }
} }
// 创建单例实例 let tagManagerInstance: TagManager | null = null /** * 获取标签管理器实例 * @returns {TagManager} 标签管理器实例 */
export function getTagManager(): TagManager { if (!tagManagerInstance) { tagManagerInstance = new TagManager() }
return tagManagerInstance }