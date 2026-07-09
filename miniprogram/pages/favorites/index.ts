import { getMpFavorites, removeMpFavorite } from '../../api/mp'
import { Article } from '../../types/blog'
import { swipeBehavior } from '../../behaviors/swipe'
import { backTopBehavior } from '../../behaviors/back-top'
import { createPaginationBehavior } from '../../behaviors/pagination'
import { navigateToArticleDetail } from '../../utils/helpers'

interface FavoritesData {
  nightMode: boolean
  actionLoadingId: number
  openedId: number
}

const paginationBehavior = createPaginationBehavior<Article>({
  pageSize: 10,
  listKey: 'list',
  defaultErrorMessage: '书签列表加载失败',
})

Page<FavoritesData, Record<string, any>>({
  behaviors: [swipeBehavior, backTopBehavior, paginationBehavior],

  data: {
    nightMode: false,
    actionLoadingId: 0,
  },

  onLoad() {
    void this.reload()
  },

  async onPullDownRefresh() {
    try {
      await this.reload()
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  onReachBottom() {
    void this.loadMore()
  },

  async _loadPage(page: number) {
    const out = await getMpFavorites(page, this.data.size)
    return out
  },

  goToArticleDetail(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    if (!id) return
    if (this.data.openedId === id) {
      this.setData({ openedId: 0 })
      return
    }
    navigateToArticleDetail(id)
  },

  async removeFavorite(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    if (!id || this.data.actionLoadingId) return
    this.setData({ actionLoadingId: id })
    try {
      await removeMpFavorite(id)
      const list = this.data.list.filter((item: Article) => item.id !== id)
      this.setData({
        list,
        total: Math.max(0, this.data.total - 1),
        openedId: 0,
      })
      wx.showToast({ title: '已移除书签', icon: 'none' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '移除书签失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ actionLoadingId: 0 })
    }
  },

  onShareAppMessage() {
    return {
      title: '我的书签',
      path: '/pages/favorites/index',
    }
  },
})
