/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 10:17:58
 */
/**
 * Created by xiaochuntian on 2018/5/3.
 */

export var EventType = {
    // tcp状态的事件
    TCP_ERROR: "tcp_error",
    TCP_CLOSE: "tcp_close",
    TCP_OPENED: "tcp_opened", // 连接建立好之后的回调
    TCP_RECONNECT: "tcp_reconnect",
    TCP_RECEIVE: "tcp_receive", //长连接接收任何消息的事件

    SDK_LOGIN_SUCCESS: "sdk_login_success",
    SDK_LOGIN_FAIL: "sdk_login_fail",
    WEIXIN_LOGIN_SUCCESS: "weixin_login_success",
    WEIXIN_LOGIN_FAIL: "weixin_login_fail",

    GET_USER_FEATURE_SUCCESS: "GET_USER_FEATURE_SUCCESS",
    GET_USER_FEATURE_FAIL: "GET_USER_FEATURE_FAIL",
    GET_SHARE_CONFIG_SUCCESS: "GET_SHARE_CONFIG_SUCCESS",
    GET_SHARE_CONFIG_FAIL: "GET_SHARE_CONFIG_FAIL",

    GET_OPEN_DATA_RESULT_SUCCESS: "GET_OPEN_DATA_RESULT_SUCCESS",
    GET_OPEN_DATA_RESULT_FAIL: "GET_OPEN_DATA_RESULT_FAIL",
    GET_OPEN_DATA_RESULT_TIMEOUT: "GET_OPEN_DATA_RESULT_TIMEOUT",

    SEND_HEART_BEAT: "SEND_HEART_BEAT",
    GAME_SHOW: "GAME_SHOW",
    GAME_HIDE: "GAME_HIDE",
    START_AUTHORIZATION_SUCCESS: "START_AUTHORIZATION_SUCCESS", //授权成功
    START_AUTHORIZATION_FAILED: "START_AUTHORIZATION_FAILED", //授权失败


};
window["tywx"] = EventType;
