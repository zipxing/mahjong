/**
 * Created by xiaochuntian on 2018/5/31.
 */

import { IsWechatPlatform, SystemInfo, tywx } from "./GlobalInit";

/**
 * 交叉导流相关系统接口, 调用导流接口使用showAd 接口， 刷新导流显示icon使用resetBtnIcon 接口
 */
export var AdManager = {
    adIconBtn: null, //向其他小游戏的导流入口

    adInfoList: [], //所有广告信息的列表
    currentAdInfo: null, //当前做展示的导流信息
    currentWebPage: null, //当前显示的最终导流游戏的信息
    retryTimes: 3, //网络请求失败重试次数

    /**
     * 请求交叉倒流的信息
     */
    requestADInfo: function () {
        if (!IsWechatPlatform()) {
            return;
        }
        this.retryTimes--;
        var reqObj = { act: "", time: 0, game_mark: "" };
        var timeStamp = new Date().getTime();
        reqObj.act = "api.getCrossConfig";
        reqObj.time = timeStamp;
        reqObj.game_mark = SystemInfo.cloudId + "-" + SystemInfo.gameId;
        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + "=" + reqObj[key]);
        }
        paramStrList.push("sign=" + signStr);
        var finalUrl = SystemInfo.shareManagerUrl + "?" + paramStrList.join("&");
        var that = this;

        // wx.request({
        //     url : finalUrl,
        //     method : 'GET',
        //     success : function (res) {
        //         if (res.statusCode == 200){

        //             var ret = res.data;
        //             console.log('RET:' + JSON.stringify(ret));
        //             that.adInfoList = [];
        //             if(ret.retmsg){
        //                 for(var index in ret.retmsg){
        //                     that.adInfoList.push(ret.retmsg[index]);
        //                 }
        //             }

        //             that.retryTimes = 3;
        //         }
        //     },
        //     fail : function (res) {

        //         if(that.retryTimes > 0){

        //             that.requestADInfo();
        //         }else{
        //             that.retryTimes = 0;
        //         }

        //     }
        // });
    },

    /**
     * 对外接口，用于添加广告位
     * position {x, y}
     */
    showAd: function (position) {
        // this.genRandomFirstAdInfo();
        // if (!this.currentAdInfo) {
        //     return;
        // }
        // if (this.adIconBtn) {
        //     this.adIconBtn.active = true;
        // } else {
        //     var that = this;
        //     //动态加载资源必须放在resources目录下,导流入口强制命名为adNode,放在resources/prefabs下
        //     cc.loader.loadRes("prefab/adNode", function (err, prefab) {
        //         var preFabNode = cc.instantiate(prefab);
        //         preFabNode.position = cc.v2(position.x, position.y);
        //         that.adIconBtn = preFabNode;
        //         cc.game.addPersistRootNode(preFabNode);
        //         cc.loader.load({ url: that.currentAdInfo.icon_url }, function (err, texture) {
        //             if (!err) {
        //                 var spriteIco = preFabNode.getChildByName("adIcon");
        //                 spriteIco.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        //                 var adButton = preFabNode.getChildByName("adButton");
        //                 adButton.on("click", function () {
        //                     tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickFirstAd, [
        //                         that.currentAdInfo.icon_url,
        //                         that.currentAdInfo.icon_name,
        //                     ]);
        //                     that.onClickAdIconBtn();
        //                 });
        //             } else {
        //                 //加载失败
        //             }
        //         });
        //     });
        // }
    },

    /**
     * 生成随机的一级导流信息
     */
    genRandomFirstAdInfo: function () {
        // if (this.adInfoList.length == 0) {
        //     return;
        // }
        // var weight_list = [0];
        // for (var i in this.adInfoList) {
        //     weight_list.push(parseInt(this.adInfoList[i].icon_weight));
        // }
        // weight_list.sort(function (a, b) {
        //     return a > b;
        // });
        // var total = 0;
        // weight_list.forEach((element) => {
        //     total += element;
        // });
        // var _randomIndex = parseInt(Math.random() * 10000) % (total + 1);
        // var _tTotal = 0;
        // var _selectIndex = 0;
        // for (var i = 0; i < weight_list.length - 1; i++) {
        //     _tTotal += weight_list[i];
        //     if (_tTotal < _randomIndex && _tTotal + weight_list[i + 1] >= _randomIndex) {
        //         _selectIndex = i + 1;
        //         break;
        //     }
        // }
        // var _selectNum = weight_list[_selectIndex];
        // this.adInfoList.forEach((element) => {
        //     if (element.icon_weight == _selectNum.toString()) {
        //         this.currentAdInfo = element;
        //     }
        // });
    },

    /**
     * 生成随机的二级导流信息
     */
    genRandomSecondAdInfo: function () {
        // var _webPages = this.currentAdInfo.webpages;
        // if (_webPages.length == 0) {
        //     return;
        // }
        // var weight_list = [0];
        // for (var i in _webPages) {
        //     weight_list.push(parseInt(_webPages[i].webpage_weight));
        // }
        // weight_list.sort(function (a, b) {
        //     return a > b;
        // });
        // var total = 0;
        // weight_list.forEach((element) => {
        //     total += element;
        // });
        // var _randomIndex = parseInt(Math.random() * 10000) % (total + 1);
        // var _tTotal = 0;
        // var _selectIndex = 0;
        // for (var i = 0; i < weight_list.length - 1; i++) {
        //     _tTotal += weight_list[i];
        //     if (_tTotal < _randomIndex && _tTotal + weight_list[i + 1] >= _randomIndex) {
        //         _selectIndex = i + 1;
        //         break;
        //     }
        // }
        // var _selectNum = weight_list[_selectIndex];
        // _webPages.forEach((element) => {
        //     if (element.webpage_weight.toString() == _selectNum.toString()) {
        //         this.currentWebPage = element;
        //     }
        // });
        // console.log("this.currentWebPage" + JSON.stringify(this.currentWebPage));
    },

    hideAd: function () {
        if (this.adIconBtn) {
            this.adIconBtn.active = false;
        }
    },

    onClickAdIconBtn: function () {
        // this.genRandomSecondAdInfo();
        // if (!this.currentWebPage) {
        //     return;
        // }
        // var that = this;
        // tywx.BiLog.clickStat(tywx.clickStatEventType.clickStatEventTypeClickFirstAd, [
        //     that.currentWebPage.webpage_url,
        //     that.currentAdInfo.config_id,
        // ]);
        // // if(tywx.IsWechatPlatform()) {
        // //     wx.previewImage({
        // //         current: [that.currentWebPage.webpage_url],
        // //         urls: [that.currentWebPage.webpage_url],
        // //         success:function(res){
        // //             tywx.LOGD(null, "预览图片成功！");
        // //         },
        // //         fail:function (res) {
        // //             tywx.LOGD(null, "预览图片失败！");
        // //         }
        // //     });
        // // }
        // this.resetBtnIcon();
    },

    /**
     * 刷新ad按钮的icon
     */
    resetBtnIcon: function () {
        // var that = this;
        // this.genRandomFirstAdInfo();
        // if (!that.adIconBtn || !that.currentAdInfo.icon_url) {
        //     return;
        // }
        // cc.loader.load({ url: that.currentAdInfo.icon_url }, function (err, texture) {
        //     if (!err) {
        //         var spriteIco = that.adIconBtn.getChildByName("adIcon");
        //         spriteIco.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        //     }
        // });
    },

    /**
     * 计算签名字符串
     * @param reqObj
     * @returns {string}
     */
    getConfigSignStr: function (reqObj) {
        // var sortedKeys = Object.keys(reqObj).sort();
        // var signStr = "";
        // for (var i = 0; i < sortedKeys.length; i++) {
        //     var key = sortedKeys[i];
        //     if (key == "act" || key == "sign") {
        //         continue;
        //     } else {
        //         signStr += key + "=" + reqObj[key];
        //     }
        // }
        // var finalSign = tywx.hex_md5("market.tuyoo.com-api-" + signStr + "-market.tuyoo-api") || "";
        // return finalSign;
    },

    /**
     * 展示Banner广告
     * @param adid 广告ID
     */
    showBannerAd: function (adid) {
        // console.log("showBanner");
        // if (!window.wx) {
        //     //防止在浏览器中报错
        //     return;
        // }
        // // if (!wx.hasOwnProperty('createBannerAd')){
        // //     tywx.LOGD(null, '玩家基础库,不支持banner!');
        // //     return;
        // // }
        // //var sysInfo = wx.getSystemInfoSync();
        // var screenWidth = sysInfo.screenWidth;
        // var screenHeight = sysInfo.screenHeight;
        // //自适应高 设计的广告栏宽600.高190  游戏整体宽是720
        // var ratio = 720 / 720;
        // this.destroyBannerAd();
        // tywx.LOGD("showBannerAd", "当前屏幕宽度:" + screenWidth + "; screenHeight:" + screenHeight);
        // // tywx.curBannerAd = wx.createBannerAd({
        // //     adUnitId: adid,
        // //     style: {
        // //         left:0,
        // //         top:0,
        // //         width: ratio*screenWidth,
        // //     }
        // // });
        // // tywx.curBannerAd.onResize(function (res) {
        // //     console.log('showBannerAd', '当前banner,width:' + res.width + "; height:" + res.height);
        // //     if (tywx.curBannerAd) {
        // //         tywx.curBannerAd.style.left = (screenWidth - res.width)/2;
        // //         tywx.curBannerAd.style.top = screenHeight - screenHeight * 0.14; // - res.height + 1;
        // //         res.height = screenHeight * 0.15;
        // //         res.width = screenWidth;
        // //     }
        // // });
        // // tywx.curBannerAd.show();
    },

    destroyBannerAd: function () {
        // if (tywx.curBannerAd) {
        //     try {
        //         tywx.curBannerAd.hide();
        //         tywx.curBannerAd.destroy();
        //     } catch (e) {
        //         console.log(e);
        //     }
        //     tywx.curBannerAd = null;
        // }
    },
};
tywx["AdManager"] = AdManager;
// tywx.AdManager.requestADInfo();
