import { getProjects } from '@/lib/notion/projects'
import { fallbackProjects } from '@/lib/fallback-projects'
import ProjectsClient from './ProjectsClient'

export const metadata = {
  title: '项目作品',
  description: '我参与和创建的各类项目',
}

export default async function ProjectsPage() {
  let projects
  
  try {
    projects = await getProjects()
    if (!projects || projects.length === 0) {
      console.log('No projects from Notion, using fallback data')
      projects = fallbackProjects
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    projects = fallbackProjects
  }

  return <ProjectsClient projects={projects} />
}