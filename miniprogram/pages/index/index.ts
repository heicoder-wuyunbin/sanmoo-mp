import {
  getMpArticles,
  getMpRecommendations,
  getMpSettings,
  addMpFavorite,
  getMpTopics,
  getMpCategories,
} from '../../api/mp'
import { Article } from '../../types/blog'
import { swipeBehavior } from '../../behaviors/swipe'
import { backTopBehavior } from '../../behaviors/back-top'
import { createPaginationBehavior } from '../../behaviors/pagination'
import { estimateReadTime } from '../../utils/helpers'

interface IndexData {
  nightMode: boolean
  blogName: string
  introduction: string
  featuredTopics: any[]
  categoriesCount: number
  actionLoadingId: number
  strategy: string
  openedId: number
}

const paginationBehavior = createPaginationBehavior<Article>({
  pageSize: 10,
  listKey: 'articles',
  defaultErrorMessage: '文章加载失败',
})

Page<IndexData, Record<string, any>>({
  behaviors: [swipeBehavior, backTopBehavior, paginationBehavior],

  data: {
    nightMode: false,
    blogName: 'Sanmoo Blog',
    introduction: '技术博客',
    featuredTopics: [],
    categoriesCount: 0,
    actionLoadingId: 0,
    strategy: 'rule',
    openedId: 0,
  },

  onLoad() {
    void this.initializePage()
  },

  async onPullDownRefresh() {
    try {
      await this.initializePage()
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  onReachBottom() {
    void this.loadMore()
  },

  async initializePage() {
    this.setData({ loading: true })
    try {
      const [settings] = await Promise.all([
        getMpSettings(),
        this.reload(),
      ])

      this.loadFeaturedTopics()
      this.loadCategoriesCount()

      this.setData({
        blogName: settings.coreConfig?.blogName || 'Sanmoo Blog',
        introduction: settings.coreConfig?.introduction || '深度技术内容，系统学习路径',
      })
    } catch (error) {
      console.error('initializePage错误:', error)
      this._handleError(error, '加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  async _loadPage(page: number) {
    if (page === 1) {
      try {
        const result = await getMpRecommendations(this.data.size)
        if (result?.strategy) {
          this.setData({ strategy: result.strategy })
        }
        return result
      } catch (error) {
        console.error('推荐接口异常，降级到最新文章列表:', error)
      }
    }
    return getMpArticles(page, this.data.size)
  },

  async loadFeaturedTopics() {
    try {
      const out = await getMpTopics(1, 10)
      this.setData({ featuredTopics: out.list || [] })
    } catch (error) {
      console.error(error)
    }
  },

  async loadCategoriesCount() {
    try {
      const out = await getMpCategories()
      if (out?.list) {
        this.setData({ categoriesCount: out.list.length })
      }
    } catch (error) {
      console.error(error)
    }
  },

  estimateReadTime,

  goToArticleDetail(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    if (!id) return
    if (this.data.openedId === id) {
      this.setData({ openedId: 0 })
      return
    }
    wx.navigateTo({ url: `/pages/article-detail/index?id=${id}` })
  },

  async addFavorite(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    if (!id || this.data.actionLoadingId) return
    this.setData({ actionLoadingId: id })
    try {
      await addMpFavorite(id)
      this.setData({ openedId: 0 })
      wx.showToast({ title: '收藏成功', icon: 'none' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '收藏失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ actionLoadingId: 0 })
    }
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/index' })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  goToTopics() {
    wx.switchTab({ url: '/pages/topics/index' })
  },

  goToTopicDetail(event: WechatMiniprogram.BaseEvent) {
    const { id, title } = event.currentTarget.dataset as { id: string; title: string }
    if (!id || !title) return
    wx.navigateTo({
      url: `/pages/topic-detail/index?id=${id}&title=${encodeURIComponent(title)}`,
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.blogName,
      path: '/pages/index/index?share=1',
      imageUrl: 'https://picsum.photos/seed/sanmoo-home/500/300',
    }
  },

  onShareTimeline() {
    return {
      title: this.data.blogName,
      imageUrl: 'https://picsum.photos/seed/sanmoo-home/500/300',
    }
  },
})
