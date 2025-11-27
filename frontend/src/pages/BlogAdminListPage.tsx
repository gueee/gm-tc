import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { blogService, type BlogPost } from '@/services/blog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';

export function BlogAdminListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.listAdmin({ per_page: 50 });
        setPosts(response.items);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await blogService.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-steel-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Blog Admin</h1>
            <div className="flex gap-4 mt-4">
              <Link
                to="/admin/homepage"
                className="text-copper-400 hover:text-copper-300 transition-colors"
              >
                Homepage CMS
              </Link>
              <button
                onClick={logout}
                className="text-steel-400 hover:text-steel-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <Button
            onClick={() => navigate('/blog/admin/new')}
            className="bg-copper-500 hover:bg-copper-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-steel-300">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-steel-800 border-steel-700">
            <CardContent className="py-12 text-center">
              <p className="text-steel-300 mb-4">No posts yet.</p>
              <Button
                onClick={() => navigate('/blog/admin/new')}
                className="bg-copper-500 hover:bg-copper-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2 text-white">{post.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-steel-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            post.published
                              ? 'bg-green-900 text-green-200'
                              : 'bg-steel-700 text-steel-300'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {post.published && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-steel-600"
                        >
                          <Link to={`/blog/${post.slug}`} target="_blank">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/blog/admin/${post.id}`)}
                        className="border-steel-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {post.excerpt && (
                  <CardContent>
                    <p className="text-steel-300">{post.excerpt}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

