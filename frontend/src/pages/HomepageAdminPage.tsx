import { useEffect, useState } from 'react';
import { homepageService, type HomepageContent } from '@/services/homepage';
import { blogService, type BlogPost, type BlogPostCreate } from '@/services/blog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownRenderer } from '@/components/Blog/MarkdownRenderer';
import { Save, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ContentEditorProps {
  content: HomepageContent | null;
  onSave: (key: string, content: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

function ContentEditor({ content, onSave, onCancel }: ContentEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData(content.content);
    } else {
      setFormData({});
    }
  }, [content]);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await onSave(content.key, formData);
    } finally {
      setSaving(false);
    }
  };

  if (!content) return null;

  // Hero section editor
  if (content.key === 'hero') {
    return (
      <Card className="bg-steel-800 border-steel-700">
        <CardHeader>
          <CardTitle className="text-white">Edit Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-steel-200">Headline</Label>
            <Input
              value={formData.headline || ''}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="bg-steel-900 border-steel-600 text-white"
            />
          </div>
          <div>
            <Label className="text-steel-200">Tagline</Label>
            <Input
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="bg-steel-900 border-steel-600 text-white"
            />
          </div>
          <div>
            <Label className="text-steel-200">Subtitle</Label>
            <Input
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="bg-steel-900 border-steel-600 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-copper-500 hover:bg-copper-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-steel-600">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interests editor
  if (content.key === 'interests') {
    const interests = formData.interests || [];
    
    return (
      <Card className="bg-steel-800 border-steel-700">
        <CardHeader>
          <CardTitle className="text-white">Edit Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interests.map((interest: any, index: number) => (
            <div key={index} className="p-4 bg-steel-900 rounded-lg border border-steel-700 space-y-2">
              <div>
                <Label className="text-steel-200">Icon</Label>
                <select
                  value={interest.icon || 'Code'}
                  onChange={(e) => {
                    const newInterests = [...interests];
                    newInterests[index] = { ...interest, icon: e.target.value };
                    setFormData({ ...formData, interests: newInterests });
                  }}
                  className="w-full p-2 bg-steel-800 border border-steel-600 rounded-lg text-white"
                >
                  <option value="Printer">Printer</option>
                  <option value="Code">Code</option>
                  <option value="Cpu">Cpu</option>
                  <option value="Zap">Zap</option>
                  <option value="Bike">Bike</option>
                  <option value="Brain">Brain</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Sparkles">Sparkles</option>
                </select>
              </div>
              <div>
                <Label className="text-steel-200">Title</Label>
                <Input
                  value={interest.title || ''}
                  onChange={(e) => {
                    const newInterests = [...interests];
                    newInterests[index] = { ...interest, title: e.target.value };
                    setFormData({ ...formData, interests: newInterests });
                  }}
                  className="bg-steel-800 border-steel-600 text-white"
                />
              </div>
              <div>
                <Label className="text-steel-200">Description</Label>
                <Input
                  value={interest.description || ''}
                  onChange={(e) => {
                    const newInterests = [...interests];
                    newInterests[index] = { ...interest, description: e.target.value };
                    setFormData({ ...formData, interests: newInterests });
                  }}
                  className="bg-steel-800 border-steel-600 text-white"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const newInterests = interests.filter((_: any, i: number) => i !== index);
                  setFormData({ ...formData, interests: newInterests });
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          ))}
          <div className="space-y-2">
            <Label className="text-steel-200">Icon (choose from: Printer, Code, Cpu, Zap, Bike, Brain, Wrench, Sparkles)</Label>
            <select
              value={interests[interests.length - 1]?.icon || 'Code'}
              onChange={(e) => {
                if (interests.length > 0) {
                  const newInterests = [...interests];
                  newInterests[newInterests.length - 1] = { ...newInterests[newInterests.length - 1], icon: e.target.value };
                  setFormData({ ...formData, interests: newInterests });
                }
              }}
              className="w-full p-2 bg-steel-900 border border-steel-600 rounded-lg text-white"
            >
              <option value="Printer">Printer</option>
              <option value="Code">Code</option>
              <option value="Cpu">Cpu</option>
              <option value="Zap">Zap</option>
              <option value="Bike">Bike</option>
              <option value="Brain">Brain</option>
              <option value="Wrench">Wrench</option>
              <option value="Sparkles">Sparkles</option>
            </select>
          </div>
          <Button
            onClick={() => {
              setFormData({
                ...formData,
                interests: [...interests, { title: '', description: '', icon: 'Code' }]
              });
            }}
            variant="outline"
            className="border-steel-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Interest
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-copper-500 hover:bg-copper-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-steel-600">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generic JSON editor
  return (
    <Card className="bg-steel-800 border-steel-700">
      <CardHeader>
        <CardTitle className="text-white">Edit {content.key}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-steel-200">Content (JSON)</Label>
          <textarea
            value={JSON.stringify(formData, null, 2)}
            onChange={(e) => {
              try {
                setFormData(JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={20}
            className="w-full p-4 bg-steel-900 border border-steel-600 rounded-lg font-mono text-sm text-white resize-y"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-copper-500 hover:bg-copper-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={onCancel} variant="outline" className="border-steel-600">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomepageAdminPage() {
  const [contents, setContents] = useState<HomepageContent[]>([]);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomepageContent | null>(null);
  const [editingArticle, setEditingArticle] = useState<BlogPost | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleFormData, setArticleFormData] = useState<BlogPostCreate>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    published: false,
  });
  const [articlePreview, setArticlePreview] = useState(false);

  useEffect(() => {
    fetchContents();
    fetchArticles();
  }, []);

  const fetchContents = async () => {
    try {
      const data = await homepageService.listAdmin();
      setContents(data);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await blogService.listAdmin({ per_page: 50 });
      setArticles(response.items);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  const handleSave = async (key: string, content: Record<string, any>) => {
    await homepageService.update(key, { content });
    await fetchContents();
    setEditing(null);
  };

  const handleCreate = async (key: string, defaultContent: Record<string, any>) => {
    try {
      await homepageService.create({ key, content: defaultContent });
      await fetchContents();
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Already exists, just edit it
        const existing = contents.find(c => c.key === key);
        if (existing) {
          setEditing(existing);
        }
      }
    }
  };

  const handleArticleSave = async () => {
    try {
      if (editingArticle) {
        await blogService.update(editingArticle.id, articleFormData);
      } else {
        await blogService.create(articleFormData);
      }
      await fetchArticles();
      setEditingArticle(null);
      setShowArticleForm(false);
      setArticleFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        published: false,
      });
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleArticleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await blogService.delete(id);
      await fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-steel-900 py-12">
        <div className="container mx-auto px-4">
          <p className="text-steel-300 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-steel-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white">CMS</h1>
          <p className="text-steel-300 mt-2">Manage all your content</p>
        </div>

        {editing ? (
          <ContentEditor
            content={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="space-y-4">
            {/* Hero Section */}
            {contents.find(c => c.key === 'hero') ? (
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Hero Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setEditing(contents.find(c => c.key === 'hero')!)}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Hero Section
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Hero Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleCreate('hero', {
                      headline: 'Where Passion Meets Precision',
                      tagline: 'Turning ideas into reality, one layer at a time.',
                      subtitle: 'CAD construction • 3D printing • Manufacturing • Programming • Research'
                    })}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hero Section
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Interests Section */}
            {contents.find(c => c.key === 'interests') ? (
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setEditing(contents.find(c => c.key === 'interests')!)}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Interests
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-steel-800 border-steel-700">
                <CardHeader>
                  <CardTitle className="text-white">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleCreate('interests', {
                      interests: [
                        { title: '3D Printing', description: 'Design and manufacturing with precision', icon: 'Printer' },
                        { title: 'Programming', description: 'Building solutions through code', icon: 'Code' },
                        { title: 'Electronics', description: 'Microcontrollers and circuit design', icon: 'Cpu' },
                        { title: 'FPV Drones', description: 'High-speed aerial innovation', icon: 'Zap' },
                        { title: 'Motorcycles', description: 'Engineering meets adventure', icon: 'Bike' },
                        { title: 'AI Development', description: 'Exploring intelligent systems', icon: 'Brain' },
                        { title: 'CNC Machining', description: 'Precision manufacturing', icon: 'Wrench' },
                        { title: 'Laser Engraving', description: 'Art meets technology', icon: 'Sparkles' }
                      ]
                    })}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Interests Section
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Content/Articles Section */}
            <Card className="bg-steel-800 border-steel-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Content & Articles</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingArticle(null);
                      setShowArticleForm(true);
                      setArticleFormData({
                        title: '',
                        slug: '',
                        content: '',
                        excerpt: '',
                        featured_image: '',
                        published: false,
                      });
                    }}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <p className="text-steel-300 text-center py-4">No articles yet. Create your first one!</p>
                ) : (
                  <div className="space-y-2">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-3 bg-steel-900 rounded-lg border border-steel-700"
                      >
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{article.title}</h4>
                          <p className="text-steel-400 text-sm">
                            {article.published ? 'Published' : 'Draft'} • {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingArticle(article);
                              setArticleFormData({
                                title: article.title,
                                slug: article.slug,
                                content: article.content,
                                excerpt: article.excerpt || '',
                                featured_image: article.featured_image || '',
                                published: article.published,
                              });
                              setShowArticleForm(true);
                            }}
                            className="border-steel-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleArticleDelete(article.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Article Editor */}
        {showArticleForm && (
          <Card className="bg-steel-800 border-steel-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">
                {editingArticle ? 'Edit Article' : 'New Article'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-steel-200">Title</Label>
                <Input
                  value={articleFormData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setArticleFormData({ ...articleFormData, title: e.target.value });
                    if (!editingArticle) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setArticleFormData(prev => ({ ...prev, slug }));
                    }
                  }}
                  className="bg-steel-900 border-steel-600 text-white"
                />
              </div>
              <div>
                <Label className="text-steel-200">Slug</Label>
                <Input
                  value={articleFormData.slug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArticleFormData({ ...articleFormData, slug: e.target.value })}
                  className="bg-steel-900 border-steel-600 text-white"
                />
              </div>
              <div>
                <Label className="text-steel-200">Excerpt</Label>
                <Input
                  value={articleFormData.excerpt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArticleFormData({ ...articleFormData, excerpt: e.target.value })}
                  className="bg-steel-900 border-steel-600 text-white"
                />
              </div>
              <div>
                <Label className="text-steel-200">Featured Image URL</Label>
                <Input
                  value={articleFormData.featured_image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArticleFormData({ ...articleFormData, featured_image: e.target.value })}
                  className="bg-steel-900 border-steel-600 text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-steel-200">Content (Markdown/HTML)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setArticlePreview(!articlePreview)}
                    className="border-steel-600"
                  >
                    {articlePreview ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {articlePreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
                {articlePreview ? (
                  <div className="min-h-[400px] p-4 bg-steel-900 rounded-lg border border-steel-700">
                    <MarkdownRenderer content={articleFormData.content} />
                  </div>
                ) : (
                  <textarea
                    value={articleFormData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                    rows={20}
                    className="w-full p-4 bg-steel-900 border border-steel-600 rounded-lg text-sm text-white font-mono resize-y"
                    placeholder="Write your content here... Supports Markdown and HTML (including charts)"
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={articleFormData.published}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArticleFormData({ ...articleFormData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-steel-600"
                />
                <Label htmlFor="published" className="text-steel-200">Publish</Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleArticleSave}
                  className="bg-copper-500 hover:bg-copper-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Article
                </Button>
                <Button
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingArticle(null);
                    setArticleFormData({
                      title: '',
                      slug: '',
                      content: '',
                      excerpt: '',
                      featured_image: '',
                      published: false,
                    });
                  }}
                  variant="outline"
                  className="border-steel-600"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

