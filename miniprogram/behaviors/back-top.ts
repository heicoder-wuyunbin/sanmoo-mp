/**
 * 回到顶部 Behavior
 * 当页面滚动超过阈值时显示"回到顶部"按钮。
 */
const BACK_TOP_THRESHOLD = 800

export const backTopBehavior = Behavior({
  data: {
    showBackTop: false,
  },

  methods: {
    onPageScroll(event: WechatMiniprogram.Page.IPageScrollOption) {
      const shouldShow = event.scrollTop > BACK_TOP_THRESHOLD
      if (shouldShow !== this.data.showBackTop) {
        this.setData({ showBackTop: shouldShow })
      }
    },

    backToTop() {
      wx.pageScrollTo({ scrollTop: 0, duration: 220 })
    },
  },
})
