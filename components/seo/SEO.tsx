/**
 * SEO component for structured data and meta tags
 */
import { FC } from 'react'

export interface ArticleStructuredData {
  '@context': 'https://schema.org'
  '@type': 'BlogPosting' | 'Article'
  headline: string
  description?: string
  image?: string | string[]
  datePublished: string
  dateModified?: string
  author: {
    '@type': 'Person'
    name: string
    url?: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
  mainEntityOfPage?: {
    '@type': 'WebPage'
    '@id': string
  }
  keywords?: string[]
}

export interface PersonStructuredData {
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: string
  url?: string
  image?: string
  sameAs?: string[]
  jobTitle?: string
  worksFor?: {
    '@type': 'Organization'
    name: string
  }
  description?: string
  email?: string
  telephone?: string
  address?: {
    '@type': 'PostalAddress'
    addressLocality?: string
    addressRegion?: string
    addressCountry?: string
  }
}

export interface WebsiteStructuredData {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  author?: {
    '@type': 'Person'
    name: string
  }
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export interface BookStructuredData {
  '@context': 'https://schema.org'
  '@type': 'Book'
  name: string
  author: {
    '@type': 'Person'
    name: string
  }
  bookFormat?: 'EBook' | 'Paperback' | 'Hardcover'
  isbn?: string
  numberOfPages?: number
  datePublished?: string
  publisher?: {
    '@type': 'Organization'
    name: string
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    ratingCount?: number
    bestRating?: number
    worstRating?: number
  }
  review?: {
    '@type': 'Review'
    reviewRating: {
      '@type': 'Rating'
      ratingValue: number
      bestRating?: number
    }
    author: {
      '@type': 'Person'
      name: string
    }
    reviewBody?: string
    datePublished?: string
  }
}

export interface ProjectStructuredData {
  '@context': 'https://schema.org'
  '@type': 'SoftwareApplication' | 'CreativeWork'
  name: string
  description?: string
  url?: string
  image?: string | string[]
  author: {
    '@type': 'Person' | 'Organization'
    name: string
  }
  dateCreated?: string
  dateModified?: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: {
    '@type': 'Offer'
    price: string | number
    priceCurrency?: string
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    ratingCount?: number
  }
}

interface SEOProps {
  structuredData?: ArticleStructuredData | PersonStructuredData | WebsiteStructuredData | BookStructuredData | ProjectStructuredData | Record<string, any>
}

/**
 * SEO component that renders structured data
 * Place this component in the page where you want to add structured data
 */
export const SEO: FC<SEOProps> = ({ structuredData }) => {
  if (!structuredData) return null
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

/**
 * Helper function to generate article structured data
 */
export function generateArticleStructuredData(params: {
  title: string
  description?: string
  publishedDate: string
  modifiedDate?: string
  authorName: string
  authorUrl?: string
  image?: string | string[]
  keywords?: string[]
  url: string
}): ArticleStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.title,
    description: params.description,
    image: params.image,
    datePublished: params.publishedDate,
    dateModified: params.modifiedDate || params.publishedDate,
    author: {
      '@type': 'Person',
      name: params.authorName,
      url: params.authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: '个人博客',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': params.url
    },
    keywords: params.keywords
  }
}

/**
 * Helper function to generate person structured data
 */
export function generatePersonStructuredData(params: {
  name: string
  url?: string
  image?: string
  jobTitle?: string
  company?: string
  description?: string
  email?: string
  location?: string
  socialLinks?: string[]
}): PersonStructuredData {
  const data: PersonStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    url: params.url,
    image: params.image,
    jobTitle: params.jobTitle,
    description: params.description,
    email: params.email,
    sameAs: params.socialLinks
  }
  
  if (params.company) {
    data.worksFor = {
      '@type': 'Organization',
      name: params.company
    }
  }
  
  if (params.location) {
    data.address = {
      '@type': 'PostalAddress',
      addressLocality: params.location
    }
  }
  
  return data
}

/**
 * Helper function to generate website structured data
 */
export function generateWebsiteStructuredData(params: {
  name: string
  url: string
  description?: string
  authorName?: string
  searchUrlTemplate?: string
}): WebsiteStructuredData {
  const data: WebsiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: params.name,
    url: params.url,
    description: params.description
  }
  
  if (params.authorName) {
    data.author = {
      '@type': 'Person',
      name: params.authorName
    }
  }
  
  if (params.searchUrlTemplate) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: params.searchUrlTemplate
      },
      'query-input': 'required name=search_term_string'
    }
  }
  
  return data
}