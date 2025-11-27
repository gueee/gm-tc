import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService, type BlogPostCreate, type BlogPostUpdate } from '@/services/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/Blog/MarkdownRenderer';
import { Save, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';

export function BlogAdminPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  // Editing mode determined by id presence
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BlogPostCreate>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    published: false,
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const post = await blogService.getAdmin(id);
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || '',
            featured_image: post.featured_image || '',
            published: post.published,
          });
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to load post');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (id) {
        const updateData: BlogPostUpdate = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt || undefined,
          featured_image: formData.featured_image || undefined,
          published: formData.published,
        };
        await blogService.update(id, updateData);
      } else {
        await blogService.create(formData);
      }
      navigate('/blog/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await blogService.delete(id);
      navigate('/blog/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-steel-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-steel-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steel-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/blog/admin')}
            className="mb-4 border-steel-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-bold text-white">
            {id ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-steel-200">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-steel-900 border-steel-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-steel-200">Slug (leave empty to auto-generate)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated-from-title"
                      className="bg-steel-900 border-steel-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt" className="text-steel-200">Excerpt</Label>
                    <Input
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief description..."
                      className="bg-steel-900 border-steel-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featured_image" className="text-steel-200">Featured Image URL</Label>
                    <Input
                      id="featured_image"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://..."
                      className="bg-steel-900 border-steel-600 text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="content" className="text-steel-200">Content (Markdown)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="border-steel-600"
                      >
                        {showPreview ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                    {showPreview ? (
                      <div className="min-h-[400px] p-4 bg-steel-900 rounded-lg border border-steel-700">
                        <MarkdownRenderer content={formData.content} />
                      </div>
                    ) : (
                      <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                        rows={20}
                        className="w-full p-4 bg-steel-900 border border-steel-600 rounded-lg font-mono text-sm resize-y text-white"
                        placeholder="Write your markdown content here..."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded border-steel-600"
                    />
                    <Label htmlFor="published" className="cursor-pointer text-steel-200">
                      Publish immediately
                    </Label>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-copper-500 hover:bg-copper-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Post'}
                    </Button>

                    {id && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

