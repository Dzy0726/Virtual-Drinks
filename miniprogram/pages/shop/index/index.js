
const db = wx.cloud.database()


// 最大行数
const max_row_height = 5
// 行高
const cart_offset = 210
// 底部栏偏移量
const food_row_height = 100
Page({
  data: {
    cartData: {},
    cartObjects: [],
    maskVisual: 'hidden',
    amount: 0,
    
    carArray: [], //购物车
    totalPrice: 0,
    isSelectAddress: false,
    selectReceivingAddress: [], //选中的收货地址,
    isSelectReceivingAddress: false,
    order: {}
  },
  onLoad: function() {

    this.loadFood()
  },
  onShow: function() {

    this.loadFood()
  },
  
  loadFood: function() {
		// debugger
    db.collection('goods')
      .orderBy('goodsPrice','asc')
			.get()
      .then(({ data: foodObjects }) => {
				// debugger
        this.setData({
          foodObjects: foodObjects
        })
      })
  },
 
  checkout: function() {
    // 将对象序列化
    const cartObjects = []
    this.data.cartObjects.forEach((item, index) => {
      const cart = {
        title: item.goods.goodsName,
        price: item.goods.goodsPrice,
        quantity: item.quantity
      }
      cartObjects.push(cart)
    })

    wx.navigateTo({
      url:
        '../../order/checkout/checkout?quantity=' +
        this.data.quantity +
        '&amount=' +
        this.data.amount +
        '&express_fee=' +
        this.data.express_fee +
        '&carts=' +
        JSON.stringify(cartObjects)
    })
  },
  add: function(e) {
    // 所点商品id
    const goodsId = e.currentTarget.dataset.goodsId
    console.log(goodsId);
    // 读取目前购物车数据
    const cartData = this.data.cartData
    // 获取当前商品数量
    let goodsCount = cartData[goodsId] ? cartData[goodsId] : 0
    // 自增1后存回
    cartData[goodsId] = ++goodsCount
    // 设值到data数据中
    this.setData({
      cartData: cartData
    })
    // 转换成购物车数据为数组
    this.cartToArray(goodsId)
  },
  subtract: function(e) {
    // 所点商品id
    const goodsId = e.currentTarget.dataset.goodsId
    // 读取目前购物车数据
    const cartData = this.data.cartData
    // 获取当前商品数量
    let goodsCount = cartData[goodsId]
    // 自减1
    --goodsCount
    // 减到零了就直接移除
    if (goodsCount === 0) {
      delete cartData[goodsId]
    } else {
      cartData[goodsId] = goodsCount
    }
    // 设值到data数据中
    this.setData({
      cartData: cartData
    })
    // 转换成购物车数据为数组
    this.cartToArray(goodsId)
  },
  cartToArray: function(goodsId) {
    // 需要判断购物车数据中是否已经包含了原商品，从而决定新添加还是仅修改它的数量
    const cartData = this.data.cartData
    const cartObjects = this.data.cartObjects
    // 查询对象
    db.collection('goods').doc(goodsId).get().then(({data: goods}) => {
      // goods = utils.formatResults(goods)
      // 从数组找到该商品，并修改它的数量
      for (let i = 0; i < cartObjects.length; i++) {
        if (cartObjects[i].goods._id === goodsId) {
          // 如果是undefined，那么就是通过点减号被删完了
          if (cartData[goodsId] === undefined) {
            cartObjects.splice(i, 1)
          } else {
            cartObjects[i].quantity = cartData[goodsId]
          }
          this.setData({
            cartObjects: cartObjects
          })
          // 成功找到直接返回，不再执行添加
          this.amount()
          return
        }
      }
      // 添加商品到数组
      const cart = {}
      cart.goods = goods
      cart.quantity = cartData[goodsId]
      cartObjects.push(cart)
      this.setData({
        cartObjects: cartObjects
      })
      // 因为请求网络是异步的，因此汇总在此，上同
      this.amount()
    })
  },
  cascadeToggle: function() {
    //切换购物车开与关
     console.log(this.data.maskVisual);
    if (this.data.maskVisual == 'show') {
      this.cascadeDismiss()
    } else {
      this.cascadePopup()
    }
  },
  cascadePopup: function() {
    // 购物车打开动画
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out'
    })
    this.animation = animation
    // scrollHeight为商品列表本身的高度
    const scrollHeight =
      (this.data.cartObjects.length <= max_row_height
        ? this.data.cartObjects.length
        : max_row_height) * food_row_height
    // cartHeight为整个购物车的高度，也就是包含了标题栏与底部栏的高度
    const cartHeight = scrollHeight + cart_offset
    animation.translateY(-cartHeight).step()
    this.setData({
      animationData: this.animation.export(),
      maskVisual: 'show',
      scrollHeight: scrollHeight,
      cartHeight: cartHeight
    })
    // 遮罩渐变动画
    const animationMask = wx.createAnimation({
      duration: 150,
      timingFunction: 'linear'
    })
    this.animationMask = animationMask
    animationMask.opacity(0.8).step()
    this.setData({
      animationMask: this.animationMask.export()
    })
  },
  cascadeDismiss: function() {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out'
    })
    this.animation = animation
    // scrollHeight为商品列表本身的高度
    const scrollHeight =
      (this.data.cartObjects.length <= max_row_height
        ? this.data.cartObjects.length
        : max_row_height) * food_row_height
    // cartHeight为整个购物车的高度，也就是包含了标题栏与底部栏的高度
    const cartHeight = scrollHeight + cart_offset
    // 购物车关闭动画
    this.animation.translateY(cartHeight).step()
    
    this.setData({
      animationData: this.animation.export()
    })
    const animationMask = wx.createAnimation({
      duration: 150,
      timingFunction: 'linear'
    })
    this.animationMask = animationMask
    // 遮罩渐变动画
    this.animationMask.opacity(0).step()
    this.setData({
      animationMask: this.animationMask.export()
    })

    // 隐藏遮罩层
    this.setData({
      maskVisual: 'hidden'
    })
  },
  amount: function() {
    const cartObjects = this.data.cartObjects
    let amount = 0
    let quantity = 0
   console.log(cartObjects)
    cartObjects.forEach(function(item, index) {
      console.log(item)
      amount += item.quantity * item.goods.goodsPrice
      quantity += item.quantity
    })
    this.setData({
      amount: amount.toFixed(2),
      quantity: quantity
    })
  },
  toDetail:function(e){
    console.log(e)
    var imgId = e.currentTarget.dataset.goodsId;
    console.log("this id is " + imgId)
    wx.navigateTo({
      url: "/pages/goodsDetail/goodsDetail?id=" + imgId   //?id连字符加上imgId
    });
  },
  gotoPay: function () {
    if(this.data.amount == 0) {
      this.setData({
        error:'尚未添加商品！'
      })

      }else{
        this.data.order.foodsCount = this.data.cartObjects.length;
        this.data.order.totalPrice = this.data.amount;
        this.data.order.carArray = this.data.cartObjects[0].goods;
        this.data.order.foodsName = this.data.cartObjects[0].goods.goodsName;
        const _this = this
        const db = wx.cloud.database()
        db.collection('order').add({
          data: {
            order: _this.data.order
          },
          success: res => {
            wx.showToast({
              title: '支付成功！',
            })
            wx.removeStorage({
              key: 'carArray',
              success(res) {
                console.log(res)
              }
            })
            wx.removeStorage({
              key: 'totalPrice',
              success(res) {
                console.log(res)
              }
            })
            //地址
            wx.navigateTo({
              url: '../../paySuccess/paySuccess',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })
      }
      }
      //let time = this.formatTime(new Date());
      //console.log(time);

      //this.data.order.merchantsImg = "/img/xiaoshidai.jpg";
      //this.data.order.listTime = this.formatTime(new Date());
      
      
      //地址

     

    // wx.showToast({
    //   title: '支付成功！',
    // })
})
