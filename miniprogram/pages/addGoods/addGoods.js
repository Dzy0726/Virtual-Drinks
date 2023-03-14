// miniprogram/pages/addGoods/addGoods.js
const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    goodsName: "",
    goodsPrice: 0,
    goodsComponents: "",
    goodsType: "",
    goodsInfo: "",
    imgID: "",

    types: ["饮品", "菜品", "主食"],
    typeIndex: 0,

    formData: {

    },


    files: [],
    filesUrl: "",

    rules: [{
      name: "goodsname",
      rules: {
        required: true,
        message: '请输入商品名字!'
      },
    }, {
      name: "price",
      rules: [{
        required: true,
        message: '请输入商品单价!'
      }, {
        validator: (rules, value, param, models) => {
          if (!/^[0-9]+$/.test(value)) {
            return "商品价格不是有效的数字,有效范围0~999999之间"
          }
        }
      }]
    }, {
      name: "content",
      rules: {
        required: true,
        message: '请输入配料成分!'
      },
    }, ]
  },
  // 表单输入检测并获取到 formData
  getGoodsName:function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsName: e.detail.value
    })
  },
  getGoodsPrice: function(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsPrice: e.detail.value
    })
  },
  getGoodsComponents:function(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
      goodsComponents: e.detail.value
    })
  },
  // 获取商品类型
  goodsTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
    console.log('picker goods_types 发生选择改变，携带值为', e.detail.value);

  },
  // 获取商品简介
  getGoodsInfo: function (e) {
    this.setData({
      goodsInfo: e.detail.value
    })
  },

  //上传数据库？
  addToDB:function() {
    db.collection('goods').add({
      data: {
        goodsName: this.data.goodsName,
        goodsPrice: this.data.goodsPrice,
        goodsComponents: this.data.goodsComponents,
        goodsInfo: this.data.goodsInfo,
        goodsType: this.data.types[this.data.typeIndex],
        imgID: this.data.imgID
      },
      success: res => {
        console.log(this.data.imgID)
      }
    })
  },

  // 点击按钮 提交表单
  submitForm:function() {
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
        this.addImgToDB()
        if (this.data.imgID == "") {
          this.setData({
            error: '图片上传失败!请重试'
          })
        } else {
          this.addToDB()
          wx.showLoading({
            title: '写入数据库',
          })
          setTimeout(function () {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '发布商品成功!',
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
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
  },

  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  selectFile:function(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },

  uplaodFile:function(files) {
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

  uploadError:function(e) {
    console.log('upload error', e.detail)
  },
  uploadSuccess:function(e) {
    console.log('upload success', e.detail)
  },

  addImgToDB:function() {
    const filePath = this.data.filesUrl[0]
    const tempFile = filePath.split(',')
    const cloudPath = 'goods-img-' + this.data.goodsName + tempFile[tempFile.length - 2]
    console.log(filePath)
    console.log(cloudPath)
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        this.setData({
          imgID: res.fileID
        })
        console.log(this.data.imgID)
      }
    })
  },
})