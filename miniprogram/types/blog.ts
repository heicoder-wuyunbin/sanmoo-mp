export interface ApiResponse<T> {
  success: boolean
  data: T
  errorCode?: string
  errorMessage?: string
  timestamp?: number
}

export interface Tag {
  id: number
  name: string
  articleCount?: number
}

export interface Category {
  id: number
  name: string
  articleCount?: number
}

export interface Article {
  id: number
  title: string
  titleImage: string
  description: string
  createTime: string
  readNum: number
  isTop?: boolean
  isPublished?: boolean
  categoryId: number
  categoryName: string
  tags: Tag[]
}

export interface ArticleListData {
  list: Article[]
  total: number
  page: number
  size: number
}

export interface ArticleBrief {
  id: number
  title: string
}

export interface ArticleDetail extends Article {
  content: string
  contentHtml?: string
  coverUrl?: string
  updateTime: string
  prevArticle: ArticleBrief | null
  nextArticle: ArticleBrief | null
  isFavorited?: boolean
}

export interface CategoryListData {
  list: Category[]
}

export interface TagListData {
  list: Tag[]
}

export interface BlogSettingsData {
  coreConfig?: {
    blogName?: string
    introduction?: string
    author?: string
    avatar?: string
    poster?: string
  }
  uiConfig?: {
    githubHome?: string
    giteeHome?: string
    csdnHome?: string
    zhihuHome?: string
    recommendStrategy?: 'rule' | 'weighted' | 'cf'
  }
}

export interface Topic {
  id: number
  title: string
  description: string
  cover: string
  articleCount: number
  createTime: string
}
