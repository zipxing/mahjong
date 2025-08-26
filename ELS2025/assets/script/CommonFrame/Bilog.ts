/**
 * Created by xiaochuntian on 2018/5/2.
 */

import { LOGD, StateInfo, SystemInfo, UserInfo, tywx } from "./GlobalInit";
import { HttpUtil } from "./HttpUtil";
import { Util } from "./Util";

export var clickStatEventType = {
    /**
     * SystemInfo.errorLogServer = "https://clienterr.touch4.me/api/bilog5/clientlog"
     * SystemInfo.biLogServer = "https://cbi.touch4.me/api/bilog5/text"
     * 使用方法:
     * 将bilog.js加入工程后,在需要打点的地方调用BiLog.clickStat(事件id,[参数列表]);
     * 以下是由BI组规定的必须进行上报的打点,请各个项目组不要修改
     */
    clickStatEventTypeUserFrom: 99990001, //用户来源
    clickStatEventTypeUserShare: 99990002, //用户分享

    clickStatEventTypeWxLoginStart: 10001, //微信登录开始
    clickStatEventTypeWxLoginSuccess: 10002, //微信登录成功
    clickStatEventTypeWxLoginFailed: 10003, //微信登录失败

    clickStatEventTypeAuthorizationStart: 10004, //授权开始
    clickStatEventTypeAuthorizationSuccess: 10005, //授权成功
    clickStatEventTypeAuthorizationFailed: 10006, //授权失败

    clickStatEventTypeLoginSDKStart: 10007, //登录SDK开始
    clickStatEventTypeLoginSDKSuccess: 10008, //登录SDK成功
    clickStatEventTypeLoginSDKFailed: 10009, //登录SDK时失败

    clickStatEventTypeTCPStart: 10010, //TCP连接开始
    clickStatEventTypeTCPSuccess: 10011, //TCP连接成功
    clickStatEventTypeTCPFailed: 10012, //TCP连接失败

    /**
     * 请在下方添加游戏相关的具体打点,另起声明放在业务层也可以
     */
    /*
    clickStatEventTypeStageRecord : 10013,//记录玩家玩到了哪一关
    clickStatEventTypeScoreRecord : 10014,//记录玩家的经典模式下的得分
    clickStatEventTypeStartVS : 10015,//记录一局对战开始
    clickStatEventTypeEndVS : 10016,//记录一局对战结束
    clickStatEventTypeEndSingle : 10017,//记录一局闯关结束
    clickStatEventTypeSendQQH : 10018, //记录分享了一个悄悄话
    clickStatEventTypePassQQHStage : 10019, //记录通过了一个悄悄话关卡,全部通关可在数据上加个“passall"*/

    clickStatEventTypePassAllQQHStage: 10020, //悄悄话全部通关
    clickStatEventTypePassQQHStage: 10021, //悄悄话通关
    clickStatEventTypeEndSingleWin: 10022, //闯关胜利
    clickStatEventTypeEndSingleLose: 10023, //闯关失败
    clickStatEventTypeEndVSLoseNE: 10024, //对战失败未开分享开关
    clickStatEventTypeEndVSWin: 10025, //对战胜利
    clickStatEventTypeStartVSHome: 10026, //开始对战主页
    clickStatEventTypeStartVSRestart: 10027, //开始对战失败后重开
    clickStatEventTypeStartVSNext: 10028, //开始对战胜利后再来
    clickStatEventTypeEndVSLoseKeep: 10029, //对战失败保星
    clickStatEventTypeEndVSLoseNoKeep: 10030, //对战失败取消保星
};

export var BiLog = {
    /**
     * 上传实时log,富豪斗地主用此接口上传错误情况下的日志
     * @param logtxt:log内容
     */
    uploadLogTimely: function (logtxt) {
        if (!StateInfo.networkConnected) {
            LOGD("BiLog", "net error!");
            return;
        }
        if (logtxt) {
            var header = ["Content-Type:text/plain"];
            var configObj = {
                url: SystemInfo.errorLogServer + "?cloudname=" + SystemInfo.cloudId + "." + SystemInfo.intClientId,
                header: header,
                postData: logtxt,
                callback: null,
            };
            HttpUtil.httpPost(configObj, "POST");
        }
    },

    getSystemInfo: function () {
        this.cloud_id = SystemInfo.cloudId; //独立服务id
        this.rec_type = "1"; //日志类型
        this.rec_id = "0"; //日志记录id
        this.receive_time = "0"; // 日志接收时间  输出日志时统一填0，BI服务会在接收时添加
        this.user_id = UserInfo.userId || "0"; //用户id
        this.game_id = SystemInfo.gameId; //游戏id
        this.client_id = SystemInfo.clientId;
        this.device_id = Util.getLocalUUID(); //device id
        this.ip_addr = "#IP"; // ip地址	占位--服务器处理
        this.nettype = "0"; //网络状况
        this.phone_maker = "0"; //手机制造商
        this.phone_model = UserInfo.model; //手机型号
        this.phone_carrier = "0"; //手机运营商
        this.reserved = "0";
    },
    /*BI组打点
     参数1是事件id，参数2是[],内含扩展参数
     60001事件id
     在查询工具，cloud id+game id+事件id即可找到,GDSS有前端日志查询工具
     ty.BiLog.clickStat(ddz.StatEventInfo.DdzButtonClickInPlugin,
     [ddz.PluginHall.Model.statInfoType[scope.index],ddz.GameId]);

     // ty.BiLog.clickStat(hall5.BILogEvents.BILOG_EVENT_PLUGIN_UPDATE_SUCCESS,[hall5.BilogStatEvent.Plugin_Update_Success,gameid]);
     */
    uploadClickStatLogTimely: function (logtxt) {
        var callbackObj = this;
        if (logtxt != undefined && logtxt != "") {
            var header = ["Content-Type:text/plain"];
            var configObj = {
                url: SystemInfo.biLogServer,
                headers: header,
                postData: logtxt,
                obj: callbackObj,
                tag: null,
                callback: null,
            };
        }
        HttpUtil.httpPost(configObj, "POST");
    },

    /**
     * 打点接口
     * @param eventId      打点事件
     * @param ParamsList   额外参数,最多10位,参见bi组文档说明
     */
    clickStat: function (eventId, paramsList) {
        if (StateInfo.debugMode) {
            return;
        }
        paramsList = paramsList || [];
        var dyeparams = [];
        if (paramsList.length < 10) {
            for (var i = 0; i < 9; i++) {
                if (i < paramsList.length) {
                    dyeparams.push(paramsList[i]);
                } else {
                    dyeparams.push(0);
                }
            }
        } else {
            dyeparams = paramsList;
        }
        console.log("BI打点", "eventid= " + eventId + " 描述 = " + JSON.stringify(dyeparams));
        var bilog = this.assemblelog(eventId, dyeparams);
        this.uploadClickStatLogTimely(bilog + "\n");
    },

    /**
     * BIlog拼接
     * @param eventid
     * @param paramsarr
     * @returns {*}
     */
    assemblelog: function (eventid, paramsarr) {
        var time = new Date().getTime();
        if (time - this._timetag > 60000) {
            this._timetag = time;
            this.nettype = 0;
        }
        var paramstr = paramsarr.join("\t");

        this.getSystemInfo();
        var logStr =
            this.cloud_id +
            "\t" +
            this.rec_type +
            "\t" +
            time +
            "\t" +
            this.rec_id +
            "\t" +
            this.receive_time +
            "\t" +
            eventid +
            "\t" +
            this.user_id +
            "\t" +
            this.game_id +
            "\t" +
            this.client_id +
            "\t" +
            this.device_id +
            "\t" +
            this.ip_addr +
            "\t" +
            this.nettype +
            "\t" +
            this.phone_maker +
            "\t" +
            this.phone_model +
            "\t" +
            this.phone_carrier +
            "\t" +
            paramstr +
            "\t" +
            this.reserved;

        var str = this.trimTab0(logStr);
        return str;
    },

    /**
     * 精简上报字符串,结尾都是默认值的部分可以去掉,由BI接收端进行补齐
     * @param str
     * @returns {*}
     */
    trimTab0: function (str) {
        if (str == null || str == undefined) return "";
        var txt = str.replace(/(\t0)*$/, "");
        return txt;
    },
};
tywx["BiLog"] = BiLog;
