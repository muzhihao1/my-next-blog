/**
 * TypeScript definitions for Notion blog integration
 */

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  date: string
  readTime: string
  category: string
  author: {
    name: string
    avatar: string
  }
  content?: string
  cover?: string
  tags: string[]
  published: boolean
  createdTime: string
  lastEditedTime: string
}

export interface NotionPage {
  id: string
  properties: NotionProperties
  cover?: NotionCover
  created_time: string
  last_edited_time: string
}

export interface NotionProperties {
  Title: {
    title: Array<{
      text: { content: string }
    }>
  }
  Slug: {
    rich_text: Array<{
      text: { content: string }
    }>
  }
  Category: {
    select: { name: string } | null
  }
  Excerpt: {
    rich_text: Array<{
      text: { content: string }
    }>
  }
  Date: {
    date: { start: string } | null
  }
  ReadTime: {
    rich_text: Array<{
      text: { content: string }
    }>
  }
  AuthorName: {
    rich_text: Array<{
      text: { content: string }
    }>
  }
  AuthorAvatar: {
    url: string | null
  }
  Published: {
    checkbox: boolean
  }
  Tags: {
    multi_select: Array<{ name: string }>
  }
}

export interface NotionCover {
  external?: { url: string }
  file?: { url: string }
}

export interface NotionApiResponse {
  results: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}

/**
 * Notion API 错误类
 * @class NotionError
 * @extends Error
 * @description 用于处理 Notion API 相关的错误
 */
export class NotionError extends Error {
  public readonly code: string;
  public readonly status?: number;
  
  constructor(message: string, code: string = 'NOTION_ERROR', status?: number) {
    super(message);
    this.name = 'NotionError';
    this.code = code;
    this.status = status;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotionError);
    }
  }
}