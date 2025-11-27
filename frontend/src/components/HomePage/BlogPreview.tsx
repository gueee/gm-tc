import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { blogService, type BlogPost } from '@/services/blog';

export function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.list({ per_page: 3 });
        setPosts(response.items);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-steel-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-steel-300">Loading latest posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white dark:bg-steel-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Latest Thoughts
            </h2>
            <p className="text-xl text-steel-300">
              Insights, projects, and discoveries from the workshop
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden md:flex items-center gap-2 text-copper-400 hover:text-copper-300 font-semibold transition-colors"
          >
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group block p-6 bg-steel-900 rounded-lg border border-steel-700 hover:border-copper-500 transition-all duration-300 hover:shadow-lg hover-glow"
            >
              {post.featured_image && (
                <div className="mb-4 aspect-video bg-steel-700 rounded overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-copper-400 transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-steel-300 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-steel-400">
                <Calendar className="w-4 h-4" />
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : new Date(post.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-copper-400 hover:text-copper-300 font-semibold transition-colors"
          >
            View All Posts <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

