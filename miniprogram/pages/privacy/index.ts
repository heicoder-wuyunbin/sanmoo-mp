import { getMpCompliance } from '../../api/mp'

interface PrivacyData {
  nightMode: boolean
  loading: boolean
  privacyPolicy: string
  dataRetentionPolicy: string
  accountDeletionGuide: string
}

const parseJson = <T>(str: string): T | null => {
  if (!str) return null
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}

Page<PrivacyData, Record<string, any>>({
  data: {
    nightMode: false,
    loading: true,
    privacyPolicy: '',
    dataRetentionPolicy: '',
    accountDeletionGuide: '',
  },

  onLoad() {
    void this.fetchCompliance()
  },

  async fetchCompliance() {
    this.setData({ loading: true })
    try {
      const res = await getMpCompliance()
      this.setData({
        privacyPolicy: res?.privacyPolicy || '',
        dataRetentionPolicy: res?.dataRetentionPolicy || '',
        accountDeletionGuide: res?.accountDeletionGuide || '',
      })
    } catch (error) {
      console.error('获取合规信息失败:', error)
      this.setData({
        privacyPolicy: '',
        dataRetentionPolicy: '',
        accountDeletionGuide: '',
      })
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