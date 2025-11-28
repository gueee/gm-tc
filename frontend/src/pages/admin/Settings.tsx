import { useEffect, useState } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import {
  getHomepageContentByKey,
  updateHomepageContent,
  HeroContent,
} from '../../services/homepage'

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [hero, setHero] = useState<HeroContent>({
    headline: '',
    tagline: '',
    subtitle: '',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    setIsLoading(true)
    try {
      const heroData = await getHomepageContentByKey('hero')
      setHero(heroData.content as unknown as HeroContent)
    } catch (error) {
      console.error('Failed to fetch content:', error)
      setMessage({ type: 'error', text: 'Failed to load content' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveHero() {
    setIsSaving(true)
    setMessage(null)
    try {
      await updateHomepageContent('hero', hero as unknown as Record<string, unknown>)
      setMessage({ type: 'success', text: 'Hero content saved successfully!' })
    } catch (error) {
      console.error('Failed to save hero:', error)
      setMessage({ type: 'error', text: 'Failed to save hero content' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-steel-400">Manage your homepage hero section</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-steel-800 border border-steel-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Hero Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Headline</label>
            <input
              type="text"
              value={hero.headline}
              onChange={(e) => setHero((prev) => ({ ...prev, headline: e.target.value }))}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Main headline..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Tagline</label>
            <input
              type="text"
              value={hero.tagline}
              onChange={(e) => setHero((prev) => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Short tagline..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Subtitle</label>
            <textarea
              value={hero.subtitle}
              onChange={(e) => setHero((prev) => ({ ...prev, subtitle: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-none"
              placeholder="Longer description..."
            />
          </div>
          <button
            onClick={handleSaveHero}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-copper-400 text-steel-900 font-semibold rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}



