/**
 * 分类与标签 API
 */
import { request } from './request'
import { CategoryListData, TagListData } from '../types/blog'

export function getMpCategories(): Promise<CategoryListData> {
  return request<CategoryListData>('/mp/categories', 'GET')
}

export function getMpTags(): Promise<TagListData> {
  return request<TagListData>('/mp/tags', 'GET')
}
