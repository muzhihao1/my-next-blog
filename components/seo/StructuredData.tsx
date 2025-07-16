import Script from 'next/script'

interface StructuredDataProps {
  type: 'Article' | 'Person' | 'WebSite' | 'BreadcrumbList' | 'BlogPosting' | 'Book' | 'SoftwareApplication'
  data: any
}
export function StructuredData({ type, data }: StructuredDataProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }
  
  return (
    <Script
      id={`structured-data-${type}-${data.name || data.headline || data.title || 'default'}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd)
      }}
    />
  )
}
export function generateArticleStructuredData({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url
}: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}) {
  return {
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || 'https://yourdomain.com/og-image.jpg',
    url,
    publisher: {
      '@type': 'Person',
      name: author,
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  }
}
export function generatePersonStructuredData({
  name,
  url,
  image,
  sameAs,
  jobTitle,
  description
}: {
  name: string
  url: string
  image?: string
  sameAs?: string[]
  jobTitle?: string
  description?: string
}) {
  return {
    name,
    url,
    image,
    sameAs,
    jobTitle,
    description,
    '@type': 'Person'
  }
}
export function generateWebSiteStructuredData({
  name,
  url,
  description,
  author
}: {
  name: string
  url: string
  description: string
  author: string
}) {
  return {
    name,
    url,
    description,
    author: {
      '@type': 'Person',
      name: author
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
export function generateBookStructuredData({
  title,
  author,
  isbn,
  description,
  image,
  datePublished,
  url
}: {
  title: string
  author: string
  isbn?: string
  description: string
  image?: string
  datePublished?: string
  url: string
}) {
  return {
    name: title,
    author: {
      '@type': 'Person',
      name: author
    },
    isbn,
    description,
    image,
    datePublished,
    url,
    bookFormat: 'EBook',
    inLanguage: 'zh-CN'
  }
}
export function generateSoftwareApplicationStructuredData({
  name,
  description,
  category,
  operatingSystem,
  applicationCategory,
  offers,
  aggregateRating,
  url
}: {
  name: string
  description: string
  category: string
  operatingSystem?: string[]
  applicationCategory?: string
  offers?: {
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  url: string
}) {
  return {
    name,
    description,
    applicationCategory: applicationCategory || category,
    operatingSystem,
    offers: offers ? { '@type': 'Offer', ...offers } : undefined,
    aggregateRating: aggregateRating ? { '@type': 'AggregateRating', ...aggregateRating } : undefined,
    url
  }
}