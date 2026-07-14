// miniprogram/pages/about/index.ts
import { getMpCompliance } from '../../api/mp'

interface FilingInfo {
  icpCode: string
  filingUrl: string
  recordType: string
}

interface ContactInfo {
  email: string
  wechat: string
  github: string
}

interface AboutData {
  nightMode: boolean
  authorInfo: {
    name: string
    title: string
    introduction: string
    avatar: string
  }
  blogInfo: {
    name: string
    description: string
  }
  filingInfo: FilingInfo | null
  contactInfo: ContactInfo | null
}

const parseJson = <T>(str: string): T | null => {
  if (!str) return null
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}

Page<AboutData, Record<string, any>>({
  data: {
    nightMode: false,
    authorInfo: {
      name: 'wuyunbin',
      title: '后端工程师',
      introduction: '专注后端工程实践，持续记录架构、数据库与服务治理经验',
      avatar: 'https://github.com/heicoder-wuyunbin.png'
    },
    blogInfo: {
      name: 'Sanmoo Blog',
      description: '后端艺术 (BackendArt) - 探索技术，记录成长'
    },
    filingInfo: null,
    contactInfo: null
  },

  onLoad() {
    void this.fetchCompliance()
  },

  async fetchCompliance() {
    try {
      const res = await getMpCompliance()
      if (res?.filingInfo) {
        this.setData({ filingInfo: parseJson<FilingInfo>(res.filingInfo) })
      }
      if (res?.contactInfo) {
        this.setData({ contactInfo: parseJson<ContactInfo>(res.contactInfo) })
      }
    } catch (error) {
      console.error('获取合规信息失败:', error)
    }
  },

  copyWechat() {
    const wechat = this.data.contactInfo?.wechat || 'SanmooBlog'
    this.copyToClipboard(wechat, '微信号已复制')
  },

  goToGithub() {
    const github = this.data.contactInfo?.github || 'heicoder-wuyunbin'
    this.copyToClipboard(`https://github.com/${github}`, 'GitHub 链接已复制')
  },

  goToCSDN() {
    this.copyToClipboard('https://backendart.com', '博客地址已复制')
  },

  copyToClipboard(data: string, title: string) {
    wx.setClipboardData({
      data,
      success: () => {
        wx.showToast({
          title,
          icon: 'success'
        })
      }
    })
  },
});
