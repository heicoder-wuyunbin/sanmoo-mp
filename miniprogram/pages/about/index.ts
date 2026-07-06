// miniprogram/pages/about/index.ts
Page({
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
    }
  },

  copyWechat() {
    this.copyToClipboard('SanmooBlog', '微信号已复制')
  },

  goToGithub() {
    this.copyToClipboard('https://github.com/heicoder-wuyunbin', 'GitHub 链接已复制')
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
