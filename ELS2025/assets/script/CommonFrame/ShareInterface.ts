/**
 * Created by xiaochuntian on 2018/5/3.
 */

import { BiLog, clickStatEventType } from "./Bilog";
import { IsWechatPlatform, UserInfo } from "./GlobalInit";
import { PropagateInterface } from "./PropagateInterface";

export class ShareInterface {
    static OnShareAppMessageInfo: any = null; //右上角转发对应的分享点信息

    /**
     * 设置右上角"转发"对应的分享信息
     * @param title
     * @param imageUrl
     * @param sharePointId
     * @param shareSchemeId
     */
    static setOnShareAppMessageInfo(title, imageUrl, sharePointId, shareSchemeId) {
        this.OnShareAppMessageInfo = {
            title: title,
            imageUrl: imageUrl,
            sharePointId: sharePointId,
            shareSchemeId: shareSchemeId,
        };
    }

    /**
     * 获取右上角"转发"对应的分享信息
     * @returns {null}
     */
    static getOnShareAppMessageInfo() {
        return this.OnShareAppMessageInfo;
    }

    /**
     * 随机获取一个分享点作为"转发"对应的分享信息
     * @returns {*}
     */
    static getRandomOnShareAppMessageInfo() {
        var shareKeys = [];

        for (var _key in PropagateInterface.ShareConfig) {
            if (_key == "game_qqh_make" || _key == "game_qqh_win") {
                continue;
            }
            shareKeys.push(_key);
        }

        if (shareKeys && shareKeys.length > 0) {
            var randomIndex = Math.floor(Math.random() * 10000) % shareKeys.length;
            var sharePointKey = shareKeys[randomIndex];
            var sharePointInfo = PropagateInterface.ShareConfig[sharePointKey];
            if (sharePointInfo && sharePointInfo.length > 0) {
                randomIndex = Math.floor(Math.random() * 10000) % sharePointInfo.length;
                var config = {
                    title: sharePointInfo[randomIndex].shareContent,
                    imageUrl: sharePointInfo[randomIndex].sharePicUrl,
                    sharePointId: sharePointInfo[randomIndex].sharePointId,
                    shareSchemeId: sharePointInfo[randomIndex].shareSchemeId,
                };
                return config;
            }
        }
        return null;
    }

    /**
     * 根据分享信息调用分享接口,并封装了必要的打点和处理
     * @param _para :obj {
     * type: , //分享点类型
     *          game_qqh_win: 悄悄话通关
     *          game_keep_star: 对战保星
     *          game_share_add5: 闯关加5步
     *          game_share_del5: 对战减5行
     *          game_single_win: 闯关胜利
     *          game_vs_win: 对战胜利
     *          dellvery: 转发按钮
     *          game: 游戏内分享按钮
     *          hamepage: 主页分享按钮
     * imageUrl: "",
     * successCallback: func,
     * failCallback: func
     * }
     */
    static shareMsg(_para) {
        var _list = undefined;
        if (PropagateInterface.ShareConfig.hasOwnProperty(_para.type)) {
            _list = PropagateInterface.ShareConfig[_para.type];
        } else {
            console.log("_type not in shareConfig");
            return;
        }
        var randomIndex = Math.floor(Math.random() * 10000) % _list.length;
        var config = {
            title: _list[randomIndex].shareContent,
            imageUrl: _list[randomIndex].sharePicUrl,
            sharePointId: _list[randomIndex].sharePointId,
            shareSchemeId: _list[randomIndex].shareSchemeId,
        };
        let isForceShare2Group = true;

        this.share(
            config.title,
            config.imageUrl,
            config.sharePointId,
            config.shareSchemeId,
            _para.successCallback,
            _para.failCallback,
            _para.query,
            isForceShare2Group
        );
    }

    /**
     * 根据分享信息调用分享接口,并封装了必要的打点和处理
     * @param title
     * @param imageUrl
     * @param sharePointId
     * @param shareSchemeId
     * @param successCallback
     * @param failCallback
     * @param myquery
     * @param isFroceShare2Group 是否强制分享到群
     */
    static share(
        title,
        imageUrl,
        sharePointId,
        shareSchemeId,
        successCallback,
        failCallback,
        myquery,
        isFroceShare2Group
    ) {
        if (IsWechatPlatform()) {
            BiLog.clickStat(clickStatEventType.clickStatEventTypeUserShare, [sharePointId, 1, shareSchemeId]);
            var _query =
                "inviteCode=" +
                UserInfo.userId +
                "&sourceCode=" +
                sharePointId +
                "&inviteName=" +
                UserInfo.userName +
                "&imageType=" +
                shareSchemeId;
            //if(myquery) _query = _query+ "&" + myquery;
            if (myquery) _query = myquery;
            console.log("QQQQQQ..." + _query);
            // wx.shareAppMessage({
            //     title: title,
            //     imageUrl : imageUrl,
            //     query : _query,
            //     success  (result) {
            //         console.log('分享成功',result);
            //         if(isFroceShare2Group){ //! 强制分享到群
            //             if(result['shareTickets']){ //! 分享到群
            //                 if(successCallback){
            //                     successCallback();
            //                 }
            //                 BiLog.clickStat(clickStatEventType.clickStatEventTypeUserShare,[sharePointId, 2, shareSchemeId]);
            //             }
            //             else{
            //                 //! toast 请分享到群
            //                 wx.showToast({
            //                     title: '请分享到群',
            //                     duration: 1000,
            //                     icon: null
            //                 });
            //                 if(failCallback){
            //                     failCallback();
            //                 }
            //             }
            //         }
            //         else{
            //             if(successCallback){
            //                 successCallback();
            //             }
            //             BiLog.clickStat(clickStatEventType.clickStatEventTypeUserShare,[sharePointId, 2, shareSchemeId]);
            //         }

            //     }
            //     fail  (result) {
            //         console.log('分享失败',result);
            //         //分享失败相关处理
            //         if(failCallback) {
            //             failCallback();
            //         }
            //     }
            //     complete  () {
            //     }
            // });
        }
    }
}

export var onShareAppMessageInit = function () {
    if (IsWechatPlatform()) {
        // wx.onShareAppMessage(function (result) {
        //     /**
        //      * 获取转发信息,手动设置过则使用设置信息,否则随机获取一个分享点信息
        //      */
        //     var config = ShareInterface.getOnShareAppMessageInfo();
        //     if(config == null) {
        //         config = ShareInterface.getRandomOnShareAppMessageInfo();
        //     }
        //     BiLog.clickStat(clickStatEventType.clickStatEventTypeUserShare,[config.sharePointName, 1, config.shareSchemeId]);
        //     return {
        //         title: config.title,
        //         imageUrl : config.imageUrl,
        //         query : "inviteCode="+UserInfo.userId+"&sourceCode="+config.sharePointId+"&inviteName="+UserInfo.userName+"&imageType="+config.shareSchemeId,
        //         success  (shareTickets,groupMsgInfos) {
        //             BiLog.clickStat(clickStatEventType.clickStatEventTypeUserShare,[config.sharePointName, 2, config.shareSchemeId]);
        //         }
        //         fail  () {
        //         }
        //         complete  () {
        //         }
        //     }
        // });
    }
};
onShareAppMessageInit();
window["tywx"]["onShareAppMessageInit"] = onShareAppMessageInit;
