import { addMpBrowseHistory, addMpFavorite, getMpArticleDetail, removeMpFavorite } from '../../api/mp'
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
    void this.fetchDetail(id)
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
        wx.showToast({ title: '已移除书签', icon: 'none' })
      } else {
        await addMpFavorite(article.id)
        this.setData({
          article: { ...article, isFavorited: true },
        })
        wx.showToast({ title: '已添加书签', icon: 'success' })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ favoriteLoading: false })
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
