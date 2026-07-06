import { STORAGE_KEYS } from '../api/config'

const DARK_NAV_BG = '#020617'
const LIGHT_NAV_BG = '#ffffff'

export function readNightMode(): boolean {
  try {
    return wx.getStorageSync(STORAGE_KEYS.NIGHT_MODE) || false
  } catch (error) { console.error(error);
    return false
  }
}

export function applyNightModeToNav(nightMode: boolean): void {
  wx.setNavigationBarColor({
    frontColor: nightMode ? '#ffffff' : '#000000',
    backgroundColor: nightMode ? DARK_NAV_BG : LIGHT_NAV_BG,
    animation: {
      duration: 200,
      timingFunc: 'easeIn'
    },
    success: () => {},
    fail: (err) => {
      console.error('setNavigationBarColor failed:', err)
    }
  })
}

export function syncNightModeToPage(
  page: WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>>,
): boolean {
  const nightMode = readNightMode()
  page.setData({ nightMode })
  applyNightModeToNav(nightMode)
  try {
    const app = getApp<IAppOption>()
    if (app && app.globalData) {
      app.globalData.nightMode = nightMode
    }
  } catch (error) { console.error(error);
    // ignore
  }
  return nightMode
}

export function setNightMode(
  page: WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>>,
  nightMode: boolean,
): void {
  try {
    wx.setStorageSync(STORAGE_KEYS.NIGHT_MODE, nightMode)
  } catch (error) { console.error(error);
    // ignore
  }
  page.setData({ nightMode })
  applyNightModeToNav(nightMode)
  try {
    const app = getApp<IAppOption>()
    if (app && app.globalData) {
      app.globalData.nightMode = nightMode
    }
  } catch (error) { console.error(error);
    // ignore
  }
}

export function injectNightMode(): void {
  const pageAny = Page as any
  if (pageAny.__nightModeInjected) {
    return
  }
  pageAny.__nightModeInjected = true
  const originalPage = Page
  Page = function (config: WechatMiniprogram.Page.Options<Record<string, any>, Record<string, any>>) {
    const originalOnLoad = config.onLoad
    const originalOnShow = config.onShow
    return originalPage({
      ...config,
      onLoad(...args) {
        syncNightModeToPage(this)
        if (typeof originalOnLoad === 'function') {
          originalOnLoad.apply(this, args as any)
        }
      },
      onShow(...args) {
        syncNightModeToPage(this)
        if (typeof originalOnShow === 'function') {
          originalOnShow.apply(this, args as any)
        }
      },
    })
  } as any
}
