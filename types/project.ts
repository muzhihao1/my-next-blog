export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'website' | 'opensource' | 'design' | 'other';
  status: 'active' | 'completed' | 'archived';
  featured: boolean;
  techStack: string[];
  tags: string[];
  thumbnail: string;
  screenshots: string[];
  demoUrl?: string;
  githubUrl?: string;
  content: string;
  startDate: string;
  endDate?: string;
  lastUpdated: string;
  metrics?: {
    users?: number;
    performance?: string;
    achievement?: string;
  };
  keyFeatures?: string[];
  challenges?: string[];
  solutions?: string[];
  developmentProcess?: string;
  codeSnippets?: {
    filename: string;
    language: string;
    code: string;
  }[];
}