/**
 * Created by xiaochuntian on 2018/5/28.
 */

import { director, macro } from "cc";
import { isInWXChat } from "./GlobalInit";
import { Timer } from "./Timer";

export class OpenDataContextUtil {
    static methodIndex: number = 0;
    static methodCallDic: any = {};
    static isOnTimer: boolean = false;
    /**
     * 开启检查定时器
     */
    static initCheckTimer() {
        if (OpenDataContextUtil.isOnTimer) return;
        OpenDataContextUtil.isOnTimer = true;
        var cb = function () {
            OpenDataContextUtil.checkOpenDataContextStat();
        };
        setInterval(cb, 1000);
        // Timer.setTimer(director, cb, 1 / 10, macro.REPEAT_FOREVER, 0);
    }

    /**
     * 根据请求发出的列表,检查子域数据获取情况,结果分为成功|失败|超时三种,进行回调和事件通知
     */
    static checkOpenDataContextStat() {
        // var openDataContext = wx.getOpenDataContext();
        // var sharedCanvas = openDataContext.canvas;
        // var context = sharedCanvas.getContext("2d");
        // for(var key in OpenDataContextUtil.methodCallDic) {
        //     LOGD("开始检查:" + key, "abcd");
        //     if(context[key]) {
        //         if(context[key]["status"] == true) {
        //             //成功,有回调调回调,同时trigger事件出去
        //             LOGD("success_callback:" + key, JSON.stringify(context[key]));
        //             OpenDataContextUtil.methodCallDic[key]["success_callback"] && OpenDataContextUtil.methodCallDic[key]["success_callback"](context[key]["data"]);
        //             NotificationCenter.trigger(EventType.GET_OPEN_DATA_RESULT_SUCCESS, [key, context[key]["data"]]);
        //         } else {
        //             //失败,
        //             LOGD("success_callback:" + key, JSON.stringify(context[key]));
        //             OpenDataContextUtil.methodCallDic[key]["fail_callback"] && OpenDataContextUtil.methodCallDic[key]["fail_callback"](context[key]["data"]);
        //             NotificationCenter.trigger(EventType.GET_OPEN_DATA_RESULT_FAIL, [key, context[key]["data"]]);
        //         }
        //         delete context[key];
        //         delete OpenDataContextUtil.methodCallDic[key];
        //     } else {
        //         if((new Date()).valueOf() - OpenDataContextUtil.methodCallDic[key]["time"] > 2000) {//两秒都没返回
        //             //超时
        //             NotificationCenter.trigger(EventType.GET_OPEN_DATA_RESULT_TIMEOUT, [key]);
        //             delete context[key];
        //             delete OpenDataContextUtil.methodCallDic[key];
        //         }
        //     }
        // }
    }

    /**
     * 向子域请求获取用户信息
     * @param successCallBack
     * @param failCallBack
     * @returns {string}
     */
    static getUserInfo(successCallBack, failCallBack) {
        if (!isInWXChat) {
            return;
        }
        var methodName = "getUserInfo";
        var methodId = methodName + OpenDataContextUtil.methodIndex;
        // var openDataContext = wx.getOpenDataContext();
        // openDataContext.postMessage({
        //     method : methodName,
        //     data : {
        //         method_id: methodId
        //     },
        // });
        // OpenDataContextUtil.methodIndex++;
        // OpenDataContextUtil.methodCallDic[methodId] = {
        //     time: (new Date()).valueOf(),
        //     success_callback: successCallBack,
        //     fail_callback: failCallBack
        // };
        // OpenDataContextUtil.initCheckTimer();
        return methodId;
    }

    /**
     * 更新上报信息,更新内容由调用者传入,格式为{key1:value1,key2:value2}
     * @param data
     * @returns {string}
     */
    static updateRankData(data) {
        var methodName = "updateRankData";
        var methodId = methodName + OpenDataContextUtil.methodIndex;
        var kv = [];
        for (var key in data) {
            var item = {
                key: key.toString(),
                value: data[key].toString(),
            };
            kv.push(item);
        }
        // var openDataContext = wx.getOpenDataContext();
        // openDataContext.postMessage({
        //     method : methodName,
        //     data : {
        //         method_id: methodId,
        //         kvDataList : kv
        //     }
        // });
        OpenDataContextUtil.methodIndex++;
        return methodId;
    }

    /**
     * 向子域请求获取排行榜信息
     * @param type : ELS_PKSTAR ELS_CURRENT_STAGE2
     * @param successCallBack
     * @param failCallBack
     * @returns {string}
     */
    static getFriendCloudStorage(types, successCallBack, failCallBack) {
        if (!isInWXChat) {
            return;
        }
        var methodName = "getFriendCloudStorage";
        var methodId = methodName + OpenDataContextUtil.methodIndex;

        // var openDataContext = wx.getOpenDataContext();
        // openDataContext.postMessage({
        //     types: types,
        //     method : methodName,
        //     data : {
        //         method_id: methodId
        //     }
        // });
        OpenDataContextUtil.methodIndex++;
        OpenDataContextUtil.methodCallDic[methodId] = {
            time: new Date().valueOf(),
            success_callback: successCallBack,
            fail_callback: failCallBack,
        };
        OpenDataContextUtil.initCheckTimer();
        return methodId;
    }

    /**
     * 向子域请求好友排行榜信息
     * @param keyList
     * @param successCallBack
     * @param failCallBack
     * @returns {string}
     */
    static getFriendRankData(keyList, successCallBack, failCallBack) {
        var methodName = "getFriendRankData";
        var methodId = methodName + OpenDataContextUtil.methodIndex;
        var baseList = ["avatarUrl", "nickName"];
        for (var key in baseList) {
            if (keyList.indexOf(baseList[key]) < 0) {
                keyList.push(baseList[key].toString());
            }
        }
        // var openDataContext = wx.getOpenDataContext();
        // openDataContext.postMessage({
        //     method : 'getFriendRankData',
        //     data : {
        //         method_id: methodId,
        //         keyList : keyList
        //     }
        // });
        OpenDataContextUtil.methodCallDic[methodId] = {
            time: new Date().valueOf(),
            success_callback: successCallBack,
            fail_callback: failCallBack,
        };
        return methodId;
    }

    /**
     * 向子域请求获取群排行榜信息
     * @param keyList
     * @param shareTicket
     * @param successCallBack
     * @param failCallBack
     * @returns {string}
     */
    static getGroupRankData(keyList, shareTicket, successCallBack, failCallBack) {
        var methodName = "getFriendRankData";
        var methodId = methodName + OpenDataContextUtil.methodIndex;
        var baseList = ["avatarUrl", "nickName"];
        for (var key in baseList) {
            if (keyList.indexOf(baseList[key]) < 0) {
                keyList.push(baseList[key].toString());
            }
        }
        // var openDataContext = wx.getOpenDataContext();
        // openDataContext.postMessage({
        //     method : 'getGroupRankData',
        //     data : {
        //         method_id: methodId,
        //         shareTicket: shareTicket,
        //         keyList : keyList
        //     }
        // });
        OpenDataContextUtil.methodCallDic[methodId] = {
            time: new Date().valueOf(),
            success_callback: successCallBack,
            fail_callback: failCallBack,
        };
        return methodId;
    }
}
