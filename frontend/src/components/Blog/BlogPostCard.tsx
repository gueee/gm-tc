import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/services/blog';

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block p-6 bg-steel-50 dark:bg-steel-900 rounded-lg border border-steel-200 dark:border-steel-700 hover:border-copper-500 dark:hover:border-copper-500 transition-all duration-300 hover:shadow-lg hover-glow"
    >
      {post.featured_image && (
        <div className="mb-4 aspect-video bg-steel-200 dark:bg-steel-700 rounded overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <h3 className="text-2xl font-semibold text-steel-900 dark:text-white mb-2 group-hover:text-copper-500 dark:group-hover:text-copper-400 transition-colors">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-steel-600 dark:text-steel-300 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-steel-500 dark:text-steel-400">
          <Calendar className="w-4 h-4" />
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
        </div>
        <ArrowRight className="w-5 h-5 text-copper-500 dark:text-copper-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

