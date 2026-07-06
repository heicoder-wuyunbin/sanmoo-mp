/**
 * 文章相关 API（列表、详情、推荐、归档）
 */
import { request } from './request'
import { ArticleListData, ArticleDetail } from '../types/blog'

export function getMpArticles(
  page: number,
  size: number,
  keyword?: string,
): Promise<ArticleListData> {
  const data: Record<string, any> = { page, size }
  if (keyword && keyword.trim()) {
    data.keyword = keyword.trim()
  }
  return request<ArticleListData>('/mp/articles', 'GET', data)
}

export function getMpArticleDetail(articleId: number): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/mp/articles/${articleId}`, 'GET', undefined, {
    requireOpenid: true,
  })
}

export function getMpRecommendations(
  size: number,
  articleId?: number,
): Promise<ArticleListData & { strategy?: string }> {
  const data: Record<string, any> = { size }
  if (articleId !== undefined && articleId !== null) {
    data.articleId = articleId
  }
  return request<ArticleListData & { strategy?: string }>(
    '/mp/recommendations',
    'GET',
    data,
    { requireOpenid: true },
  )
}

export function getMpCategoryArticles(
  categoryId: number,
  page: number,
  size: number,
): Promise<ArticleListData> {
  return request<ArticleListData>(`/mp/categories/${categoryId}/articles`, 'GET', {
    page,
    size,
  })
}

export function getMpTagArticles(
  tagId: number,
  page: number,
  size: number,
): Promise<ArticleListData> {
  return request<ArticleListData>(`/mp/tags/${tagId}/articles`, 'GET', { page, size })
}
