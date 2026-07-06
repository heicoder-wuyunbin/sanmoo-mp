import { getMpTopics } from '../../api/mp'
import { Topic } from '../../types/blog'

Page({
  data: {
    nightMode: false,
    topics: [] as Topic[],
    loading: true,
    isEmpty: false,
  },

  onLoad() {
    void this.loadTopics()
  },

  async loadTopics() {
    this.setData({ loading: true })
    try {
      const out = await getMpTopics(1, 50)
      const topics = out.list || []
      this.setData({
        topics,
        isEmpty: topics.length === 0,
      })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goToTopicDetail(e: WechatMiniprogram.BaseEvent) {
    const { id } = e.currentTarget.dataset as { id: number }
    const topic = this.data.topics.find((t) => t.id === id)
    if (topic) {
      wx.navigateTo({
        url: `/pages/topic-detail/index?id=${id}&title=${encodeURIComponent(topic.title)}`,
      })
    }
  },

  onPullDownRefresh() {
    void this.loadTopics()
    wx.stopPullDownRefresh()
  },
})
