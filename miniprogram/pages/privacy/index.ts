import { request } from '../../api/request'

interface PrivacyData {
  nightMode: boolean
  loading: boolean
  content: string
}

Page<PrivacyData, Record<string, any>>({
  data: {
    nightMode: false,
    loading: true,
    content: '',
  },

  onLoad() {
    void this.fetchPrivacyPolicy()
  },

  async fetchPrivacyPolicy() {
    this.setData({ loading: true })
    try {
      const res = await request<{ content: string }>('/mp/privacy-policy', 'GET')
      this.setData({ content: res?.content || '' })
    } catch (error) {
      console.error('获取隐私政策失败:', error)
      this.setData({ content: '' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onShareAppMessage() {
    return {
      title: '隐私政策',
      path: '/pages/privacy/index',
    }
  },
})