/*
 * @Date: 2023-08-28 11:43:19
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 17:15:02
 */
import { els } from "./els";

export class ElsStat {
    combo_total: number;
    combo_max: number;
    combo_current: number;
    level: number;
    score: number;
    clear_lines: number;
    isKO: boolean;
    constructor() {
        this.combo_total = 0;
        this.combo_max = 0;
        this.combo_current = 0;
        this.level = 0;
        this.score = 0;
        this.clear_lines = 0;
        this.isKO = false;
    }
    addScore(s) {
        this.score += s;
        for (var i = 0; i < els.UPGRADE_STANTARD.length; i++) {
            if (this.score <= els.UPGRADE_STANTARD[i + 1] && this.score >= els.UPGRADE_STANTARD[i]) {
                this.level = i;
                break;
            }
        }
    }
}
