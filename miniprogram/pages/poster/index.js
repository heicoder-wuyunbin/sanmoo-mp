import { syncNightModeToPage } from '../../utils/night-mode';
import { getMpSettings } from '../../api/mp';
const DEFAULT_POSTER = '/assets/logo.jpg';
Page({
 data: {
 nightMode: false,
 posterUrl: '',
 isLoading: false,
 },
 async onShow() {
 syncNightModeToPage(this);
 await this.loadPoster();
 },
 async loadPoster() {
 this.setData({ isLoading: true });
 try {
 const res = await getMpSettings();
 const posterPath = res?.coreConfig?.poster;
 if (posterPath) {
 let posterUrl = posterPath;
 if (!posterPath.startsWith('http') && !posterPath.startsWith('data:')) {
 posterUrl = `/uploads/${posterPath}`;
 }
 this.setData({ posterUrl });
 }
 else {
 this.setData({ posterUrl: DEFAULT_POSTER });
 }
 }
 catch (error) {
 console.error('获取海报失败，使用默认海报:', error);
 this.setData({ posterUrl: DEFAULT_POSTER });
 }
 finally {
 this.setData({ isLoading: false });
 }
 },
 refreshPoster() {
 this.loadPoster();
 },
 savePoster() {
 if (!this.data.posterUrl) {
 wx.showToast({ title: '请先加载海报', icon: 'none' });
 return;
 }
 wx.showLoading({ title: '保存中...' });
 wx.downloadFile({
 url: this.data.posterUrl.startsWith('/')
 ? `https://backendart.com${this.data.posterUrl}`
 : this.data.posterUrl,
 success: (res) => {
 wx.hideLoading();
 wx.saveImageToPhotosAlbum({
 filePath: res.tempFilePath,
 success: () => {
 wx.showToast({ title: '已保存到相册', icon: 'success' });
 },
 fail: () => {
 wx.showToast({ title: '保存失败，请检查权限', icon: 'none' });
 },
 });
 },
 fail: () => {
 wx.hideLoading();
 wx.showToast({ title: '下载海报失败', icon: 'none' });
 },
 });
 },
});