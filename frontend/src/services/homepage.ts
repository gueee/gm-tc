import api from './api'

// Types
export interface HomepageContent {
  id: string
  key: string
  content: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HeroContent {
  headline: string
  tagline: string
  subtitle: string
}

export interface InterestItem {
  icon: string
  title: string
  description: string
}

export interface InterestsContent {
  interests: InterestItem[]
}

// API functions
export async function getHomepageContent(): Promise<HomepageContent[]> {
  const response = await api.get<HomepageContent[]>('/homepage/content')
  return response.data
}

export async function getHomepageContentByKey(key: string): Promise<HomepageContent> {
  const response = await api.get<HomepageContent>(`/homepage/content/${key}`)
  return response.data
}

export async function getHeroContent(): Promise<HeroContent> {
  const response = await api.get<HomepageContent>('/homepage/content/hero')
  return response.data.content as unknown as HeroContent
}

export async function getInterestsContent(): Promise<InterestsContent> {
  const response = await api.get<HomepageContent>('/homepage/content/interests')
  return response.data.content as unknown as InterestsContent
}

// Admin functions
export async function updateHomepageContent(
  key: string,
  content: Record<string, unknown>
): Promise<HomepageContent> {
  const response = await api.put<HomepageContent>(`/homepage/admin/content/${key}`, {
    content,
  })
  return response.data
}

export async function createHomepageContent(
  key: string,
  content: Record<string, unknown>
): Promise<HomepageContent> {
  const response = await api.post<HomepageContent>('/homepage/admin/content', {
    key,
    content,
  })
  return response.data
}
