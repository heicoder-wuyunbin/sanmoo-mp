import { ensureMpOpenid } from './api/mp'
import { applyNightModeToNav, injectNightMode, readNightMode } from './utils/night-mode'

injectNightMode()

App<IAppOption>({
  globalData: {
    nightMode: false
  },
  async onLaunch() {
    try {
      await ensureMpOpenid()
    } catch (error) { console.error(error);
      // ignore auth failure in dev phase
    }
    
    // 初始化夜间模式
    const nightMode = readNightMode()
    this.globalData.nightMode = nightMode
    applyNightModeToNav(nightMode)
  },
  onShow() {
    // 页面显示时检查夜间模式
    const nightMode = readNightMode()
    this.globalData.nightMode = nightMode
  }
})
