import { getMpTopicArticles, getMpTopicDetail } from '../../api/mp'
import { Article, Topic } from '../../types/blog'
import { backTopBehavior } from '../../behaviors/back-top'
import { navigateToArticleDetail } from '../../utils/helpers'

Page({
  behaviors: [backTopBehavior],

  data: {
    topicId: 0,
    topic: {
      id: 0,
      title: '',
      description: '',
      cover: '',
      articleCount: 0,
      createTime: '',
    } as Topic,
    articles: [] as Article[],
    totalReads: 0,
    loading: true,
  },

  onLoad(options: any) {
    const id = Number(options.id || 0)
    if (!id) {
      wx.showToast({ title: '专题参数错误', icon: 'none' })
      return
    }
    this.setData({ topicId: id })
    let title = options.title || '专题详情'
    try { title = decodeURIComponent(title) } catch (error) { console.error(error) }
    wx.setNavigationBarTitle({ title })
    void this.loadTopicDetail()
    void this.loadArticles()
  },

  async loadTopicDetail() {
    try {
      const result = await getMpTopicDetail(this.data.topicId)
      const topic = result.topic || result
      this.setData({
        topic: {
          id: topic.id || 0,
          title: topic.title || '',
          description: topic.description || '',
          cover: topic.cover || '',
          articleCount: topic.articleCount || 0,
          createTime: topic.createTime || '',
        },
      })
    } catch (error) {
      console.error(error)
      wx.showToast({ title: '加载专题失败', icon: 'none' })
    }
  },

  async loadArticles() {
    this.setData({ loading: true })
    try {
      const out = await getMpTopicArticles(this.data.topicId, 1, 20)
      const articles = out.list || []
      const totalReads = articles.reduce((sum: number, item) => sum + (item.readNum || 0), 0)
      this.setData({ articles, totalReads })
    } catch (error) {
      console.error(error)
      wx.showToast({ title: '加载文章失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onArticleTap(e: WechatMiniprogram.CustomEvent<{ id: number }>) {
    navigateToArticleDetail(e.detail.id)
  },

  onPullDownRefresh() {
    void this.loadTopicDetail()
    void this.loadArticles()
    wx.stopPullDownRefresh()
  },
})
