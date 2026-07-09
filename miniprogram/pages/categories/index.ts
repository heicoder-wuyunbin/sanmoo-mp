import { getMpCategories, getMpCategoryArticles } from '../../api/mp'
import { Category, Article } from '../../types/blog'
import { backTopBehavior } from '../../behaviors/back-top'
import { navigateToArticleDetail } from '../../utils/helpers'

interface CategoriesData {
  nightMode: boolean
  categories: Category[]
  articles: Article[]
  selectedCategoryId: number | null
  loading: boolean
  touchStartX: number
  touchEndX: number
  showBackTop: boolean
}

Page<CategoriesData, Record<string, any>>({
  behaviors: [backTopBehavior],

  data: {
    nightMode: false,
    categories: [],
    articles: [],
    selectedCategoryId: null,
    loading: false,
    touchStartX: 0,
    touchEndX: 0,
  },

  onTouchStart(event: WechatMiniprogram.TouchEvent) {
    this.setData({ touchStartX: event.touches[0].clientX })
  },

  onTouchEnd(event: WechatMiniprogram.TouchEvent) {
    this.setData({ touchEndX: event.changedTouches[0].clientX })
    this.handleSwipe()
  },

  handleSwipe() {
    const { touchStartX, touchEndX, categories, selectedCategoryId } = this.data
    const diff = touchStartX - touchEndX
    if (Math.abs(diff) < 30) return

    const currentIndex = categories.findIndex(cat => cat.id === selectedCategoryId)
    if (currentIndex === -1) return

    let newIndex: number
    if (diff > 0) {
      newIndex = (currentIndex + 1) % categories.length
    } else {
      newIndex = (currentIndex - 1 + categories.length) % categories.length
    }

    const newCategory = categories[newIndex]
    if (newCategory) {
      this.selectCategory({ currentTarget: { dataset: { id: newCategory.id, name: newCategory.name } } } as any)
    }
  },

  onLoad() {
    void this.fetchCategories()
  },

  async onPullDownRefresh() {
    try {
      if (this.data.selectedCategoryId) {
        await this.fetchArticles(this.data.selectedCategoryId)
      } else {
        await this.fetchCategories()
      }
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  async fetchCategories() {
    this.setData({ loading: true })
    try {
      const categoryData = await getMpCategories()
      const categories = categoryData.list || []
      this.setData({ categories })
      if (categories.length > 0) {
        this.selectCategory({ currentTarget: { dataset: { id: categories[0].id, name: categories[0].name } } } as any)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '分类加载失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async selectCategory(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: string }
    const categoryId = parseInt(id, 10) || 0
    this.setData({ selectedCategoryId: categoryId })
    await this.fetchArticles(categoryId)
  },

  async fetchArticles(categoryId: number) {
    this.setData({ loading: true })
    try {
      const articleData = await getMpCategoryArticles(categoryId, 1, 10)
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
    return { title: '文章分类', path: '/pages/categories/index' }
  },
})
