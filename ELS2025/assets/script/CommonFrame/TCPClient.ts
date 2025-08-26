/**
 * 微信小程序下TCP长连接使用websocket实现
 */

import { director } from "cc";
import { BiLog, clickStatEventType } from "./Bilog";
import { EncodeDecode } from "./EncodeDecode";
import { EventType } from "./EventType";
import { IsWechatPlatform, StateInfo, SystemInfo, LOGD } from "./GlobalInit";
import { NotificationCenter } from "./NotificationCenter";
import { Timer } from "./Timer";

export class TCPClient {
    TAG: string = "TCP client";
    CONNECT_STATUS_OK: number = 1;
    CONNECT_STATUS_OPENING: number = 2;
    CONNECT_STATUS_CLOSING: number = 3;
    CONNECT_STATUS_FAIL: number = 0;
    connectStatus: number = 0;
    isTimerInited: boolean = false;
    tickCount: number = 0;
    filterCmds: string[] = ["heart_beat"];

    /**
     * 该方法包含了心跳和tcp状态检查两项功能,结合connect中的逻辑,是一个无限重试的机制
     */
    timerSchedule() {
        this.tickCount = (this.tickCount + 1) % 3;
        if (this.tickCount == 2 && this.connectStatus == this.CONNECT_STATUS_OK) {
            //每3秒发送心跳
            //hall.MsgFactory.sendHeartBeat();
            //监听者进行具体的协议实现
            NotificationCenter.trigger(EventType.SEND_HEART_BEAT);
        }

        // 每1秒检查一下长连接，如果不通，则重连。
        this.reconnet();
    }
    private tcpTimerkey: number;
    startCheckTimer() {
        this.isTimerInited = true;
        this.tcpTimerkey = setInterval(() => {
            this.timerSchedule();
        }, 1000);
        // Timer.setTimer(director, this.timerSchedule, 1);
    }

    stopCheckTimer() {
        this.isTimerInited = false;
        if (this.tcpTimerkey) {
            clearInterval(this.tcpTimerkey);
        }
        // Timer.cancelTimer(director, this.timerSchedule);
    }

    //以下为websocket连接相关方法
    connect(url) {
        BiLog.clickStat(clickStatEventType.clickStatEventTypeTCPStart, [url]);
        if (this.connectStatus == this.CONNECT_STATUS_OPENING || this.connectStatus == this.CONNECT_STATUS_OK) {
            return;
        }

        this.connectStatus = this.CONNECT_STATUS_OPENING;
        if (IsWechatPlatform()) {
            this.doWechatConnect(url);
        }
    }

    doWechatConnect(url) {
        if (!IsWechatPlatform()) {
            return;
        }
        // wx.connectSocket({
        //     url: url
        // });

        // wx.onSocketOpen(function(res) {
        //     LOGD(this.TAG, 'TCP webSocket opened...');
        //     this.connectStatus = this.CONNECT_STATUS_OK;

        //     NotificationCenter.trigger(EventType.TCP_OPENED);
        //     BiLog.clickStat(clickStatEventType.clickStatEventTypeTCPSuccess, [url]);
        //     if (!this.isTimerInited) {
        //         //启动TCP的定时检查机制,成功连接1次后将永久进行检查
        //         this.startCheckTimer();
        //     }
        // });

        // wx.onSocketError(function(res) {
        //     LOGD(this.TAG, 'TCP webSocket error...');
        //     BiLog.clickStat(clickStatEventType.clickStatEventTypeTCPFailed, [url]);

        //     this.connectStatus = this.CONNECT_STATUS_FAIL;
        //     NotificationCenter.trigger(EventType.TCP_ERROR);
        // });

        // wx.onSocketClose(function(res) {
        //     LOGD(this.TAG, 'WebSocket 已关闭！');
        //     this.connectStatus = this.CONNECT_STATUS_FAIL;
        //     NotificationCenter.trigger(EventType.TCP_CLOSE);
        // });

        // wx.onSocketMessage(function(res) {
        //     if (!StateInfo.isOnForeground){
        //         //在后台不处理消息
        //         return;
        //     }
        //     // 处理长连接的消息
        //     var content = this.decodeMessage(res["data"]);
        //     if (content == null || content == '0000') {
        //         return;
        //     }

        //     var msgStr = "[Receive TCP Msg]: " + unescape(content.replace(/\\u/gi,'%u'));
        //     var strJson = content.substr(0, content.length - 0);
        //     if (strJson != null && strJson.length > 0) {
        //         var _json = JSON.parse(strJson);
        //         if (this.filterCmds.indexOf(_json.cmd) == -1){
        //             LOGD(this.TAG, msgStr);
        //         }

        //         NotificationCenter.trigger(EventType.TCP_RECEIVE, _json);
        //     }

        // });
    }

    decodeMessage(msg) {
        if (typeof ArrayBuffer != "undefined" && msg instanceof ArrayBuffer) {
            var databytes = new Uint8Array(msg);
            var content = "";
            for (var i = 0, len = databytes.length; i < len; i++) {
                var tmpc = String.fromCharCode(databytes[i]);
                content += tmpc;
            }
            return content;
        }
        var data = EncodeDecode.base64Decode(msg);
        var mask = data.slice(0, 4);
        data = data.slice(4);
        for (var i = 0, len = data.length; i < len; i++) {
            var charcode = data[i];
            charcode ^= mask[i % 4];
            data[i] = charcode;
        }
        var result = EncodeDecode.utf8Decode(data);
        return result;
    }

    reconnet() {
        if (!StateInfo.isOnForeground) {
            //在后台不重连(IOS会出问题)
            return;
        }
        if (this.connectStatus == this.CONNECT_STATUS_FAIL) {
            NotificationCenter.trigger(EventType.TCP_RECONNECT);
            this.connect(SystemInfo.webSocketUrl);
        }
    }

    sendMsg(data) {
        if (this.connectStatus != this.CONNECT_STATUS_OK) {
            return;
        }

        var msgStr = JSON.stringify(data);
        if (this.filterCmds.indexOf(data.cmd) == -1) {
            LOGD(this.TAG, "TCP sendMsg:" + msgStr);
        }

        if (IsWechatPlatform()) {
            // wx.sendSocketMessage({
            //     data:msgStr,
            //     success(params){
            //         LOGD(this.TAG, 'TCP sendMsg success:' + JSON.stringify(arguments));
            //     },
            //     fail(params) {
            //         var errMsg = arguments[0];
            //         if (errMsg && errMsg['errMsg'] === 'sendSocketMessage:fail taskID not exist'){
            //             wx.closeSocket();
            //             this.connectStatus = this.CONNECT_STATUS_FAIL;
            //         }
            //         LOGD(this.TAG, 'TCP sendMsg fail:' + JSON.stringify(arguments));
            //     },
            //     complete(params) {
            //     }
            // });
        }
    }

    close() {
        this.connectStatus = this.CONNECT_STATUS_CLOSING;
        if (IsWechatPlatform()) {
            //@ts-ignore
            wx.closeSocket();
        }
        this.stopCheckTimer();
        LOGD(this.TAG, "TCP close..............");
    }
}
