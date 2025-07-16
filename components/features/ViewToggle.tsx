/** * 视图切换组件 * @module components/features/ViewToggle */
'use client'

/** * 视图切换组件的属性 * @interface ViewToggleProps * @property {'grid' | 'list'} view - 当前视图模式 * @property {(view: 'grid' | 'list') => void} onViewChange - 视图切换回调函数 */
interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}
/** * 视图切换组件 * @component * @param {ViewToggleProps}
props - 组件属性 * @returns {JSX.Element} 渲染的视图切换按钮组 * @description 提供网格和列表两种视图模式的切换功能。 * 包含视觉反馈和无障碍支持。 * @example * <ViewToggle * view={currentView} * onViewChange={(newView) => setCurrentView(newView)} * /> */
export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded transition-colors ${
          view === 'grid'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900:text-white'
        }`}
        aria-label="网格视图"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded transition-colors ${
          view === 'list'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900:text-white'
        }`}
        aria-label="列表视图"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  )
}