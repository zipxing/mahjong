/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 10:59:52
 */
/**
 * Created by xiaochuntian on 2018/5/2.
 */

import { sys } from "cc";
import { LOGE, tywx } from "./GlobalInit";

export class Util {
    static isSceneQrCode(scene) {
        var qrCodeList = [1047, 1048, 1049]; //扫描小程序码,选取小程序码,识别小程序码
        return qrCodeList.indexOf(scene) > -1;
    }

    static createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "";

        var uuid = s.join("");
        return uuid;
    }

    static getLocalUUID() {
        var local_uuid = Util.getItemFromLocalStorage("LOCAL_UUID_KEY", "");
        if (!local_uuid) {
            local_uuid = Util.createUUID();
            Util.setItemToLocalStorage("LOCAL_UUID_KEY", local_uuid);
        }
        return local_uuid;
    }

    static getItemFromLocalStorage(keyStr, defaultValue) {
        if (!sys.localStorage.getItem) {
            return defaultValue;
        }
        var tmp = sys.localStorage.getItem(keyStr);
        if (!tmp) {
            return defaultValue;
        }
        return String(tmp);
    }

    static setItemToLocalStorage(keyStr, ValueStr) {
        try {
            sys.localStorage.setItem(keyStr, ValueStr + "");
        } catch (e) {
            LOGE("Util", "setItemToLocalStorage fail");
        }
    }
}
