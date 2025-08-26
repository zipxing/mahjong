/*
 * @Date: 2023-08-28 11:43:14
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 15:34:48
 */
import { nge } from "./engine";

export class ElsTimer extends nge.Timer {
    ready_wending: number;
    constructor() {
        super();
        this.ready_wending = 0;
    }
}
