import { addMpBrowseHistory, addMpFavorite, getMpArticleDetail, removeMpFavorite, reportMpBehavior } from '../../api/mp'
import { ArticleDetail } from '../../types/blog'

interface DetailData {
  nightMode: boolean
  loading: boolean
  article: ArticleDetail | null
  contentHtml: string
  favoriteLoading: boolean
  articleReadTime: number
  articleWordCount: number
  enterAt: number
}

Page<DetailData, Record<string, any>>({
  data: {
    nightMode: false,
    loading: false,
    article: null,
    contentHtml: '',
    favoriteLoading: false,
    articleReadTime: 0,
    articleWordCount: 0,
    enterAt: 0,
  },

  onLoad(query) {
    const id = Number(query.id || 0)
    if (!id) {
      wx.showToast({ title: '文章参数错误', icon: 'none' })
      return
    }
    this.setData({ enterAt: Date.now() })
    void this.fetchDetail(id)
  },

  onUnload() {
    void this.reportStay()
  },

  async fetchDetail(id: number) {
    this.setData({ loading: true })
    try {
      const article = await getMpArticleDetail(id)

      // 后端统一渲染，contentHtml 优先于 content
      const html = article.contentHtml || article.content || ''

      // 移除 HTML 标签后统计纯文本字数
      const plainText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, '')
      const wordCount = plainText.length
      const readTime = Math.max(1, Math.ceil(wordCount / 400))

      this.setData({
        article,
        contentHtml: html,
        articleReadTime: readTime,
        articleWordCount: wordCount,
      })

      wx.setNavigationBarTitle({ title: article.title || '文章详情' })
      void reportMpBehavior({
        articleId: id,
        eventType: 'view',
        scene: 'detail',
      })
      void addMpBrowseHistory(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : '文章加载失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goToArticle(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    if (!id) return
    wx.redirectTo({ url: `/pages/article-detail/index?id=${id}` })
  },

  async toggleFavorite() {
    const article = this.data.article
    if (!article || this.data.favoriteLoading) return

    this.setData({ favoriteLoading: true })
    try {
      if (article.isFavorited) {
        await removeMpFavorite(article.id)
        this.setData({
          article: { ...article, isFavorited: false },
        })
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        await addMpFavorite(article.id)
        this.setData({
          article: { ...article, isFavorited: true },
        })
        wx.showToast({ title: '收藏成功', icon: 'success' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ favoriteLoading: false })
    }
  },

  async reportStay() {
    const article = this.data.article
    if (!article || this.data.enterAt <= 0) return
    const staySeconds = Math.floor((Date.now() - this.data.enterAt) / 1000)
    if (staySeconds < 3) return
    try {
      await reportMpBehavior({
        articleId: article.id,
        eventType: 'stay',
        staySeconds,
        scene: 'detail',
      })
    } catch (error) {
      console.error(error)
    }
  },

  onShareAppMessage() {
    const article = this.data.article
    if (!article) {
      return {
        title: '文章详情',
        path: '/pages/article-detail/index',
      }
    }
    return {
      title: article.title,
      path: `/pages/article-detail/index?id=${article.id}&share=1`,
      imageUrl: article.coverUrl || 'https://picsum.photos/seed/sanmoo-share/500/300',
    }
  },

  onShareTimeline() {
    const article = this.data.article
    if (!article) {
      return {
        title: '文章详情',
      }
    }
    return {
      title: article.title,
      imageUrl: article.coverUrl || 'https://picsum.photos/seed/sanmoo-share/500/300',
    }
  },
})
