import { ensureMpOpenid, getMpBrowseHistory, getMpFavorites, getMpSettings, getMpUserProfile, updateMpUserProfile, setMpSubscribe, getMpSubscribeStatus, deleteMpUserAccount } from '../../api/mp'
import { STORAGE_KEYS } from '../../api/config'
import { setNightMode } from '../../utils/night-mode'

Page({
  data: {
    nightMode: false,
    blogOwner: '',
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    favoriteCount: 0,
    historyCount: 0,
    hasLogin: false,
    showAuthModal: false,
    tempAvatar: '',
    tempNickname: '',
    isLoadingProfile: false,
    subscribeStatus: false,
  },

  onLoad() {
    void this.loadSettings()
    void this.initializeUser()
  },

  onShow() {
    void this.loadStats()
  },

  async loadSettings() {
    try {
      const settings = await getMpSettings()
      const owner = settings?.coreConfig?.author || ''
      this.setData({ blogOwner: owner })
    } catch (error) {
      console.error(error)
    }
  },

  async initializeUser() {
    try {
      await ensureMpOpenid()
    } catch (error) {
      console.error('获取 openid 失败:', error)
      wx.showToast({ title: '登录失败', icon: 'none' })
      return
    }

    try {
      const profile = await getMpUserProfile()
      const hasAvatar = profile?.avatarUrl?.trim()
      const hasNickname = profile?.nickName?.trim()

      if (hasAvatar && hasNickname) {
        this.commitProfile(profile.avatarUrl, profile.nickName)
      } else {
        this.showAuthModal(profile?.avatarUrl || '', profile?.nickName || '')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.showAuthModal('', '')
    }
  },

  async loadStats() {
    try {
      const [favorites, history, subscribe] = await Promise.allSettled([
        getMpFavorites(1, 1),
        getMpBrowseHistory(1, 1),
        getMpSubscribeStatus(),
      ])
      if (favorites.status === 'fulfilled') {
        this.setData({ favoriteCount: favorites.value?.total || 0 })
      }
      if (history.status === 'fulfilled') {
        this.setData({ historyCount: history.value?.total || 0 })
      }
      if (subscribe.status === 'fulfilled') {
        this.setData({ subscribeStatus: subscribe.value?.subscribe || false })
      }
    } catch (error) {
      console.error(error)
    }
  },

  async toggleSubscribe(e?: WechatMiniprogram.SwitchChange) {
    const newValue = e?.detail?.value !== undefined ? e.detail.value : !this.data.subscribeStatus

    if (newValue) {
      wx.requestSubscribeMessage({
        tmplIds: [''],
        success: async () => {
          try {
            await setMpSubscribe(true)
            this.setData({ subscribeStatus: true })
            wx.showToast({ title: '订阅成功', icon: 'success' })
          } catch (error) {
            const message = error instanceof Error ? error.message : '订阅失败'
            wx.showToast({ title: message, icon: 'none' })
          }
        },
        fail: () => {
          wx.showToast({ title: '订阅失败', icon: 'none' })
        },
      })
    } else {
      try {
        await setMpSubscribe(false)
        this.setData({ subscribeStatus: false })
        wx.showToast({ title: '已取消订阅', icon: 'none' })
      } catch (error) {
        const message = error instanceof Error ? error.message : '操作失败'
        wx.showToast({ title: message, icon: 'none' })
      }
    }
  },

  handleProfileTap() {
    const { avatarUrl, nickName } = this.data.userInfo
    this.showAuthModal(avatarUrl, nickName)
  },

  showAuthModal(currentAvatar: string, currentNick: string) {
    this.setData({
      showAuthModal: true,
      tempAvatar: currentAvatar,
      tempNickname: currentNick,
    })
  },

  hideAuthModal() {
    this.setData({ showAuthModal: false })
  },

  handleChooseAvatar(e: any) {
    this.setData({ tempAvatar: e.detail.avatarUrl })
  },

  handleNicknameInput(e: any) {
    this.setData({ tempNickname: e.detail.value || '' })
  },

  async handleSaveUserInfo() {
    const { tempAvatar, tempNickname } = this.data
    if (!tempAvatar || !tempNickname) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    this.setData({ isLoadingProfile: true })
    wx.showLoading({ title: '保存中...', mask: true })

    try {
      await updateMpUserProfile({ avatarUrl: tempAvatar, nickName: tempNickname })
      this.commitProfile(tempAvatar, tempNickname)
      this.hideAuthModal()
      wx.hideLoading()
      wx.showToast({ title: '信息已保存', icon: 'success' })
    } catch (error) {
      wx.hideLoading()
      console.error('更新用户信息失败:', error)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoadingProfile: false })
    }
  },

  commitProfile(avatarUrl: string, nickName: string) {
    this.setData({
      userInfo: { avatarUrl, nickName },
      hasLogin: true,
    })
    wx.setStorageSync(STORAGE_KEYS.USER_PROFILE, { avatarUrl, nickName })
  },

  toggleNightMode(e?: WechatMiniprogram.SwitchChange) {
    if (e?.detail && typeof e.detail.value === 'boolean') {
      setNightMode(this, e.detail.value)
      return
    }
    setNightMode(this, !this.data.nightMode)
  },

  noop() {},

  goToFavorites() { wx.navigateTo({ url: '../favorites/index' }) },
  goToHistory()   { wx.navigateTo({ url: '../history/index' }) },
  goToAbout()     { wx.navigateTo({ url: '../about/index' }) },
  goToSearch()    { wx.navigateTo({ url: '../search/index' }) },
  goToPrivacy()   { wx.navigateTo({ url: '../privacy/index' }) },
  generatePoster(){ wx.navigateTo({ url: '../poster/index' }) },

  handleDeleteAccount() {
    wx.showModal({
      title: '删除账户',
      content: '此操作将永久删除您的所有个人数据（包括书签、阅读记录等），且无法恢复。确定继续吗？',
      confirmText: '确定删除',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (!res.confirm) return

        wx.showLoading({ title: '处理中...', mask: true })
        try {
          await deleteMpUserAccount()
          wx.hideLoading()
          wx.clearStorageSync()
          wx.showToast({ title: '账户已删除', icon: 'success' })
          setTimeout(() => {
            wx.reLaunch({ url: '../index/index' })
          }, 1500)
        } catch (error) {
          wx.hideLoading()
          const message = error instanceof Error ? error.message : '删除失败'
          wx.showToast({ title: message, icon: 'none' })
        }
      },
    })
  },

  handleLogout() {
    wx.showModal({
      title: '安全退出',
      content: '退出将清除所有本地缓存和登录信息，确认继续？',
      confirmText: '退出',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({
            userInfo: { avatarUrl: '', nickName: '' },
            hasLogin: false,
            favoriteCount: 0,
            historyCount: 0,
          })
          wx.showToast({ title: '已安全退出', icon: 'success' })
          setTimeout(() => {
            wx.reLaunch({ url: '../index/index' })
          }, 800)
        }
      },
    })
  },

  onShareAppMessage() {
    return {
      title: 'Sanmoo Blog - 个人技术博客',
      path: '/pages/index/index',
      imageUrl: 'https://picsum.photos/seed/sanmoo/500/300',
    }
  },
})
