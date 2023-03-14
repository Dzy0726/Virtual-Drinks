// miniprogram/pages/changeGoodsInfo/changeGoodsInfo.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",

    goods: [],
    dialogShow: false,
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    currentGoodsID: '',
    currentImgID:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGoodsInfo()
    this.slideButtonInit()
    db.collection('goods')
    .watch({
      onChange:res=>{
        console.log(res.docs)
        this.setData({
          goods:res.docs
        })
      },
      onError:err=>{
        console.log(err)
      }
    })

    this.setData({
      search: this.search.bind(this)
  })
  },

  //搜索功能
  search: function (value) {
    return new Promise((resolve, reject) => {
      // setTimeout(() => {
      //   resolve([{text: '搜索结果', value: 1}, {text: '搜索结果2', value: 2}])
      // }, 200)
      db.collection('goods').where({
        goodsName: value
      }).get({
        success: res => {
          if(res.data.length != 0) {
          this.setData({
              goods: res.data
            })
            console.log('[数据库] [查询记录] 成功: ', res)
          }else {
            wx.showToast({
              title: '没有该商品',
              icon:'none'
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    })
  },
  recoveryResult: function (e) {
    this.getGoodsInfo()
  },

  //从数据库获取商品信息
  getGoodsInfo: function () {
    wx.showLoading({
      title: '读取信息',
    })
    db.collection('goods').get({
      success: res => {
        this.setData({
          goods: res.data
        })
        console.log(this.data.goods)
        wx.hideLoading()
      }
    })
  },

  //左滑显示
  slideButtonInit: function () {
    this.setData({
      slideButtons: [{
        text: '查看',
      }, {
        text: '修改',
        src: '', // icon的路径
      }, {
        type: 'warn',
        text: '删除',
        src: '', // icon的路径
      }],
    })
  },

  //实现左滑功能
  slideButtonTap: function (e) {
    console.log('slide button tap', e.currentTarget.dataset.id)
    console.log('slide img id:', e.currentTarget.dataset.img)
    this.setData({
      currentGoodsID: e.currentTarget.dataset.id,
      currentImgID:e.currentTarget.dataset.img
    })
    const index = e.detail.index
    if (index == 0) {
      wx.navigateTo({
        url: '../goodsDetail/goodsDetail?id=' + e.currentTarget.dataset.id,
      })
    } else if (index == 1) {
      wx.navigateTo({
        url: '../changeDetails/changeDetails?id=' + e.currentTarget.dataset.id,
      })
    } else if (index == 2) {
      this.setData({
        dialogShow: true
      })
      this.tapDialogButton()
    }
  },

  //删除功能实现
  tapDialogButton(e) {
    console.log(e)
    if (e.detail.index == 1) {
      this.setData({
        dialogShow:false
      })
      wx.showLoading({
        title: '正在删除',
      })
      console.log('当前id:' + this.data.currentGoodsID)
      console.log('当前图片id:' + this.data.currentImgID)
      db.collection('goods').doc(this.data.currentGoodsID).remove().then(res=>{
        console.log(res)
      })
      wx.cloud.deleteFile({
        fileList: [this.data.currentImgID],
        success: res => {
          // handle success
          console.log('图片删除成功:'+this.data.currentImgID)
        },
        fail: err => {
          // handle error
          console.log('图片删除失败!')
        },
        complete: res => {
          // ...
        }
      })      
      setTimeout(function () {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '商品删除成功!',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }, 1000)
    } else {
      this.setData({
        dialogShow:false
      })
    }
  },
  onReady: function () {
 
  },
  onShow:function(){
  }

})