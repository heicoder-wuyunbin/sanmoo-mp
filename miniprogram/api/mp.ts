/**
 * 小程序 API 统一出口
 * 所有业务 API 按领域拆分到独立模块，此文件集中 re-export。
 * 页面只需 import from '../../api/mp' 即可，无需关心内部拆分。
 */

// 请求基础设施
export { request } from './request'

// OpenID 认证管理
export { ensureMpOpenid, getStoredOpenid, setStoredOpenid } from './auth'

// 设置 & 搜索 & 用户资料 & 行为上报
export {
  getMpSettings,
  getMpHotSearches,
  reportMpBehavior,
  getMpUserProfile,
  updateMpUserProfile,
  setMpSubscribe,
  getMpSubscribeStatus,
  type MpUserProfile,
} from './user-api'

// 文章（列表、详情、推荐、分类文章、标签文章）
export {
  getMpArticles,
  getMpArticleDetail,
  getMpRecommendations,
  getMpCategoryArticles,
  getMpTagArticles,
} from './article-api'

// 分类 & 标签
export { getMpCategories, getMpTags } from './category-api'

// 专题
export { getMpTopics, getMpTopicDetail, getMpTopicArticles } from './topic-api'

// 收藏 & 浏览历史
export {
  addMpFavorite,
  removeMpFavorite,
  getMpFavoriteStatus,
  getMpFavorites,
  addMpBrowseHistory,
  getMpBrowseHistory,
  clearMpBrowseHistory,
} from './favorite-api'
