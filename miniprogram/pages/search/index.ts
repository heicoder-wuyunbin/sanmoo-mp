import { getMpArticles, getMpHotSearches } from '../../api/mp'
import { STORAGE_KEYS } from '../../api/config'
import { Article } from '../../types/blog'
import { navigateToArticleDetail } from '../../utils/helpers'

Page({
  data: {
    nightMode: false,
    searchKeyword: '',
    searchHistory: [] as string[],
    hotKeywords: [] as string[],
    searchResults: [] as Article[],
    loading: false,
    showResults: false,
    isEmpty: false,
    showBackTop: false,
  },

  onLoad() {
    this.loadSearchHistory()
    this.loadHotSearches()
  },

  async loadHotSearches() {
    try {
      const keywords = await getMpHotSearches()
      this.setData({ hotKeywords: keywords || [] })
    } catch (error) {
      console.error('加载热门搜索失败:', error)
    }
  },

  loadSearchHistory() {
    const history = wx.getStorageSync(STORAGE_KEYS.SEARCH_HISTORY) || []
    this.setData({ searchHistory: history })
  },

  onKeywordChange(e: WechatMiniprogram.Input) {
    const keyword = (e.detail as any).value
    this.setData({ searchKeyword: keyword })
  },

  clearKeyword() {
    this.setData({
      searchKeyword: '',
      showResults: false,
      isEmpty: false,
      loading: false,
      searchResults: [],
    })
    this.loadSearchHistory()
  },

  async search() {
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) return

    this.setData({ loading: true, showResults: true, isEmpty: false })

    try {
      const articles = await getMpArticles(1, 10, keyword)
      const results = articles.list || []
      this.setData({ searchResults: results, isEmpty: results.length === 0 })
      this.addToSearchHistory(keyword)
    } catch (error) {
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  addToSearchHistory(keyword: string) {
    let history: string[] = wx.getStorageSync(STORAGE_KEYS.SEARCH_HISTORY) || []
    history = history.filter((item: string) => item !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync(STORAGE_KEYS.SEARCH_HISTORY, history)
    this.setData({ searchHistory: history })
  },

  clearSearchHistory() {
    wx.removeStorageSync(STORAGE_KEYS.SEARCH_HISTORY)
    this.setData({ searchHistory: [] })
  },

  selectHistory(e: WechatMiniprogram.BaseEvent) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.search()
  },

  selectHotKeyword(e: WechatMiniprogram.BaseEvent) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.search()
  },

  goToArticleDetail(e: WechatMiniprogram.BaseEvent) {
    const articleId = Number(e.currentTarget.dataset.id || 0)
    navigateToArticleDetail(articleId)
  },

  onShareAppMessage() {
    return { title: 'Sanmoo Blog - 技术分享平台', path: '/pages/search/index' }
  },

  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) {
    const show = e.scrollTop > 400
    if (show !== this.data.showBackTop) {
      this.setData({ showBackTop: show })
    }
  },

  scrollToTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 })
  },
})
