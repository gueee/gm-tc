import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getContentBySlug, BlogPost } from '../services/blog'
import BlockRenderer from '../components/BlockRenderer'

// Import embedded components (legacy - for backwards compatibility)
import ExtrusionAnalysisChart from '../components/charts/ExtrusionAnalysisChart'

// Map of slug to embedded component (legacy)
const EMBEDDED_COMPONENTS: Record<string, React.FC> = {
  'gcode-extrusion-rate-analysis': ExtrusionAnalysisChart,
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await getContentBySlug(slug)
        setArticle(data)
      } catch (err) {
        console.error('Failed to fetch article:', err)
        setError('Article not found')
      } finally {
        setIsLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Check if this article has an embedded component (legacy)
  const EmbeddedComponent = slug ? EMBEDDED_COMPONENTS[slug] : null

  // Parse blocks from article data
  const blocks = useMemo(() => {
    if (!article?.blocks) return null
    
    // Handle array directly
    if (Array.isArray(article.blocks)) {
      return article.blocks.length > 0 ? article.blocks : null
    }
    
    // Handle wrapped format: { blocks: [...] }
    if (typeof article.blocks === 'object' && 'blocks' in article.blocks) {
      const wrapped = article.blocks as { blocks: unknown[] }
      return Array.isArray(wrapped.blocks) && wrapped.blocks.length > 0 ? wrapped.blocks : null
    }
    
    return null
  }, [article?.blocks])

  // Determine what content to show
  const hasBlocks = blocks && blocks.length > 0

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-steel-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-copper-400 hover:text-copper-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>
    )
  }

  return (
    <article className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-steel-400 hover:text-copper-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Header */}
        <header className="mb-12">
          {/* Category */}
          {article.category && (
            <Link
              to={`/articles?category=${article.category.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-copper-400/10 text-copper-400 text-sm font-medium rounded-full mb-4 hover:bg-copper-400/20 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {article.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-steel-400 mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-steel-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {article.view_count} views
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-copper max-w-none">
          {/* Priority 1: Embedded component (legacy, for specific slugs) */}
          {EmbeddedComponent ? (
            <EmbeddedComponent />
          ) : hasBlocks ? (
            /* Priority 2: Block-based content */
            <BlockRenderer blocks={blocks as any} />
          ) : article.content ? (
            /* Priority 3: Markdown content */
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-steel-300 mb-4 leading-relaxed">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-copper-400 hover:text-copper-300 underline"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-steel-300 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-steel-300 mb-4 space-y-2">{children}</ol>
                ),
                code: ({ className, children }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="px-1.5 py-0.5 bg-steel-800 text-copper-400 rounded text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-4 bg-steel-800 rounded-lg overflow-x-auto text-sm">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-steel-800 rounded-lg p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-copper-400 pl-4 italic text-steel-400 my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          ) : (
            <p className="text-steel-400">No content available for this article.</p>
          )}
        </div>
      </div>
    </article>
  )
}
