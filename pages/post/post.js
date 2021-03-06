// pages/post/post.js

const AV = require('../../utils/av-weapp-min.js');
const app = getApp()
const config = require('../../comm/script/config');

Page({

  //   var pageData = {}
  // for (var i = 1; i< 5; i++) {
  //   (function (index) {
  //     pageData['slider' + index + 'change'] = function (e) {
  //       console.log('slider' + 'index' + '发生 change 事件，携带值为', e.detail.value)
  //     }
  //   })(i)
  // }
  // Page(pageData)
  /**
   * 页面的初始数据
   */
  data: {
    haveImage: false,
    is_sending: false,
    imageSrc: "",
    imageUrl: "",
    categories: ['-','食品', '女装', '男装', '珠宝配饰', '美妆', '护肤', '旅行', '家电', '电子数码', '休闲娱乐', '户外运动', '箱包', '图书', '办公用品', '家居家装','母婴用品'],
    index: 0,
    loading: false,
    is_public: true,
    is_take_photo: false,
    value_location: "",
    value_latitude: 33.33,
    value_longitude: 33.33
  },
  bindPickerChange: function (e) {
    console.log('picker sent selection change, the value brought is', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(app.globalData.userInfo)

    // ###Set userInfo to local data
    if (app.globalData.userInfo != null) {
      that.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      app.getUserInfo()
    }
  },
  goBack: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },
  goHome: function (e) {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  goPost: function (e) {
    wx.reLaunch({
      url: '/pages/post/post'
    })
  },
  goProfile: function (e) {
    wx.reLaunch({
      url: '/pages/profile/profile'
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
    var that = this
    console.log("that >> ")
    console.log(that)
    console.log(that.data.is_take_photo)
    if(!that.data.is_take_photo)
    {
      // Mark as already take picture
      that.data.is_take_photo = true

    wx.chooseImage({
      count: 1, // Default 9
      sizeType: ['compressed'], // Can specify whether it is the original or compressed image, both have defaults
      sourceType: ['camera', 'album'], // Can specify whether the source is an album or camera, both have defaults
      success: function (res) {
        // Returns the local file path list for the selected photo, tempFilePath can be used as the img tag's src attribute to display the image
        var tempFilePath = res.tempFilePaths[0]

        console.log("Temp file path >>")
        console.log(tempFilePath)
        that.setData({
          is_sending: true,
          imageSrc: tempFilePath
        })
        console.log("Have Image >>")
        console.log(that.data.haveImage)
        // console.log(that.data.imgSrc)

        // #####LEANCLOUD PART --- SEND IMG
        console.log("Processing send img to LeanCloud >>")
        new AV.File('file-name', {
          blob: {
            uri: tempFilePath,
          },
        }).save().then(
          file => {
            console.log("Yeah..This is img url in LeanCloud >>")
            console.log(that)
            console.log(file.url())
            that.setData({
              is_sending: false,
              haveImage: true,
              imageUrl: file.url()
            })
          }
          ).catch(console.error);
        // ######LEANCLOUD PART --- SEND IMG
      }
    })
    }
  },

  bindFormSubmit: function(e) {
    // 1. enable the loading animation on send button
    let that = this
    that.setData({
      loading: !that.data.loading
    })

    // 2. show a Loading toast
    wx.showToast({
      title: '正在发送...',
      icon: 'loading',
      duration: 1500
    })
    console.log("Press Submit!!!!")
    console.log(e)

    let _price = e.detail.value.price
    let _discount = e.detail.value.discount
    let _message = e.detail.value.message
    let _location = e.detail.value.location
    let _category = this.data.categories[this.data.index]
    let _image_url = this.data.imageUrl
    let _is_private = !this.data.is_public
    let _latitude = this.data.latitude
    let _longitude = this.data.longitude;

    if(_image_url && _image_url.length > 0) {
      wx.request({
        success: function (res) {
          try {
            console.log("Res from server: ")
            console.log(res)

            // console.log("TEST Res store globalData >>>")
            // console.log(app.globalData.token)
            // console.log(app.globalData.currentUserId)
            console.log("done for post to API")
            that.setData({
              loading: !that.data.loading
            })

            wx.showToast({
              title: '已发送',
                icon: 'success',
                duration: 1000
            })

            // Clear ITEM after done post

            that.data.haveImage = false
            that.data.is_sending = false
            that.data.imageSrc = ""
            that.data.imageUrl = ""
            that.data.index = ""
            that.data.loading = false
            that.data.is_public = true
            that.data.is_take_photo = false

            setTimeout(function () {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 500)



          } catch (e) {
            console.log(e)
          }
        },

        url: config.baseUrl + '/api/v1/items',
        method: "post",
        header: {
          'content-type': 'application/json',
          'X-User-Email': app.globalData.email,
          'X-User-Token': app.globalData.token
        },
        data: {
          item: {
            price: _price,
            discount: _discount,
            description: _message,
            image_url: _image_url,
            category: _category,
            is_private: _is_private,
            latitude: _latitude,
            longitude: _longitude,
            location: _location
          }
        }
      })
    }
    else {
      // show validation error message
      this.setData({
        showPictureRequiredErrorMessage: true,
        loading: false
      })
    }



  },
  switch1Change: function (e) {
    console.log('switch1 has experienced a change event, the value brought is', e.detail.value)
    this.data.is_public = e.detail.value
    console.log(this.data.is_public)
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
    this.onLoad()
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

  },
  takePicture: function (e) {
    console.log("take a picture")
    var that = this


    wx.chooseImage({
      count: 1, // Default 9
      sizeType: ['compressed'], // Can specify whether it is the original or compressed image, both have defaults
      sourceType: ['camera', 'album'], // Can specify whether the source is an album or camera, both have defaults
      success: function (res) {
        // Returns the local file path list for the selected photo, tempFilePath can be used as the img tag's src attribute to display the image
        var tempFilePath = res.tempFilePaths[0]

        console.log("Temp file path >>")
        console.log(tempFilePath)
        that.setData({
          is_sending: true,
          imageSrc: tempFilePath
        })
        console.log("Have Image >>")
        console.log(that.data.haveImage)
        // console.log(that.data.imgSrc)

        // #####LEANCLOUD PART --- SEND IMG
        console.log("Processing send img to LeanCloud >>")
        new AV.File('file-name', {
          blob: {
            uri: tempFilePath,
          },
        }).save().then(
          file => {
            console.log("Yeah..This is img url in LeanCloud >>")
            console.log(that)
            console.log(file.url())
            that.setData({
              is_sending: false,
              haveImage: true,
              imageUrl: file.url()
            })
          }
          ).catch(console.error);
        // ######LEANCLOUD PART --- SEND IMG
      }
    })

  },
  pinLocation: function(e) {

    let that = this

    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          value_location: res.name,
          value_latitude: res.latitude,
          value_longitude: res.longitude
        })
      },
      fail: function (e) {
        console.log(e)
      },
      cencel: function (e) {
        console.log(e)
      }
    })
  }

})
