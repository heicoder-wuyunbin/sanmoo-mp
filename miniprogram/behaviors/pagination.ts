interface PaginationResult<T> {
  list: T[]
  page: number
  size: number
  total: number
}

interface PaginationBehaviorData {
  page: number
  size: number
  total: number
  loading: boolean
  list: any[]
}

interface PaginationBehaviorMethods {
  _loadPage: (page: number) => Promise<PaginationResult<any>>
  reload: () => Promise<void>
  loadMore: () => Promise<void>
  _handleError: (error: unknown, defaultMsg: string) => void
}

export function createPaginationBehavior<T>(
  options: {
    pageSize?: number
    listKey?: string
    defaultErrorMessage?: string
  } = {},
) {
  const {
    pageSize = 10,
    listKey = 'list',
    defaultErrorMessage = '加载失败',
  } = options

  return Behavior({
    data: {
      [listKey]: [] as T[],
      page: 1,
      size: pageSize,
      total: 0,
      loading: false,
    } as PaginationBehaviorData,

    methods: {
      async reload(this: WechatMiniprogram.Page.Instance<any, any> & PaginationBehaviorMethods) {
        this.setData({ loading: true, page: 1 })
        try {
          const result = await this._loadPage(1)
          this.setData({
            [listKey]: result.list || [],
            page: result.page || 1,
            size: result.size || pageSize,
            total: result.total || 0,
          })
        } catch (error) {
          this._handleError(error, defaultErrorMessage)
        } finally {
          this.setData({ loading: false })
        }
      },

      async loadMore(this: WechatMiniprogram.Page.Instance<any, any> & PaginationBehaviorMethods) {
        const currentList = (this.data as any)[listKey] as T[]
        if (this.data.loading || currentList.length >= this.data.total) return

        const nextPage = this.data.page + 1
        this.setData({ loading: true })
        try {
          const result = await this._loadPage(nextPage)
          this.setData({
            [listKey]: [...currentList, ...(result.list || [])],
            page: result.page || nextPage,
            size: result.size || pageSize,
            total: result.total || this.data.total,
          })
        } catch (error) {
          this._handleError(error, '加载更多失败')
        } finally {
          this.setData({ loading: false })
        }
      },

      _handleError(_error: unknown, msg: string) {
        wx.showToast({ title: msg, icon: 'none', duration: 2000 })
      },
    } as any,
  })
}
