/**
 * 用户资料、行为上报、设置、搜索 API
 */
import { request } from './request'
import { BlogSettingsData } from '../types/blog'

// ─── 设置 ────────────────────────────────────────────────────

export function getMpSettings(): Promise<BlogSettingsData> {
  return request<BlogSettingsData>('/mp/settings', 'GET')
}

// ─── 搜索 ────────────────────────────────────────────────────

export function getMpHotSearches(): Promise<string[]> {
  return request<string[]>('/mp/search/hot', 'GET')
}

// ─── 用户行为上报 ────────────────────────────────────────────

export function reportMpBehavior(data: {
  articleId: number
  eventType: string
  staySeconds?: number
  scene?: string
  strategy?: string
}): Promise<Record<string, never>> {
  return request<Record<string, never>>(
    '/mp/behavior',
    'POST',
    {
      articleId: data.articleId,
      eventType: data.eventType,
      staySeconds: data.staySeconds || 0,
      scene: data.scene || 'detail',
      strategy: data.strategy || '',
    },
    { requireOpenid: true, hideToast: true },
  )
}

// ─── 用户资料 ────────────────────────────────────────────────

export interface MpUserProfile {
  avatarUrl: string
  nickName: string
}

interface MpUserProfileRaw {
  avatar?: string
  nickname?: string
}

export async function getMpUserProfile(): Promise<MpUserProfile> {
  const raw = await request<MpUserProfileRaw>(
    '/mp/user/profile',
    'GET',
    undefined,
    { requireOpenid: true },
  )
  return {
    avatarUrl: raw?.avatar || '',
    nickName: raw?.nickname || '',
  }
}

export function updateMpUserProfile(profile: MpUserProfile): Promise<Record<string, never>> {
  return request<Record<string, never>>(
    '/mp/user/profile',
    'POST',
    {
      avatarUrl: profile.avatarUrl,
      nickName: profile.nickName,
    },
    { requireOpenid: true },
  )
}

export function setMpSubscribe(subscribe: boolean): Promise<{ subscribe: boolean }> {
  return request<{ subscribe: boolean }>(
    '/mp/subscribe',
    'POST',
    { subscribe },
    { requireOpenid: true },
  )
}

export function getMpSubscribeStatus(): Promise<{ subscribe: boolean }> {
  return request<{ subscribe: boolean }>(
    '/mp/subscribe/status',
    'GET',
    undefined,
    { requireOpenid: true },
  )
}
