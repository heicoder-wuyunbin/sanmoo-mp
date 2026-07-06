/**
 * 收藏与浏览历史 API
 */
import { request } from './request'
import { ArticleListData } from '../types/blog'

// ─── 收藏 ────────────────────────────────────────────────────

export function addMpFavorite(articleId: number): Promise<Record<string, never>> {
  return request<Record<string, never>>(`/mp/favorites/${articleId}`, 'POST', undefined, {
    requireOpenid: true,
  })
}

export function removeMpFavorite(articleId: number): Promise<Record<string, never>> {
  return request<Record<string, never>>(`/mp/favorites/${articleId}`, 'DELETE', undefined, {
    requireOpenid: true,
  })
}

export function getMpFavoriteStatus(articleId: number): Promise<{ isFavorited: boolean }> {
  return request<{ isFavorited: boolean }>(
    `/mp/favorites/${articleId}/status`,
    'GET',
    undefined,
    { requireOpenid: true },
  )
}

export function getMpFavorites(page: number, size: number): Promise<ArticleListData> {
  return request<ArticleListData>(
    '/mp/favorites',
    'GET',
    { page, size },
    { requireOpenid: true },
  )
}

// ─── 浏览历史 ────────────────────────────────────────────────

export function addMpBrowseHistory(articleId: number): Promise<Record<string, never>> {
  return request<Record<string, never>>(`/mp/history/${articleId}`, 'POST', undefined, {
    requireOpenid: true,
  })
}

export function getMpBrowseHistory(page: number, size: number): Promise<ArticleListData> {
  return request<ArticleListData>(
    '/mp/history',
    'GET',
    { page, size },
    { requireOpenid: true },
  )
}

export function clearMpBrowseHistory(): Promise<Record<string, never>> {
  return request<Record<string, never>>('/mp/history', 'DELETE', undefined, {
    requireOpenid: true,
  })
}
