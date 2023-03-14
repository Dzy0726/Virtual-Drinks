Page({
data: {
  imgDetail:[],//全部信息
  imgID:[],
  goodsPrice:[],
  goodsName:[],
  goodsType:[],
  goodsInfo:[],
  goodsComponents:[]
},

onLoad: function (e) {
  //指定id来加载对应数据
  console.log(e)
  let that=this	//同样的 异步请求，let一个that
  let a=e.id		//声明一个a,存e中的id
  // 页面初始化 options为页面跳转所带来的参数
  wx.cloud.database().collection("goods").where({ //查询数据表prize下id为a所存放的id的信息
    _id:a
  }).get({
    success(res){
     // console.log(res)
      that.setData({ //给数据写入数据
        imgDetail:res.data,
        imgID:res.data[0].imgID,
        goodsPrice:res.data[0].goodsPrice,
        goodsName:res.data[0].goodsName,
        goodsType:res.data[0].goodsType,
        goodsInfo:res.data[0].goodsInfo,
        goodsComponents:res.data[0].goodsComponents
      })
    }
  })   

}
})