import { getMpTags, getMpTagArticles } from '../../api/mp'
import { Tag, Article } from '../../types/blog'
import { backTopBehavior } from '../../behaviors/back-top'
import { navigateToArticleDetail } from '../../utils/helpers'

interface TagsData {
  tags: Tag[]
  articles: Article[]
  selectedTagId: number | null
  loading: boolean
  nightMode: boolean
  showBackTop: boolean
}

Page<TagsData, Record<string, any>>({
  behaviors: [backTopBehavior],

  data: {
    tags: [],
    articles: [],
    selectedTagId: null,
    loading: false,
    nightMode: false,
  },

  onLoad() {
    void this.fetchTags()
  },

  async onPullDownRefresh() {
    try {
      if (this.data.selectedTagId) {
        await this.fetchArticles(this.data.selectedTagId)
      } else {
        await this.fetchTags()
      }
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  async fetchTags() {
    this.setData({ loading: true })
    try {
      const tagData = await getMpTags()
      const tags = tagData.list || []
      this.setData({ tags })
      if (tags.length > 0) {
        this.selectTag({ currentTarget: { dataset: { id: tags[0].id, name: tags[0].name } } } as any)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '标签加载失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async selectTag(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    this.setData({ selectedTagId: id })
    await this.fetchArticles(id)
  },

  async fetchArticles(tagId: number) {
    this.setData({ loading: true })
    try {
      const articleData = await getMpTagArticles(tagId, 1, 10)
      this.setData({ articles: articleData.list || [] })
    } catch (error) {
      const message = error instanceof Error ? error.message : '文章加载失败'
      wx.showToast({ title: message, icon: 'none' })
      this.setData({ articles: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  onArticleTap(e: WechatMiniprogram.CustomEvent<{ id: number }>) {
    navigateToArticleDetail(e.detail.id)
  },

  onShareAppMessage() {
    return { title: '文章标签', path: '/pages/tags/index' }
  },
})
