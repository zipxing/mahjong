/**
 * Created by xiaochuntian on 2018/5/25.
 * 营销传播智能管理系统对应数据获取接口
 */

import { EventType } from "./EventType";
import { SystemInfo, UserInfo, hex_md5 } from "./GlobalInit";
import { HttpUtil } from "./HttpUtil";
import { NotificationCenter } from "./NotificationCenter";

export class PropagateInterface {
    public static ShareConfig: any = {};
    /**
     * 通过http获取分享相关信息
     * http://market.touch4.me/?act=api.getShareConfig&time=1421755384&game_mark=richddz&sign=a30ab1292aa5929e7f913ceed795f78c
     test demo
     var param = {
                 share_type:"hyyq2",      //获取分享点相关参数,可不传,传则代表获取单个分享点,不传表示获取all
                 config_id:"002003003"    //获取方案对应数据,不论该方案是否已发布,内部测试接口参数,代码发布上线时请删除
             };
     PropagateInterface.getShareConfigInfo(param);
     */
    static getShareConfigInfo(reqObj) {
        if (typeof reqObj != "object") {
            reqObj = {};
        }

        var timeStamp = new Date().getTime();
        reqObj.act = "api.getShareConfig";
        reqObj.time = timeStamp;
        reqObj.game_mark = SystemInfo.cloudId + "-" + SystemInfo.gameId;

        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + "=" + reqObj[key]);
        }
        paramStrList.push("sign=" + signStr);
        var finalUrl = SystemInfo.shareManagerUrl + "?" + paramStrList.join("&");
        var successcb = function (ret) {
            console.log("getShareConfigInfo...success.....");

            for (var key in ret.retmsg) {
                PropagateInterface.ShareConfig[key] = ret.retmsg[key];
            }
            NotificationCenter.trigger(EventType.GET_SHARE_CONFIG_SUCCESS, ret);
        };

        var failcb = function (ret) {
            NotificationCenter.trigger(EventType.GET_SHARE_CONFIG_FAIL, ret);
        };
        HttpUtil.httpGet({ url: finalUrl }, successcb, failcb);
    }

    /**
     * 获取用户特征值接口
     * http://market.touch4.me/?act=api.getUserFeature&cloud_id=24&game_id=6&time=1527235026&user_id=1404248&sign=a2b6938904ac3759fe6404ea8ed49267
     * @param reqObj
     */
    static getUserFeatureInfo() {
        var reqObj = { act: "", cloud_id: 0, game_id: 0, user_id: 0, time: 0 };
        var timeStamp = new Date().getTime();
        reqObj.act = "api.getUserFeature";
        reqObj.cloud_id = SystemInfo.cloudId;
        reqObj.game_id = SystemInfo.gameId;
        reqObj.user_id = UserInfo.userId;
        reqObj.time = timeStamp;

        var signStr = this.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + "=" + reqObj[key]);
        }
        paramStrList.push("sign=" + signStr);
        var finalUrl = SystemInfo.shareManagerUrl + "?" + paramStrList.join("&");
        var successcb = function (ret) {
            NotificationCenter.trigger(EventType.GET_USER_FEATURE_SUCCESS, ret);
        };

        var failcb = function (ret) {
            NotificationCenter.trigger(EventType.GET_USER_FEATURE_FAIL, ret);
        };
        HttpUtil.httpGet({ url: finalUrl }, successcb, failcb);
    }

    /**
     * 计算签名字符串
     * @param reqObj
     * @returns {string}
     */
    static getConfigSignStr(reqObj) {
        var sortedKeys = Object.keys(reqObj).sort();
        var signStr = "";
        for (var i = 0; i < sortedKeys.length; i++) {
            var key = sortedKeys[i];
            if (key == "act" || key == "sign") {
                continue;
            } else {
                signStr += key + "=" + reqObj[key];
            }
        }
        var finalSign = hex_md5("market.tuyoo.com-api-" + signStr + "-market.tuyoo-api") || "";
        return finalSign;
    }
}

export class SecretLanguage {
    // curl http://localhost:3000/api/wxtetris/makeimage?ciphertext=哎唉哀&plaintext=啊阿埃
    static get_wxtetris_makeimage(plaintext, ciphertext, type) {
        var reqObj = { plaintext: "", ciphertext: "" };
        reqObj.plaintext = plaintext;
        reqObj.ciphertext = ciphertext;

        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + "=" + reqObj[key]);
        }
        var finalUrl = SystemInfo.loginUrl + "api/wxtetris/makeimage" + "?" + paramStrList.join("&");
        console.log(finalUrl);
        var successcb = function (ret) {
            ret["type"] = type;
            NotificationCenter.trigger(EventType.GET_SECRET_LANGUAGE_IMAGE_SUCCESS, ret);
        };

        var failcb = function (ret) {
            NotificationCenter.trigger(EventType.GET_SECRET_LANGUAGE_IMAGE_FAIL, ret);
        };
        HttpUtil.httpGet({ url: finalUrl }, successcb, failcb);
    }
}
