/*
 * @Date: 2023-08-28 11:43:25
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 14:15:23
 */
import { els } from "./els";

export class ElsConfig {
    isreplay: boolean;
    isWhisper: boolean;
    canRun: boolean;
    mode: any;
    constructor() {
        this.isreplay = false;
        this.isWhisper = false;
        this.canRun = true;
        this.mode = els.ELS_MODE_SINGLE;
        //this.mode=els.ELS_MODE_AI;
    }
}
