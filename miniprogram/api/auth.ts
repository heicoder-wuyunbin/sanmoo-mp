import { STORAGE_KEYS } from './config'
import { request } from './request'

export function getStoredOpenid(): string {
  try {
    return wx.getStorageSync(STORAGE_KEYS.OPENID) || ''
  } catch (error) {
    console.error(error)
    return ''
  }
}

export function setStoredOpenid(openid: string): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.OPENID, openid)
  } catch (error) {
    console.error(error)
  }
}

let lastWxLoginTime = 0
const WX_LOGIN_COOLDOWN = 2000

function wxLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const elapsed = now - lastWxLoginTime
    if (elapsed < WX_LOGIN_COOLDOWN) {
      const waitTime = WX_LOGIN_COOLDOWN - elapsed
      setTimeout(() => {
        doWxLogin(resolve, reject)
      }, waitTime)
      return
    }
    doWxLogin(resolve, reject)
  })
}

function doWxLogin(
  resolve: (code: string) => void,
  reject: (error: Error) => void,
): void {
  lastWxLoginTime = Date.now()
  wx.login({
    success: (res) => {
      if (res.code) {
        resolve(res.code)
        return
      }
      reject(new Error('wx.login 未返回 code'))
    },
    fail: (err) => reject(new Error(err.errMsg || 'wx.login 失败')),
  })
}

let openidPromise: Promise<string> | null = null
const MAX_AUTH_RETRIES = 3

export async function ensureMpOpenid(): Promise<string> {
  const existing = getStoredOpenid()
  if (existing && existing.trim()) {
    return existing
  }
  if (openidPromise) {
    return openidPromise
  }
  openidPromise = (async () => {
    let lastError: Error | null = null
    try {
      for (let i = 0; i < MAX_AUTH_RETRIES; i++) {
        try {
          const code = await wxLoginCode()
          const out = await request<{ openid: string }>('/mp/auth/session', 'POST', { code })
          if (out && out.openid && out.openid.trim()) {
            setStoredOpenid(out.openid)
            return out.openid
          }
          throw new Error('获取 openid 失败')
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          if (!lastError.message.includes('invalid code')) {
            throw lastError
          }
          if (i < MAX_AUTH_RETRIES - 1) {
            const delay = 1000 * Math.pow(2, i)
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }
      }
      throw lastError || new Error('获取 openid 失败')
    } finally {
      openidPromise = null
    }
  })()
  return openidPromise
}
