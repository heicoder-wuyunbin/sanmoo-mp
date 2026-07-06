/**
 * 通用工具函数
 * 与页面无关的纯函数集合。
 */

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(input: string): string {
  if (!input) return ''
  const normalized = input.replace(/-/g, '/')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return input
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 估算阅读时间（基于文本字符数）
 * 中文平均 300-500 字/分钟，取 400 为基准。
 */
export function estimateReadTime(text: string | undefined | null): string {
  if (!text) return '1 分钟'
  const charCount = text.replace(/\s/g, '').length
  const minutes = Math.max(1, Math.ceil(charCount / 400))
  return `${minutes} 分钟`
}

/**
 * 跳转到文章详情页
 */
export function navigateToArticleDetail(articleId: number): void {
  if (!articleId) return
  wx.navigateTo({ url: `/pages/article-detail/index?id=${articleId}` })
}

/**
 * 安全解析 URL 参数（用于 onLoad query）
 */
export function parseQueryId(query: Record<string, string | undefined>, key = 'id'): number {
  return Number(query[key] || 0)
}
