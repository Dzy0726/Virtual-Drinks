// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    order: []
  },

  //获取用户openid
  getOpenid() {
    let _this = this;
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.log('openid--', res.result)
        var openid = res.result.openid
        _this.setData({
          openid: openid
        })
        _this.onQuery();
      }
    })
  },

  //从云数据库获取订单列表
  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('order').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        for (var i in res.data) {
          this.data.order.push(res.data[i]);
        }
        this.setData({
          order: this.data.order.reverse()
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  gotoOrderDetail: function (e) {
    const _id = e.currentTarget.dataset.index;
    console.log("_id: ", _id)
    wx.setStorageSync('selectOrderNo', _id);
    wx.navigateTo({
      url: '',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      order: []
    })
    this.getOpenid()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})