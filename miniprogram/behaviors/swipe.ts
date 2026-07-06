/**
 * 左滑操作 Behavior
 * 提供列表项左滑展示操作按钮的能力（收藏、删除等）。
 * 使用方式：在页面中 import 后添加到 behaviors 数组。
 */
export const swipeBehavior = Behavior({
  data: {
    openedId: 0,
    touchStartX: 0,
    touchItemId: 0,
  },

  methods: {
    onItemTouchStart(event: WechatMiniprogram.TouchEvent) {
      const { id } = event.currentTarget.dataset as { id: number }
      this.setData({
        touchStartX: event.touches[0].clientX,
        touchItemId: id || 0,
      })
    },

    onItemTouchEnd(event: WechatMiniprogram.TouchEvent) {
      const endX = event.changedTouches[0].clientX
      const deltaX = this.data.touchStartX - endX
      const itemID = this.data.touchItemId
      if (!itemID) return

      if (deltaX > 28) {
        this.setData({ openedId: itemID })
        return
      }
      if (deltaX < -28 && this.data.openedId === itemID) {
        this.setData({ openedId: 0 })
      }
    },

    closeSwipe() {
      if (this.data.openedId !== 0) {
        this.setData({ openedId: 0 })
      }
    },
  },
})
