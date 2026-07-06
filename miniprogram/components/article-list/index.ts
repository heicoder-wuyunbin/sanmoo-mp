import { estimateReadTime } from '../../utils/helpers'

Component({
  properties: {
    articles: {
      type: Array,
      value: [],
    },
    loading: {
      type: Boolean,
      value: false,
    },
    showBackTop: {
      type: Boolean,
      value: false,
    },
    emptyText: {
      type: String,
      value: '暂无文章',
    },
    emptyDesc: {
      type: String,
      value: '',
    },
  },

  methods: {
    estimateReadTime,

    onArticleTap(e: WechatMiniprogram.BaseEvent) {
      const { id } = e.currentTarget.dataset as { id: number }
      if (id) {
        this.triggerEvent('articletap', { id })
      }
    },

    onBackTop() {
      this.triggerEvent('backtop')
    },
  },
})