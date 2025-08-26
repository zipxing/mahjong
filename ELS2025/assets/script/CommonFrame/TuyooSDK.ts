import { BiLog, clickStatEventType } from "./Bilog";
import { IsWechatPlatform, LOGD, SystemInfo, UserInfo, LOGE, StateInfo } from "./GlobalInit";
import { Util } from "./Util";

/**
 * @author zhaoliang
 * @date 1.28
 *
 * 全局对象
 * 系统信息
 * 包括clientId，loginUrl等
 */
console.log("TuyooSDK loaded");
export class TuyooSDK {
    SESSION_KEY: string = "TU_SESSION_STORAGE";

    /***************************以下为登录相关接口*********************************/
    login() {
        if (IsWechatPlatform()) {
            this.getSystemInfo();
            this.wechatLogin();
        } else {
            //其他平台,待添加
        }
    }

    // 微信登录
    wechatLogin() {
        if (!IsWechatPlatform()) {
            return;
        }
        BiLog.clickStat(clickStatEventType.clickStatEventTypeWxLoginStart, []);
        // wx.login({
        //     success: function(params) {
        //         LOGD(null, 'wx login success, params:' + JSON.stringify(params));
        //         BiLog.clickStat(clickStatEventType.clickStatEventTypeWxLoginSuccess, [params.code]);
        //         if (params.code) {
        //             var code = params.code;
        //             this.loginTuyooWithCode(code, {});
        //             NotificationCenter.trigger(EventType.WEIXIN_LOGIN_SUCCESS);
        //         }
        //     },

        //     fail: function(params) {
        //         BiLog.clickStat(clickStatEventType.clickStatEventTypeWxLoginFailed, []);
        //         LOGD(null, 'wx login fail, params:' + JSON.stringify(params));
        //         NotificationCenter.trigger(EventType.WEIXIN_LOGIN_FAIL);
        //     },

        //     complete: function(params) {

        //     }
        // });
    }

    // 微信不需要重新授权，使用
    loginTuyooWith3rdSession() {
        if (!IsWechatPlatform()) {
            return;
        }
        // wx.getStorage({
        //     key: this.SESSION_KEY,
        //     success: function(params) {
        //         if (!params.data) {
        //             this.wechatLogin();
        //             return;
        //         }
        //         // 微信授权成功后使用code登录途游服务器
        //         wx.request({
        //             url: SystemInfo.loginUrl + 'open/v3/user/processSnsIdNew',
        //             data: {
        //                 snsId: params.data,
        //                 deviceName: 'wechatGame',
        //                 clientId: SystemInfo.clientId,
        //                 appId: SystemInfo.appId
        //             },

        //             success: function(params) {
        //                 LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
        //             },

        //             fail: function(params) {
        //                 LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
        //             },

        //             complete: function(params) {

        //             }
        //         });
        //     },
        //     fail: function(params) {
        //         this.wechatLogin();
        //     },
        //     complete:function(params) {

        //     }
        // });
    }

    // 微信授权成功后，使用
    /* {
        "data": {
            "result": {
                "code": 0,
                "userId": 10116,
                "exception_report": 0,
                "userType": 4,
                "authInfo": "{\"authcode\": \"eyJ1aWQiOiAxMDExNiwgInVuYW1lIjogIlx1Njc2NVx1NWJiZTAwNzRBaWJzVCIsICJ1dG9rZW4iOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzEzMzgiLCAiY29pbiI6IDAsICJlbWFpbCI6ICIiLCAidXRpbWUiOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzA0NzEifQ==\", \"account\": \"\", \"uid\": 10116, \"usercode\": \"\"}",
                "tcpsrv": {
                    "ip": "192.168.10.88",
                    "port": 8041
                },
                "isCreate": 1,
                "changePwdCount": 0,
                "360.vip": 0,
                "logclient": {
                    "loguploadurl": "",
                    "logreporturl": ""
                },
                "userPwd": "ty817142",
                "purl": "http://ddz.image.tuyoo.com/avatar/head_female_0.png",
                "snsId": "wxapp:071Nehqt0Z4XEe1jN6qt007Cqt0Nehqz",
                "userEmail": "",
                "connectTimeOut": 35,
                "appId": 9999,
                "heartBeat": 6,
                "userName": "来宾0074AibsT",
                "mobile": "",
                "token": "cce362d6-68a8-485e-b137-86ae6828e07a",
                "authorCode": "eyJ1aWQiOiAxMDExNiwgInVuYW1lIjogIlx1Njc2NVx1NWJiZTAwNzRBaWJzVCIsICJ1dG9rZW4iOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzEzMzgiLCAiY29pbiI6IDAsICJlbWFpbCI6ICIiLCAidXRpbWUiOiAiMjAxOC0wMS0yOSAxNDoxMzoxMi40NzA0NzEifQ==",
                "log_report": 0,
                "showAd": 1
            }
        },
        "header": {
            "Server": "nginx/1.4.1",
            "Date": "Mon, 29 Jan 2018 06:13:12 GMT",
            "Content-Type": "application/json;charset=UTF-8",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive",
            "Content-Encoding": "gzip"
        },
        "statusCode": 200,
        "errMsg": "request:ok"
    }
    */
    loginTuyooWithCode(code, userInfo) {
        if (!IsWechatPlatform()) {
            return;
        }
        // 微信授权成功后使用code登录途游服务器
        // wx.showShareMenu({
        //     withShareTicket: true
        // });

        //咱们后端 0 是男 1 是女,要转换
        var gender = userInfo.gender || 0;

        var local_uuid = Util.getLocalUUID();
        LOGD("local_uuid:", local_uuid);
        var sdkPath = SystemInfo.loginUrl;
        var dataObj = {
            appId: SystemInfo.appId,
            wxAppId: SystemInfo.wxAppId,
            clientId: SystemInfo.clientId,
            snsId: "wxapp:" + code,
            uuid: local_uuid,
            //以下为上传玩家的微信用户信息
            //nickName: userInfo.nickName,
            //avatarUrl: userInfo.avatarUrl,
            gender: gender,
            scene_id: UserInfo.scene_id || "",
            scene_param: UserInfo.scene_param || "",
            invite_id: UserInfo.invite_id || 0,
            nikeName: "",
            avatarUrl: "",
        };
        if (userInfo && userInfo.nickName) {
            dataObj.nikeName = userInfo.nickName;
        }

        if (userInfo && userInfo.avatarUrl) {
            dataObj.avatarUrl = userInfo.avatarUrl;
        }
        BiLog.clickStat(clickStatEventType.clickStatEventTypeLoginSDKStart, [code, local_uuid, userInfo.nickName]);
        // wx.request({
        //     url: sdkPath + 'open/v6/user/LoginBySnsIdNoVerify',
        //     header: {
        //         'content-type': 'application/x-www-form-urlencoded'
        //     },
        //     data: dataObj,
        //     method:'POST',

        //     success: function(params) {
        //         LOGD(null, 'tuyoo login success, params:' + JSON.stringify(params));
        //         var checkData = params.data;
        //         if (checkData.error && checkData.error.code == 1){
        //             console.log('tuyoo login fail...');
        //             return;
        //         }
        //         // 保存用户名/用户ID/用户头像
        //         var result = checkData.result;
        //         UserInfo.userId = result.userId;
        //         UserInfo.userName = result.userName;
        //         UserInfo.userPic = result.purl;
        //         UserInfo.authorCode = result.authorCode;
        //         UserInfo.wxgame_session_key = result.wxgame_session_key;
        //         LOGD(null, 'userId:' + UserInfo.userId + ' userName:' + UserInfo.userName + ' userPic:' + UserInfo.userPic);

        //         var token = result.token;
        //         LOGD(null, 'token:' + token);
        //         wx.setStorage({
        //             key: this.SESSION_KEY,
        //             data: token
        //         });

        //         BiLog.clickStat(clickStatEventType.clickStatEventTypeLoginSDKSuccess, [code, local_uuid, userInfo.nickName, result.userId]);
        //         this.initWebSocketUrl(result);

        //         // 发送登录成功事件
        //         NotificationCenter.trigger(EventType.SDK_LOGIN_SUCCESS);
        //     },

        //     fail: function(params) {
        //         BiLog.clickStat(clickStatEventType.clickStatEventTypeLoginSDKFailed, [code, local_uuid, userInfo.nickName]);
        //         LOGD(null, 'tuyoo login fail, params:' + JSON.stringify(params));
        //         NotificationCenter.trigger(EventType.SDK_LOGIN_FAIL);
        //     },

        //     complete: function(params) {

        //     }
        // });
    }

    /**
     * 使用sdk登陆返回信息解析得到服务器连接地址,对于单机游戏来说无效
     * @param loginResult
     */
    initWebSocketUrl(loginResult) {
        if (loginResult && loginResult.tcpsrv) {
            var ip = loginResult.tcpsrv.ip;
            var port = loginResult.tcpsrv.wsport || loginResult.tcpsrv.port; //优先使用wsport
            var webSocketUrl;
            if (SystemInfo.loginUrl.indexOf("https://") > -1) {
                webSocketUrl = "wss://" + ip + "/";
            } else {
                webSocketUrl = "ws://" + ip + ":" + port.toString() + "/";
            }
            LOGD(null, "webSocketUrl:" + webSocketUrl);
            SystemInfo.webSocketUrl = webSocketUrl;
        }
    }

    getSystemInfo() {
        // {
        // 	"0":{
        // 	"errMsg":"getSystemInfo:ok",
        // 		"model":"iPhone X",
        // 		"pixelRatio":3,
        // 		"windowWidth":375,
        // 		"windowHeight":812,
        // 		"system":"iOS 10.0.1",
        // 		"language":"zh_CN",
        // 		"version":"6.6.3",
        // 		"batteryLevel":100,
        // 		"screenWidth":375,
        // 		"screenHeight":812,
        // 		"SDKVersion":"1.8.0",
        // 		"brand":"devtools",
        // 		"fontSizeSetting":16,
        // 		"statusbarHeight":44,
        // 		"platform":"devtools"
        // }
        // }
        if (!IsWechatPlatform()) {
            return;
        }
        // wx.getSystemInfo({
        //     success (result) {
        //         var model = result.model;
        //         var isiPhone = model.indexOf("iPhone") >= 0;
        //         var windowHeight = result.windowHeight;
        //         var resultType = 0;
        //         if (isiPhone){
        //             if(windowHeight == 812){   //iPhoneX
        //                 resultType = 2;
        //             }else if (windowHeight == 736){ // 7p 8p
        //                 resultType = 4;
        //             }else {  //其他iPhone
        //                 resultType = 1;
        //             }
        //         }else { //cc.sys.OS_ANDROID
        //             resultType = 3;
        //         }
        //         UserInfo.systemType = resultType;
        //         UserInfo.wechatType = result.version;
        //         UserInfo.model = result.model;
        //         UserInfo.system = result.system;
        //     },
        //     fail () {
        //     },
        //     complete () {
        //     }
        // });
    }

    wechatAuthorize() {
        if (!IsWechatPlatform()) {
            return;
        }
        // wx.getSetting({
        //     success:function(res) {
        //         if (!res.authSetting['scope.userInfo']) {
        //             BiLog.clickStat(clickStatEventType.clickStatEventTypeAuthorizationStart, []);
        //             wx.authorize({
        //                 scope : "scope.userInfo",
        //                 success () {
        //                     BiLog.clickStat(clickStatEventType.clickStatEventTypeAuthorizationSuccess, []);
        //                     NotificationCenter.trigger(EventType.START_AUTHORIZATION_SUCCESS);
        //                 },
        //                 fail:function () {
        //                     BiLog.clickStat(clickStatEventType.clickStatEventTypeAuthorizationFailed, []);
        //                     NotificationCenter.trigger(EventType.START_AUTHORIZATION_FAILED);
        //                 },
        //                 complete:function () {
        //                 }
        //             });
        //         }
        //         else{
        //             NotificationCenter.trigger(EventType.START_AUTHORIZATION_SUCCESS);
        //         }
        //     }
        // });
    }

    /***************************以下为支付相关接口*********************************/

    createOrder(id, prodPrice, name, prodCount) {
        /*
         params  id:商品ID,prodPrice:价格  单位元, name:商品名称
         prodCount:购买数量,默认为1

         prodId:商品ID, prodName:商品名称, prodCount:购买数量
         prodPrice:价格  单位元,
         chargeType:支付方式 wxapp.iap,
         gameId:子游戏id,
         appInfo:透传参数,
         mustcharge:是否支付 默认填 1
         */
        var data = { prodId: "", prodPrice: 0, chargeType: "", gameId: 0, prodName: "", prodCount: 0, appInfo: {} };
        data.prodId = id;
        data.prodPrice = prodPrice;
        data.chargeType = "wxapp.iap";
        data.gameId = SystemInfo.gameId;
        data.prodName = name;
        data.prodCount = prodCount;
        data.appInfo = {};
        this.rechargeOrder(data);
    }

    orderCallFunc(url, platformOrderId, chargeCoin) {
        if (!IsWechatPlatform()) {
            return;
        }
        var local_uuid = Util.getLocalUUID();
        var _chargeCoin = chargeCoin;
        //@ts-ignore
        wx.request({
            url: url,
            header: {
                "content-type": "application/x-www-form-urlencoded",
            },
            data: {
                userId: UserInfo.userId,
                appId: SystemInfo.appId,
                wxAppId: SystemInfo.wxAppId,
                clientId: SystemInfo.clientId,
                imei: "null",
                uuid: local_uuid,
                platformOrderId: platformOrderId,
            },

            method: "POST",

            success(results) {
                var tips = "购买成功";
            },
            fail(params) {
                LOGE(null, "file = [Recharge] fun = [OrderCallFun] 充值失败 params = " + JSON.stringify(params));
            },
            complete(params) {},
        });
    }

    /*
     params prodId:商品ID, prodName:商品名称, prodCount:购买数量
     prodPrice:价格  单位元,
     chargeType:支付方式 wxapp.iap,
     gameId:子游戏id,
     appInfo:透传参数,
     mustcharge:是否支付 默认填 1
     */
    rechargeOrder(params) {
        if (!IsWechatPlatform()) {
            return;
        }
        var local_uuid = Util.getLocalUUID();
        var sdkPath = SystemInfo.loginUrl;
        var reqUrl =
            SystemInfo.hall_version == "hall37" ? sdkPath + "open/v4/pay/order" : sdkPath + "open/v5/pay/order";
        // wx.request({
        //     url: reqUrl,
        //     header: {
        //         'content-type': 'application/x-www-form-urlencoded'
        //     },
        //     data: {
        //         userId:UserInfo.userId,
        //         appId: SystemInfo.appId,
        //         wxAppId: SystemInfo.wxAppId,
        //         clientId: SystemInfo.clientId,
        //         imei: 'null',
        //         uuid : local_uuid,
        //         //商品信息
        //         prodId: params.prodId,
        //         prodName: params.prodName,
        //         prodCount: params.prodCount || 1,
        //         prodPrice: params.prodPrice,
        //         chargeType: params.chargeType,
        //         gameId : params.gameId,
        //         appInfo : params.appInfo,
        //         mustcharge : params.mustcharge || 1
        //     },

        //     method:'POST',

        //     success: function(params) {
        //         LOGE(null, 'tuyoo rechargeOrder success, params:' + JSON.stringify(params));
        //         var results = params.data.result;
        //         if (results.code == 0) {
        //             var chargeInfo = results.chargeInfo;
        //             var chargeData = chargeInfo.chargeData;
        //             var notifyUrl = chargeData.notifyUrl;
        //             var platformOrderId = chargeData.platformOrderId;
        //             LOGE(null, 'tuyoo rechargeOrder success 创建订单成功, chargeData.mustcharge =' + chargeData.mustcharge);
        //             if (chargeData && chargeData.mustcharge == 1) {
        //                 // wx.requestMidasPayment  购买微信币
        //                 wx.requestMidasPayment({
        //                     mode: chargeData.mode,
        //                     env: chargeData.env,
        //                     offerId: chargeData.offerId,
        //                     buyQuantity: 10 * chargeInfo.chargeTotal,
        //                     platform:chargeData.platform,
        //                     currencyType:"CNY",
        //                     zoneId: chargeData.zoneId,
        //                     success:function(params) {
        //                         // 支付成功
        //                         this.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
        //                     },
        //                     fail:function(params) {
        //                         LOGE(null, '米大师支付 fail params = ' + JSON.stringify(params));
        //                     }
        //                 });
        //             }else if (chargeData && chargeData.mustcharge == 0){
        //                 this.orderCallFunc(notifyUrl,platformOrderId,chargeInfo.chargeCoin);
        //             }
        //         }else if (results.code == 1) {
        //             //hall.MsgBoxManager.showToast({title : results.info});
        //         }else if (results.code == 3) {
        //             //hall.MsgBoxManager.showToast({title : '微信小程序登陆验证失败!'});
        //         }
        //     },
        //     fail: function(params) {
        //         //hall.MsgBoxManager.showToast({title : '购买失败!'});
        //     },
        //     complete: function(params) {
        //     }
        // });
    }
}

export var WechatInterfaceInit = function () {
    if (IsWechatPlatform()) {
        /**
         * 小程序回到前台,具体逻辑自己实现
         */
        // wx.onShow(function (result) {
        //     // {"0":{"scene":1044,"shareTicket":"beecdf9e-e881-492c-8a3f-a7d8c54dfcdb","query":{}}}  (从后台切到前台才有shareTicket,启动时没有)
        //     //LOGE('', "+++++++++++++++++onShow+++++++++++++++++"+JSON.stringify(result));
        //     console.log('', "+++++++++++++++++onShow+++++++++++++++++"+JSON.stringify(result));
        //     //取相关参数
        //     var scene = result.scene;
        //     var query = result.query;
        //     var scenePath = '';
        //     //来源处理
        //     UserInfo.scene_id = scene;
        //     UserInfo.scene_param = query.from || "";
        //     UserInfo.invite_id = query.inviteCode || 0;
        //     StateInfo.isOnForeground = true;
        //     NotificationCenter.trigger(EventType.GAME_SHOW, result);
        //     if(query && query.sourceCode) {
        //         //从小程序消息卡片中点入,该场景为"点击用户分享卡片进入游戏注册时，分享用户的user_id直接当做场景参数放在param02，param03和param04分别代表分享点id和分享图文id"
        //         //var query = "inviteCode="+ty.UserInfo.userId+"&sourceCode="+type +"&imageType="+imageMap.imageType+"&inviteName="+ty.UserInfo.userName;
        //         BiLog.clickStat(clickStatEventType.clickStatEventTypeUserFrom,[scene, query.inviteCode, query.sourceCode, query.imageType]);
        //     } else if (query && query.plaintext && query.ciphertext) {
        //         //密语传情进入
        //         SECRETLANGUAGEDATA = query;
        //         NotificationCenter.trigger(EventType.SECRET_LANGUAGE_TO_GAME, query);
        //     } else {
        //         if(Util.isSceneQrCode(scene)) {
        //             //从小程序码进入,相关见文档https://developers.weixin.qq.com/minigame/dev/tutorial/open-ability/qrcode.html
        //             if (query.hasOwnProperty('scene')){
        //                 scenePath = query.scene;
        //             } else if(result.hasOwnProperty('path')) {
        //                 scenePath = result.path;
        //             }
        //             scenePath.replace(".html", "");     //生成时可能会在path后面添加.html
        //             scenePath = decodeURIComponent(scenePath);
        //             UserInfo.scene_param = scenePath;
        //             BiLog.clickStat(clickStatEventType.clickStatEventTypeUserFrom,[scene, scenePath]);
        //         } else {
        //             //场景值和场景参数分别记录到可选参数param01和param02当中，如param01=1058，param02=tuyouqipai
        //             //场景参数由项目组接入推广渠道时配置，如公众号dacihua、tuyouqipai，二维码填写企业或个人标识
        //             BiLog.clickStat(clickStatEventType.clickStatEventTypeUserFrom,[scene, query.from]);
        //         }
        //     }
        //     this.login();
        // });

        /**
         * 小程序进入后台
         */
        // wx.onHide(function () {
        //     LOGE('',"+++++++++++++++++onHide+++++++++++++++++");
        //     if (UIManager.game.model.mconf.mode === 0 && UIManager.game.model.mconf.isWhisper === true) {
        //         UIManager.game.loseBackToHome();
        //         return;
        //     }
        //     UserInfo.scene_id = 0;
        //     StateInfo.isOnForeground = false;
        //     NotificationCenter.trigger(EventType.GAME_HIDE);
        //     TCPClient.close();
        // });

        var getNetSuccess = function (res) {
            if (res.hasOwnProperty("isConnected")) {
                StateInfo.networkConnected = res.isConnected;
            } else if (res.hasOwnProperty("errMsg")) {
                StateInfo.networkConnected = res.errMsg == "getNetworkType:ok";
            } else {
                StateInfo.networkConnected = res.networkType != "none";
            }

            StateInfo.networkType = res.networkType; //wifi,2g,3g,4g,none,unknown
        };

        // wx.getNetworkType({
        //     success:getNetSuccess
        // });

        // wx.onNetworkStatusChange(getNetSuccess);

        // wx.onError(function (res) {
        //     var d = new Date();
        //     var errMsg = 'userId:' + UserInfo.userId + 'time:'+ d.toDateString() + ' ' + d.toTimeString() +';' + res.message;
        //     BiLog.uploadLogTimely(errMsg);
        // });
    }
};
WechatInterfaceInit();
