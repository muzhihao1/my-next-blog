/** * 收藏管理页面 * @module app/favorites/page */
'use client'

import { useState, useMemo } from 'react' 

import Link from 'next/link' 

import Image from 'next/image' 

import { useFavorites, FavoriteType, formatFavoriteDate, getFavoriteStats }
from '@/lib/hooks/useFavorites' 

import FavoriteButton from '@/components/features/FavoriteButton' 

import type { Metadata } from 'next' 

/** * 页面元数据 */ 
// export const metadata: Metadata = { 
//   title: '我的收藏 - 博客', 
//   description: '管理您收藏的文章、项目、书籍和工具' 
// }

/** * 收藏项卡片组件 * @component * @param {Object}
props - 组件属性 * @param {import('@/lib/hooks/useFavorites').FavoriteItem}
props.item - 收藏项 * @param {() => void}
props.onRemove - 移除回调 * @returns {JSX.Element} 渲染的收藏项卡片 */
function FavoriteCard({ item, onRemove }: { 
  item: import('@/lib/hooks/useFavorites').FavoriteItem
  onRemove: () => void 
}) {
  const typeConfig = {
    [FavoriteType.POST]: {
      label: '文章',
      href: `/posts/${item.slug}`,
      color: 'bg-blue-100 text-blue-700'
    },
    [FavoriteType.PROJECT]: {
      label: '项目',
      href: `/projects/${item.slug}`,
      color: 'bg-green-100 text-green-700'
    },
    [FavoriteType.BOOK]: {
      label: '书籍',
      href: `/bookshelf/${item.id}`,
      color: 'bg-purple-100 text-purple-700'
    },
    [FavoriteType.TOOL]: {
      label: '工具',
      href: `/tools#${item.id}`,
      color: 'bg-orange-100 text-orange-700'
    }
  }
const config = typeConfig[item.type]
return ( <div className="relative group">
<Link href={config.href}
className="block">
<div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full"> {/* 缩略图 */} {item.thumbnail && ( <div className="relative aspect-video overflow-hidden">
<Image src={item.thumbnail}
alt={item.title}
fill className="object-cover group-hover:scale-105 transition-transform duration-300" /> </div> )} {/* 内容 */}
<div className="p-6"> {/* 类型和时间 */}
<div className="flex items-center justify-between mb-3">
<span className={`text-xs font-medium px-2 py-1 rounded ${config.color}`}> {config.label} </span>
<span className="text-xs text-gray-500"> {formatFavoriteDate(item.favoriteDate)} </span> </div> {/* 标题 */}
<h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2"> {item.title} </h3> {/* 描述 */} {item.description && ( <p className="text-sm text-gray-600 mb-4 line-clamp-2"> {item.description} </p> )} </div> </div> </Link> {/* 收藏按钮 - 放在Link外部 */}
<div className="absolute top-2 right-2 z-10">
<FavoriteButton itemId={item.id}
itemType={item.type}
title={item.title}
description={item.description}
thumbnail={item.thumbnail}
slug={item.slug}
size="small" showText={false}
onToggle={() => onRemove()}
/> </div> </div> ) }
/** 
 * 收藏管理页面组件 
 * @component 
 * @returns {JSX.Element} 渲染的收藏管理页面 
 * @description 显示和管理用户的所有收藏内容，支持分类筛选、搜索和批量操作 
 */
export default function FavoritesPage() {
  const { favorites, isLoading, clearFavorites, getFavoritesByType } = useFavorites()
  const [selectedType, setSelectedType] = useState<FavoriteType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  
  // 筛选和排序收藏
  const filteredFavorites = useMemo(() => {
    let filtered = selectedType === 'all' 
      ? favorites 
      : getFavoritesByType(selectedType as FavoriteType)
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // 排序
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.favoriteDate.getTime() - a.favoriteDate.getTime()
      } else {
        return a.title.localeCompare(b.title)
      }
    })
  }, [favorites, selectedType, searchQuery, sortBy, getFavoritesByType])
  
  // 获取统计信息
  const stats = useMemo(() => getFavoriteStats(favorites), [favorites])
  
  if (isLoading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            我的收藏
          </h1>
          <p className="text-lg text-gray-600">
            共收藏了 {stats.total} 个内容
          </p>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byType[FavoriteType.POST] || 0}
            </div>
            <div className="text-sm text-gray-600">文章</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.byType[FavoriteType.PROJECT] || 0}
            </div>
            <div className="text-sm text-gray-600">项目</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byType[FavoriteType.BOOK] || 0}
            </div>
            <div className="text-sm text-gray-600">书籍</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.byType[FavoriteType.TOOL] || 0}
            </div>
            <div className="text-sm text-gray-600">工具</div>
          </div>
        </div>
        
        {/* 筛选和搜索 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* 类型筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.values(FavoriteType).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === FavoriteType.POST ? '文章' :
                 type === FavoriteType.PROJECT ? '项目' :
                 type === FavoriteType.BOOK ? '书籍' : '工具'}
              </button>
            ))}
          </div>
          
          {/* 搜索框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索收藏..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* 排序选项 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="date">按时间排序</option>
            <option value="title">按标题排序</option>
          </select>
          
          {/* 清空按钮 */}
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              清空收藏
            </button>
          )}
        </div>
        
        {/* 收藏列表 */}
        {filteredFavorites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map(item => (
              <FavoriteCard
                key={`${item.type}-${item.id}`}
                item={item}
                onRemove={() => {
                  // 移除后会自动更新列表
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-500 mb-4">
              {searchQuery ? '没有找到匹配的收藏' : '还没有收藏任何内容'}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                去探索内容
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}