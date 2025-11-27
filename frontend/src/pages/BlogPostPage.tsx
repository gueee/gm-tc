import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import { blogService, type BlogPost } from '@/services/blog';
import { MarkdownRenderer } from '@/components/Blog/MarkdownRenderer';
import { Button } from '@/components/ui/button';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('Invalid post slug');
        setLoading(false);
        return;
      }

      try {
        const data = await blogService.getBySlug(slug);
        setPost(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-steel-50 dark:bg-steel-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-steel-600 dark:text-steel-300">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-steel-50 dark:bg-steel-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-steel-900 dark:text-white mb-4">
              Post Not Found
            </h1>
            <p className="text-steel-600 dark:text-steel-300 mb-8">{error || 'The post you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/blog')} className="bg-copper-500 hover:bg-copper-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : new Date(post.created_at);

  return (
    <div className="min-h-screen bg-steel-50 dark:bg-steel-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-steel-600 dark:text-steel-300 hover:text-copper-500 dark:hover:text-copper-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-steel-900 dark:text-white mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-steel-600 dark:text-steel-300 mb-6">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-steel-500 dark:text-steel-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publishedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.ceil(post.content.split(' ').length / 200)} min read
              </div>
            </div>
          </header>

          {/* Content */}
          <article className="bg-white dark:bg-steel-800 rounded-lg p-8 md:p-12 shadow-lg">
            <MarkdownRenderer content={post.content} />
          </article>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-steel-200 dark:border-steel-700">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-copper-500 dark:text-copper-400 hover:text-copper-600 dark:hover:text-copper-300 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

