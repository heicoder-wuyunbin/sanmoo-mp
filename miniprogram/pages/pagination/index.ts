import { getMpArticles } from '../../api/mp'
import { Article } from '../../types/blog'

interface ArchiveData {
  month: string
  count: number
  articles: Article[]
}

interface ArchivePageData {
  nightMode: boolean
  years: number[]
  archives: ArchiveData[]
  selectedYear: number
  expandedMonths: Record<string, boolean>
  loading: boolean
}

Page<ArchivePageData, Record<string, any>>({
  data: {
    nightMode: false,
    years: [],
    archives: [],
    selectedYear: new Date().getFullYear(),
    expandedMonths: {},
    loading: false,
  },

  onLoad() {
    void this.fetchArchives()
  },

  async onPullDownRefresh() {
    try {
      await this.fetchArchives()
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  async fetchArchives() {
    this.setData({ loading: true })
    try {
      // 获取所有文章
      const result = await getMpArticles(1, 1000) // 假设最多1000篇文章
      const articles = result.list || []
      
      // 按年份和月份分组
      const groupedArticles = this.groupArticlesByYearMonth(articles)
      
      // 提取年份列表
      const years = Object.keys(groupedArticles).map(Number).sort((a, b) => b - a)
      
      // 生成归档数据
      const archives = this.generateArchives(groupedArticles[this.data.selectedYear])
      
      // 默认展开第一个月份
      const expandedMonths: Record<string, boolean> = {}
      if (archives.length > 0) {
        expandedMonths[archives[0].month] = true
      }
      
      this.setData({
        years,
        archives,
        expandedMonths,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '归档加载失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  groupArticlesByYearMonth(articles: Article[]) {
    return articles.reduce((groups, article) => {
      if (!article.createTime) return groups
      
      const year = article.createTime.slice(0, 4)
      const month = article.createTime.slice(5, 7)
      
      if (!groups[year]) {
        groups[year] = {}
      }
      
      if (!groups[year][month]) {
        groups[year][month] = []
      }
      
      groups[year][month].push(article)
      return groups
    }, {} as Record<string, Record<string, Article[]>>)
  },

  // parseDate 解析日期字符串，兼容 iOS
  parseDate(dateStr: string): Date {
    // 替换空格为 T，使其符合 ISO 格式
    const isoDateStr = dateStr.replace(' ', 'T')
    return new Date(isoDateStr)
  },

  generateArchives(monthlyArticles: Record<string, Article[]> = {}) {
    return Object.entries(monthlyArticles)
      .map(([month, articles]) => ({
        month,
        count: articles.length,
        articles: articles.sort((a, b) => {
          return this.parseDate(b.createTime).getTime() - this.parseDate(a.createTime).getTime()
        }),
      }))
      .sort((a, b) => Number(b.month) - Number(a.month))
  },

  async selectYear(event: WechatMiniprogram.BaseEvent) {
    const { year } = event.currentTarget.dataset as { year: number }
    if (year === this.data.selectedYear) {
      return
    }
    
    this.setData({ selectedYear: year, loading: true })
    
    try {
      // 获取所有文章
      const result = await getMpArticles(1, 1000)
      const articles = result.list || []
      
      // 按年份和月份分组
      const groupedArticles = this.groupArticlesByYearMonth(articles)
      
      // 生成归档数据
      const archives = this.generateArchives(groupedArticles[year])
      
      // 默认展开第一个月份
      const expandedMonths: Record<string, boolean> = {}
      if (archives.length > 0) {
        expandedMonths[archives[0].month] = true
      }
      
      this.setData({ archives, expandedMonths })
    } catch (error) {
      const message = error instanceof Error ? error.message : '年份切换失败'
      wx.showToast({ title: message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  toggleMonth(event: WechatMiniprogram.BaseEvent) {
    const { month } = event.currentTarget.dataset as { month: string }
    const expandedMonths = { ...this.data.expandedMonths }
    expandedMonths[month] = !expandedMonths[month]
    this.setData({ expandedMonths })
  },

  goToArticleDetail(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id: number }
    wx.navigateTo({ url: `/pages/article-detail/index?id=${id}` })
  },

  onShareAppMessage() {
    return {
      title: '文章归档',
      path: '/pages/pagination/index',
    }
  },
})
