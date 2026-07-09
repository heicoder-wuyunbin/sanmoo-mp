import { clearMpBrowseHistory, getMpBrowseHistory } from '../../api/mp'
import { backTopBehavior } from '../../behaviors/back-top'
import { createPaginationBehavior } from '../../behaviors/pagination'
import { navigateToArticleDetail } from '../../utils/helpers'
import { syncNightModeToPage } from '../../utils/night-mode'
import { Article } from '../../types/blog'

interface HistoryData {
  nightMode: boolean
  isEmpty: boolean
  showBackTop: boolean
  list: Article[]
  page: number
  size: number
  total: number
  loading: boolean
}

const paginationBehavior = createPaginationBehavior<Article>({
  pageSize: 20,
  listKey: 'list',
  defaultErrorMessage: '历史记录加载失败',
})

Page<HistoryData>({
  behaviors: [backTopBehavior, paginationBehavior],

  data: {
    nightMode: false,
    isEmpty: false,
  },

  onLoad() {
    void this.reload()
  },

  onShow() {
    syncNightModeToPage(this)
  },

  onPullDownRefresh() {
    void this.reload().finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    void this.loadMore()
  },

  async _loadPage(page: number) {
    try {
      const out = await getMpBrowseHistory(page, this.data.size)
      this.setData({ isEmpty: page === 1 && (out.list || []).length === 0 })
      return out
    } catch (error) {
      this._handleError(error, '历史记录加载失败')
      return { list: [], page, size: this.data.size, total: this.data.total }
    }
  },

  onArticleTap(e: WechatMiniprogram.CustomEvent<{ id: number }>) {
    navigateToArticleDetail(e.detail.id)
  },

  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有阅读记录吗？此操作不可恢复。',
      success: async (res) => {
        if (!res.confirm) return
        wx.showLoading({ title: '清空中...', mask: true })
        try {
          await clearMpBrowseHistory()
          this.setData({ list: [], total: 0, page: 1, isEmpty: true })
          wx.hideLoading()
          wx.showToast({ title: '已清空历史', icon: 'success' })
        } catch (error) {
          wx.hideLoading()
          console.error('清空历史失败:', error)
          wx.showToast({ title: '清空失败，请重试', icon: 'none' })
        }
      },
    })
  },

  onShareAppMessage() {
    return { title: '阅读记录', path: '/pages/history/index' }
  },
})
