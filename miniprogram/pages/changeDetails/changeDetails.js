// miniprogram/pages/changeDetails/changeDetails.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentGoodsID: '',
    currentGoods: [],
    currentImg: [],
    oldImgID:'',

    imageChanged: false,
    nameChanged: false,
    priceChanged: false,
    typeChanged: false,
    infoChanged: false,
    componentsChanged: false,


    // copy from addGoods
    showTopTips: false,
    goodsName: "",
    goodsPrice: 0,
    goodsComponents: "",
    goodsType: "",
    goodsInfo: "",
    imgID: "",
    types: ["饮品", "菜品", "主食"],
    typeIndex: 0,
    formData: {},
    files: [],
    filesUrl: "",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentGoodsID: options.id,
    })
    this.getOldInfo()
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this),
      oldImgID:this.data.currentGoods.imgID
    })
  },

  //获取当前商品信息作为默认值 存在goods数组中
  getOldInfo: function () {
    db.collection('goods').doc(this.data.currentGoodsID).get({
      success: res => {
        this.setData({
          currentGoods: res.data,
          oldImgID: res.data.imgID,
          currentImg: [{
            url: res.data.imgID
          }]
        })
      }
    })

  },

  //copy from addGoods : change 'add' to 'update'

  // 获取商品名称
  getGoodsName: function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsName: e.detail.value,
      nameChanged: true
    })
  },
  // 获取商品价格
  getGoodsPrice: function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsPrice: e.detail.value,
      priceChanged: true
    })
  },
  // 获取商品成分
  getGoodsComponents: function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsComponents: e.detail.value,
      componentsChanged: true
    })
  },
  // 获取商品类型
  goodsTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value,
      typeChanged: true
    })
    console.log('picker goods_types 发生选择改变，携带值为', e.detail.value);
  },
  // 获取商品简介
  getGoodsInfo: function (e) {
    this.setData({
      goodsInfo: e.detail.value,
      infoChanged: true,
    })
  },

  //上传数据库？
  updateDB: function () {
    if (!this.data.nameChanged) {
      this.setData({
        goodsName: this.data.currentGoods.goodsName
      })
    }
    if (!this.data.priceChanged) {
      this.setData({
        goodsPrice: this.data.currentGoods.goodsPrice
      })
    }
    if (!this.data.componentsChanged) {
      this.setData({
        goodsComponents: this.data.currentGoods.goodsComponents
      })
    }
    if (!this.data.infoChanged) {
      this.setData({
        goodsInfo: this.data.currentGoods.goodsInfo
      })
    }
    if (!this.data.typeChanged) {
      this.setData({
        goodsType: this.data.currentGoods.goodsType
      })
    }
    db.collection('goods').doc(this.data.currentGoodsID).update({
      data: {
        goodsName: this.data.goodsName,
        goodsPrice: this.data.goodsPrice,
        goodsComponents: this.data.goodsComponents,
        goodsInfo: this.data.goodsInfo,
        goodsType: this.data.types[this.data.typeIndex],
      },
      success: res => {
        console.log('newInfo:' + this.data.goodsInfo)
      }
    })
  },

  // 点击按钮 提交表单
  submitForm: function () {
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })

        }
      } else {
        this.updateDB()
        if(this.data.imageChanged) {
          this.addImgToDB()
        }
        wx.showLoading({
          title: '更新商品信息',
        })
        setTimeout(function () {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '更新成功!',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateBack({
                  delta: 0,
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }, 2000)
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  selectFile: function (files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },

  uplaodFile: function (files) {
    console.log('upload files', files);
    var that = this;
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      const tempFilePaths = files.tempFilePaths;
      that.setData({
        filesUrl: tempFilePaths
      })
      var object = {};
      object['urls'] = tempFilePaths;
      resolve(object);
    })
  },

  uploadError: function (e) {
    console.log('upload error', e.detail)
  },
  uploadSuccess: function (e) {
    console.log('upload success', e.detail)
    this.setData({
      imageChanged: true
    })
    console.log('imgChanged!')
  },

  addImgToDB: function () {
    const filePath = this.data.filesUrl[0]
    console.log(filePath)
    const tempFile = filePath.split('.')
    console.log(tempFile)
    const cloudPath = 'goods-img-' + this.data.goodsName +'-'+ tempFile[tempFile.length - 2]
    console.log(cloudPath)
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        db.collection('goods').doc(this.data.currentGoodsID).update({
          data:{
            imgID:res.fileID
          },
          success: res => {
            console.log('IMG SUCCESS')
          }
        })
       // wx.cloud.deleteFile
        wx.cloud.deleteFile({
          fileList: [this.data.oldImgID],
          success: res => {
            // handle success
            console.log('图片删除成功:'+this.data.oldImgID)
          },
          fail: err => {
            // handle error
            console.log('图片删除失败!')
          },
          complete: res => {
            // ...
          }
        })
      }
    })
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