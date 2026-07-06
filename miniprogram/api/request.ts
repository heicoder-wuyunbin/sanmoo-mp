
import { API_BASE_URL } from './config'
import { ensureMpOpenid } from './auth'
import { ApiResponse } from '../types/blog'

interface RequestConfig {
  requireOpenid?: boolean
  hideToast?: boolean
}

export async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  data?: any,
  config?: RequestConfig,
): Promise<T> {
  const fullUrl = `${API_BASE_URL}${path}`
  console.log(`发送请求: ${method} ${fullUrl}`, { data })

  const header: Record<string, string> = {}
  if (config?.requireOpenid) {
    try {
      const openid = await ensureMpOpenid()
      header['X-MP-OPENID'] = openid
    } catch (error) {
      console.error('获取 openid 失败，无法发送请求', error)
      if (!config?.hideToast) {
        wx.showToast({ title: '登录状态异常', icon: 'none' })
      }
      throw error
    }
  }

  return new Promise((resolve, reject) => {
    wx.request<ApiResponse<T>>({
      url: fullUrl,
      method,
      data,
      header,
      success: (res) => {
        console.log(`请求成功: ${method} ${fullUrl}`, { statusCode: res.statusCode, data: res.data })
        const body = res.data
        if (!body) {
          const error = new Error('Empty response body')
          console.error(`请求错误: ${method} ${fullUrl}`, error)
          if (!config?.hideToast) {
            wx.showToast({ title: '服务器响应为空', icon: 'none' })
          }
          reject(error)
          return
        }
        if (!body.success) {
          const error = new Error(body.errorMessage || 'Request failed')
          console.error(`请求错误: ${method} ${fullUrl}`, error, body)
          if (!config?.hideToast) {
            wx.showToast({ title: body.errorMessage || '请求失败', icon: 'none' })
          }
          reject(error)
          return
        }
        resolve(body.data)
      },
      fail: (err) => {
        console.error(`请求失败: ${method} ${fullUrl}`, err)
        const error = new Error(err.errMsg || 'Network error')
        if (!config?.hideToast) {
          wx.showToast({ title: '网络请求异常，请检查网络', icon: 'none' })
        }
        reject(error)
      },
    })
  })
}
