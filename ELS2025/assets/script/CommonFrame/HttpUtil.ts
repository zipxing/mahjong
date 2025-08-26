/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 10:11:26
 */

import { IsWechatPlatform, LOGD } from "./GlobalInit";

export var HttpUtil = {
    httpPost: function (cfgObj, httpType) {
        if (IsWechatPlatform()) {
            // wx.request({
            //     url : cfgObj.url,
            //     data : cfgObj.postData,
            //     header : cfgObj.header,
            //     method : 'POST',
            //     dataType : 'json',
            //     success : function (res) {
            //         if (res.statusCode == 200){
            //             //正常连接{"/api/bilog5/clientlog": "ok"}
            //             if (res.data && res.data.hasOwnProperty('/api/bilog5/clientlog')
            //                 && res.data['/api/bilog5/clientlog'] == "ok") {
            //                 LOGD('ty.HttpUtil.httpPost', 'post success! ');
            //             }
            //         }
            //         else{
            //             LOGD('ty.HttpUtil.httpPost', 'statusCode:' + res.statusCode);
            //         }
            //     },
            //     fail : function (res) {
            //         LOGD('ty.HttpUtil.httpPost', 'post error! ' + cfgObj.url);
            //     }
            // });
        }
    },

    httpGet: function (cfgObj, successcb, failcb) {
        if (IsWechatPlatform()) {
            LOGD("ty.HttpUtil.httpGet", "url:" + cfgObj.url);
            // wx.request({
            //     url : cfgObj.url,
            //     method : 'GET',
            //     success : function (res) {
            //         if (res.statusCode == 200){
            //             LOGD('ty.HttpUtil.httpGet', 'res:' + JSON.stringify(res.data));
            //             if(successcb) {
            //                 successcb(res.data);
            //             }
            //         }
            //         else{
            //             LOGD('ty.HttpUtil.httpGet', 'statusCode:' + res.statusCode);
            //         }
            //     },
            //     fail : function (res) {
            //         LOGD('ty.HttpUtil.httpGet', 'post error! ' + cfgObj.url);
            //         if(failcb) {
            //             failcb(res);
            //         }
            //     }
            // });
        }
    },
};
