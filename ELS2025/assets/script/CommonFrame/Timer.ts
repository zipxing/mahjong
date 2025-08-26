/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 10:48:49
 */
/**
 * 对scheduler进行封装
 */

import { director, macro } from "cc";
import { LOGD } from "./GlobalInit";

export class Timer {
    /**
     * 开始定时器
     * 参数的含义依次是：回调的obj、回调函数、tick的间隔、不算这次还要重复的次数，开始tick的delay时间
     * @param {[type]}   obj       [description]
     * @param {Function} callback  [description]
     * @param {[type]}   interval  [description]
     * @param {[type]}   repeatNum [description]
     * @param {[type]}   delay     [description]
     */
    static setTimer(obj, callback, interval, repeatNum?, delay?) {
        if (obj && obj._TAG) {
            LOGD("Timer", "----------in setTimer----------" + (obj._TAG ? obj._TAG : ""));
        }
        var scheduler = director.getScheduler();
        // 直接屏蔽paused
        var paused = false;
        var times = null != repeatNum ? repeatNum : macro.REPEAT_FOREVER;
        scheduler.schedule(callback, obj, interval, repeatNum, delay, paused);
    }

    /**
     * 取消定时器
     * @param  {[type]}   obj      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    static cancelTimer(obj, callback) {
        // 这个类在jsb_cocos2dx_auto_api.js中可以找到
        if (obj && obj._TAG) {
            LOGD("Timer", "----------in cancelTimer ---------" + (obj._TAG ? obj._TAG : ""));
        }
        var scheduler = director.getScheduler();
        scheduler.unschedule(callback, obj);
    }
    static isScheduledTimer(obj, callback) {
        // 这个类在jsb_cocos2dx_auto_api.js中可以找到
        if (obj && obj._TAG) {
            LOGD("Timer", "----------in isScheduledTimer ---------" + (obj._TAG ? obj._TAG : ""));
        }
        var scheduler = director.getScheduler();
        return scheduler.isScheduled(callback, obj);
    }
}
