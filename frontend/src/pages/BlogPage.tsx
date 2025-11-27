import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { blogService, BlogPost } from '@/services/blog';
import { BlogPostCard } from '@/components/Blog/BlogPostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await blogService.list({
          page,
          per_page: 9,
          search: search || undefined,
        });
        setPosts(response.items);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    if (search) {
      params.set('search', search);
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-steel-50 dark:bg-steel-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-steel-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-xl text-steel-600 dark:text-steel-300 max-w-2xl mx-auto">
            Insights, projects, and discoveries from the workshop
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-400" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-steel-800 border-steel-300 dark:border-steel-600"
              />
            </div>
            <Button type="submit" className="bg-copper-500 hover:bg-copper-600">
              Search
            </Button>
          </div>
        </form>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-steel-600 dark:text-steel-300">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-steel-600 dark:text-steel-300 text-lg">
              No posts found. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="border-steel-300 dark:border-steel-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-steel-600 dark:text-steel-300 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="border-steel-300 dark:border-steel-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

