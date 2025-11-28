import { useEffect, useState } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import {
  getHomepageContentByKey,
  updateHomepageContent,
  HeroContent,
  InterestsContent,
  InterestItem
} from '../services/homepage'

type Tab = 'hero' | 'interests'

export default function HomepageAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hero')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Hero state
  const [hero, setHero] = useState<HeroContent>({
    headline: '',
    tagline: '',
    subtitle: '',
  })

  // Interests state
  const [interests, setInterests] = useState<InterestItem[]>([])

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    setIsLoading(true)
    try {
      const [heroData, interestsData] = await Promise.all([
        getHomepageContentByKey('hero'),
        getHomepageContentByKey('interests'),
      ])

      setHero(heroData.content as unknown as HeroContent)
      setInterests((interestsData.content as unknown as InterestsContent).interests)
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

  async function handleSaveInterests() {
    setIsSaving(true)
    setMessage(null)
    try {
      await updateHomepageContent('interests', { interests })
      setMessage({ type: 'success', text: 'Interests saved successfully!' })
    } catch (error) {
      console.error('Failed to save interests:', error)
      setMessage({ type: 'error', text: 'Failed to save interests' })
    } finally {
      setIsSaving(false)
    }
  }

  function updateInterest(index: number, field: keyof InterestItem, value: string) {
    setInterests(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-copper-400"></div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Homepage Admin</h1>
          <p className="text-steel-400">Manage your homepage content</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'hero'
                ? 'bg-copper-400 text-steel-900'
                : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
            }`}
          >
            Hero Section
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'interests'
                ? 'bg-copper-400 text-steel-900'
                : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
            }`}
          >
            Interests
          </button>
        </div>

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="bg-steel-800/50 border border-steel-700 rounded-xl p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={hero.headline}
                  onChange={(e) => setHero(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={hero.tagline}
                  onChange={(e) => setHero(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={hero.subtitle}
                  onChange={(e) => setHero(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
                />
              </div>
              <button
                onClick={handleSaveHero}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-copper-400 text-steel-900 font-semibold rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Hero
              </button>
            </div>
          </div>
        )}

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <div className="bg-steel-800/50 border border-steel-700 rounded-xl p-6">
            <div className="space-y-6">
              {interests.map((interest, index) => (
                <div key={index} className="p-4 bg-steel-900 rounded-lg border border-steel-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-steel-400 mb-1">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={interest.icon}
                        onChange={(e) => updateInterest(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-steel-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={interest.title}
                        onChange={(e) => updateInterest(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-steel-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={interest.description}
                        onChange={(e) => updateInterest(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleSaveInterests}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-copper-400 text-steel-900 font-semibold rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Interests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
