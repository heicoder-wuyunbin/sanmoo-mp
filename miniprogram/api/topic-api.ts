/**
 * 专题 API
 */
import { request } from './request'
import { ArticleListData, Topic } from '../types/blog'

export function getMpTopics(
  page = 1,
  size = 20,
): Promise<{ list: Topic[]; total: number; page: number; size: number }> {
  return request<{ list: Topic[]; total: number; page: number; size: number }>(
    '/mp/topics',
    'GET',
    { page, size },
  )
}

export function getMpTopicDetail(topicId: number): Promise<{ topic: Topic }> {
  return request<{ topic: Topic }>(`/mp/topics/${topicId}`, 'GET')
}

export function getMpTopicArticles(
  topicId: number,
  page = 1,
  size = 20,
): Promise<ArticleListData> {
  return request<ArticleListData>(`/mp/topics/${topicId}/articles`, 'GET', { page, size })
}
