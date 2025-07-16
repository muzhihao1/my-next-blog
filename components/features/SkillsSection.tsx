/**
 * 技能展示组件
 * @module components/features/SkillsSection
 */
'use client'

import { useState } from 'react'

/**
 * 技能项定义
 * @interface Skill
 * @property {string} name - 技能名称
 * @property {number} level - 技能水平（0-100）
 * @property {'frontend' | 'backend' | 'tools' | 'soft'} category - 技能分类
 */
interface Skill {
  name: string
  level: number // 0-100
  category: 'frontend' | 'backend' | 'tools' | 'soft'
}

const skills: Skill[] = [
  // Frontend
  { name: 'React / Next.js', level: 95, category: 'frontend' },
  { name: 'TypeScript', level: 90, category: 'frontend' },
  { name: 'Vue.js', level: 85, category: 'frontend' },
  { name: 'Tailwind CSS', level: 90, category: 'frontend' },
  { name: 'JavaScript', level: 95, category: 'frontend' },
  { name: 'HTML/CSS', level: 95, category: 'frontend' },
  
  // Backend
  { name: 'Node.js', level: 85, category: 'backend' },
  { name: 'Python', level: 80, category: 'backend' },
  { name: 'PostgreSQL', level: 75, category: 'backend' },
  { name: 'Redis', level: 70, category: 'backend' },
  { name: 'GraphQL', level: 80, category: 'backend' },
  { name: 'REST API', level: 90, category: 'backend' },
  
  // Tools
  { name: 'Git / GitHub', level: 90, category: 'tools' },
  { name: 'Docker', level: 75, category: 'tools' },
  { name: 'CI/CD', level: 80, category: 'tools' },
  { name: 'AWS / Vercel', level: 70, category: 'tools' },
  { name: 'Figma', level: 85, category: 'tools' },
  { name: 'VS Code', level: 95, category: 'tools' },
  
  // Soft Skills
  { name: '技术写作', level: 90, category: 'soft' },
  { name: '项目管理', level: 85, category: 'soft' },
  { name: '团队协作', level: 90, category: 'soft' },
  { name: '产品思维', level: 85, category: 'soft' },
  { name: '问题解决', level: 95, category: 'soft' },
  { name: '持续学习', level: 100, category: 'soft' }
]

const categoryLabels = {
  frontend: '前端技术',
  backend: '后端技术',
  tools: '开发工具',
  soft: '软技能'
}

const categoryColors = {
  frontend: 'from-blue-500 to-blue-600',
  backend: 'from-green-500 to-green-600',
  tools: 'from-purple-500 to-purple-600',
  soft: 'from-orange-500 to-orange-600'
}

/**
 * 技能展示区域组件
 * @component
 * @returns {JSX.Element} 渲染的技能展示区域
 * @description 展示个人技能的组件，包含技能分类、进度条展示、分类筛选功能。
 * 技能分为前端、后端、工具和软技能四大类，每个技能用进度条显示掌握程度。
 * @example
 * <SkillsSection />
 */
export default function SkillsSection() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categoryLabels | 'all'>('all')
  
  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(skill => skill.category === selectedCategory)
    
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)
  
  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          全部
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key as keyof typeof categoryLabels)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Skills Display */}
      <div className="space-y-8">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category}>
            {selectedCategory === 'all' && (
              <h3 className="text-xl font-semibold mb-4">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
            )}
            
            <div className="grid gap-4">
              {categorySkills.map((skill) => (
                <SkillBar
                  key={skill.name}
                  skill={skill}
                  color={categoryColors[skill.category]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Skill Summary */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h4 className="text-lg font-semibold mb-3">技能说明</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 90-100%: 精通，能够独立解决复杂问题并指导他人</p>
          <p>• 70-89%: 熟练，能够高效完成大部分任务</p>
          <p>• 50-69%: 熟悉，能够独立完成基础任务</p>
          <p>• 30-49%: 了解，正在学习提升中</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual skill bar component
 */
function SkillBar({ skill, color }: { skill: Skill; color: string }) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{skill.name}</span>
        <span className="text-sm text-muted-foreground">{skill.level}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 ease-out group-hover:opacity-90`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  )
}