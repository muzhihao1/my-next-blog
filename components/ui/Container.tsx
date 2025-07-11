/** * 统一容器组件 * @module components/ui/Container * @description 提供一致的容器布局，包括最大宽度、内边距和响应式设计 */
import { ReactNode }
from 'react' 

import { cn } from '@/lib/utils'

/** 
 * 容器组件属性 
 * @interface ContainerProps 
 * @property {ReactNode} children - 子元素 
 * @property {string} [className] - 额外的样式类 
 * @property {'sm' | 'md' | 'lg' | 'xl' | 'full'} [size] - 容器尺寸 
 * @property {boolean} [noPadding] - 是否移除内边距 
 */
interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  noPadding?: boolean
}
/** 
 * 容器尺寸映射 
 */
const sizeClasses = {
  sm: 'max-w-3xl', // 768px - 适合阅读内容
  md: 'max-w-4xl', // 896px - 标准内容
  lg: 'max-w-6xl', // 1152px - 宽内容
  xl: 'max-w-7xl', // 1280px - 超宽内容
  full: 'max-w-full' // 全宽
}

/** 
 * 统一容器组件 
 * @component 
 * @param {ContainerProps} props - 组件属性 
 * @returns {JSX.Element} 渲染的容器 
 * @description 提供统一的页面容器，确保所有页面具有一致的布局和边距 
 * @example 
 * <Container size="lg"> 
 *   <h1>页面标题</h1> 
 *   <p>页面内容</p> 
 * </Container> 
 */
export default function Container({ 
  children, 
  className, 
  size = 'lg', 
  noPadding = false 
}: ContainerProps) {
  return (
    <div className={cn(
      'mx-auto w-full',
      sizeClasses[size],
      !noPadding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  )
}
/** 
 * 页面容器组件 
 * @component 
 * @description 标准页面容器，包含垂直内边距 
 */
export function PageContainer({ 
  children, 
  className, 
  size = 'lg' 
}: Omit<ContainerProps, 'noPadding'>) {
  return (
    <Container 
      size={size}
      className={cn('py-16', className)}
    >
      {children}
    </Container>
  )
}
/** 
 * 内容容器组件 
 * @component 
 * @description 适合阅读的内容容器，较窄的宽度 
 */
export function ContentContainer({ 
  children, 
  className 
}: Omit<ContainerProps, 'size' | 'noPadding'>) {
  return (
    <Container 
      size="sm" 
      className={cn('py-8', className)}
    >
      {children}
    </Container>
  )
}