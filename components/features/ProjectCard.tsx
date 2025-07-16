'use client'

import Link from 'next/link'
import { Project } from '@/types/project'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const techColorMap: Record<string, string> = {
    'React': 'bg-cyan-100 text-cyan-700',
    'Next.js': 'bg-black/10 text-black',
    'TypeScript': 'bg-blue-100 text-blue-700',
    'Node.js': 'bg-green-100 text-green-700',
    'Python': 'bg-yellow-100 text-yellow-700',
    'Vue': 'bg-emerald-100 text-emerald-700',
    'Tailwind CSS': 'bg-teal-100 text-teal-700',
    'default': 'bg-gray-100 text-gray-700'
  }
  
  const getTechColor = (tech: string) => {
    return techColorMap[tech] || techColorMap.default
  }
  
  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <article className="h-full bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <OptimizedImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <div className="p-5 sm:p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
          
          {/* 技术栈标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className={`text-xs px-2 py-1 rounded-full font-medium ${getTechColor(tech)}`}
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
          
          {/* 项目链接 */}
          <div className="flex items-center gap-4 text-sm">
            {project.demoUrl && (
              <span className="flex items-center gap-1 text-gray-600 group-hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                预览
              </span>
            )}
            
            {project.githubUrl && (
              <span className="flex items-center gap-1 text-gray-600 group-hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                源码
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}