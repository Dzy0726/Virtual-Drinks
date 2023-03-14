//index.js
const app = getApp()
// 获取云数据库示例
const db = wx.cloud.database()

Page({
  data: {
    imgUrls:[],
    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    duration: 1000, //滑动动画时长
    inputShowed: false,
    inputVal: "",

    img:[]

  },

  onLoad:function() {
    this.setData({
      img:'cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/index.png',
      imgUrls:['cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/3.png',
      'cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/2.png',
      'cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/5.png',
      'cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/1.png',
      'cloud://virtual-drinks-4grqmv5j49ec7114.7669-virtual-drinks-4grqmv5j49ec7114-1304492105/4.png']
    })
  },
})
