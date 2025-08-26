import { els } from "./els";

export var elsAiPolicyVS = {
    getMode(core) {
        core.ai_mode = (core.mcore.top_line > 10) ? "safe" : "normal";
    },
    "safe": {
        "init": 5000,
        "clear.line": [0, 6000, 7200, 10800, 14400],
        "fangcha": -0.5,
        "top.avg": -300,
        "hole": -2000,
        "combo": [300000, 2500],
        "xiagu.max": 2,
        "xiagu": -500
    },
    "normal": {
        "init": 5000,
        "clear.line": [0, -7000, -6400, 160, 240],
        "fangcha": -0.5,
        "top.avg": -30,
        "hole": -2500,
        "combo": [300000, 2500],
        "xiagu.max": 2,
        "xiagu": -500
    }
};

export var elsAiPolicyADV = {
    getMode(core) {
        core.ai_mode = (core.top_line > 10) ? "safe" : "normal";
    },
    "safe": {
        "init": 5000,
        "clear.line": [0, 6000, 7200, 10800, 14400],
        "fangcha": -0.5,
        "top.avg": -300,
        "hole": -2000,
        "combo": [300000, 2500],
        "xiagu.max": 1,
        "xiagu": -500
    },
    "normal": {
        "init": 5000,
        "clear.line": [0, 6000, 7200, 10800, 14400],
        "fangcha": -0.5,
        "top.avg": -30,
        "hole": -2500,
        "combo": [300000, 2500],
        "xiagu.max": 1,
        "xiagu": -500
    }
};

export var AIP = elsAiPolicyVS;
//var AIP = elsAiPolicyADV;

export class ElsAi {
    mActQueue: string;
    tActQueue: string;
    maxScore: number;
    work2idx: number;
    ms_scan: any[];
    constructor() {
        this.mActQueue = "";
        this.tActQueue = "";
        this.maxScore = 0;
        this.work2idx = -1;
    }

    //布局评分,用于AI计算最合理的摆法...
    getGridScore(tg, cx, cy, cf, nf, ccombo) {
        var core = tg.mcore;
        var aip = AIP[tg.ai_mode];
        var i, score = aip["init"], hole_count = 0, top_total = 0;
        var xiagu = new Array(els.HENG), xiagu_count = 0, xiagu_total = 0;
        //计算总空
        for (i = 0; i < els.HENG; i++) {
            hole_count += core.col_hole[i];
            top_total += core.col_top[i] * 10;
            xiagu[i] = 0;
            if (i == 0) {
                if (core.col_top[1] > core.col_top[0])
                    xiagu[i] = core.col_top[1] - core.col_top[0];
            } else if (i == els.HENG - 1) {
                if (core.col_top[i - 1] > core.col_top[i])
                    xiagu[i] = core.col_top[i - 1] - core.col_top[i];
            } else {
                if ((core.col_top[i + 1] > core.col_top[i]) &&
                    (core.col_top[i - 1] > core.col_top[i]))
                    xiagu[i] = Math.min(core.col_top[i - 1], core.col_top[i + 1]) - core.col_top[i];
            }
            if (xiagu[i] > 2)
                xiagu_count++;
            xiagu_total += xiagu[i];
        }

        //计算平均行高,计算行高方差
        var top_avg = top_total / els.HENG;
        var fangcha = 0;
        for (i = 0; i < els.HENG; i++) {
            var t = core.col_top[i] * 10 - top_avg;
            fangcha += (t * t);
        }

        //按方差评分
        score += fangcha * aip["fangcha"];

        //鼓励靠边...
        score += ((cx - 5) * (cx - 5) + (core.cur_x - 5) * (core.cur_x - 5)) * 5;

        //进攻模式不鼓励只消一两行，鼓励消掉两行以上
        score += aip["clear.line"][cf];
        score += aip["clear.line"][nf];

        //局面越低约均衡越好
        score += top_avg * aip["top.avg"];

        //空洞越少越好
        score += hole_count * aip["hole"];

        //连击加分
        if (ccombo > 2)
            score += ccombo * aip["combo"][0];
        else
            score += ccombo * aip["combo"][1];

        //连击加分
        if (core.combo > 2)
            score += core.combo * aip["combo"][0];
        else
            score += core.combo * aip["combo"][1];

        //峡谷越少越好，有一个大峡谷不怕，怕出现两个峡谷
        if (xiagu_count >= aip["xiagu.max"])
            score += aip["xiagu"] * xiagu_total;

        return score;
    }

    AI_F1(tg, cx, cy, cf, combo, fs, save?, scan?) {
        var b1 = tg.mcore.clone();
        var b2 = null, b3 = null;
        var bq = '', bq1 = '', bq2 = '';

        bq = this.tActQueue;
        var tmpz;
        if (els.ELS_CLASSIC)
            tmpz = els.ZCOUNT_C[tg.mcore.cur_block];
        else
            tmpz = els.ZCOUNT_NC[tg.mcore.cur_block];

        var tmpsave = save ? 1 : 0;

        for (var s2 = 0; s2 <= tmpsave; s2++) {
            tg.mcore.recycle();
            tg.mcore = b1.clone();
            this.tActQueue = bq;
            if (s2 != 0) {
                this.tActQueue += 'S';
                tg.saveBlk(true);
            }
            b2 = tg.mcore.clone();
            bq1 = this.tActQueue;

            for (var nz = 0; nz < tmpz; nz++) {
                tg.mcore.recycle();
                tg.mcore = b2.clone();
                this.tActQueue = bq1;
                //旋转
                for (var n = 0; n < nz; n++) {
                    this.tActQueue += 'T';
                    tg.moveBlk(els.TURN_CW, true);
                }

                b3 = tg.mcore.clone();
                bq2 = this.tActQueue;

                for (var x2 = 0; x2 < 3; x2++) {
                    tg.mcore.recycle();
                    tg.mcore = b3.clone();
                    this.tActQueue = bq2
                    //左移
                    if (x2 == 1)
                        while (tg.moveBlk(els.LEFT, true) != els.REACH_BORDER) {
                            this.tActQueue += 'L';
                            fs(this, tg, cx, cy, cf, combo, scan);
                        }
                    //右移
                    if (x2 == 2)
                        while (tg.moveBlk(els.RIGHT, true) != els.REACH_BORDER) {
                            this.tActQueue += 'R';
                            fs(this, tg, cx, cy, cf, combo, scan);
                        }
                    if (x2 == 0)
                        fs(this, tg, cx, cy, cf, combo, scan);
                }
                b3.recycle();
            }
            b2.recycle();
        }
        b1.recycle();
    }

    AI_F2(tai, tg, cxs, cys, cfs, combo, scan) {
        var cx, cy, cf, ccombo;
        var bq0 = '';

        //保存现场
        var b0 = tg.mcore.clone();
        bq0 = tai.tActQueue;

        //直接下落
        while (tg.moveBlk(els.DDOWN, true) != els.REACH_BOTTOM);
        tai.tActQueue += 'W';
        ccombo = tg.mcore.combo;
        cf = tg.mcore.fullrows.length;
        tg.clearRow(true);
        cx = tg.mcore.cur_x;
        cy = tg.mcore.cur_y;
        tg.nextBlk(true);
        tai.tActQueue += 'N';

        var s = tai.getGridScore(tg, cx, cy, cf, 0, combo);
        if (scan) {
            tai.ms_scan[tai.ms_scan.length] =
                [s, tai.tActQueue, tg.mcore, cx, cy, cf, ccombo];
        } else {
            if (s > tai.maxscore_scan)
                tai.AI_F1(tg, cx, cy, cf, ccombo, tai.AI_F3);
        }

        //恢复现场
        if (!scan) tg.mcore.recycle();
        tg.mcore = b0.clone();
        b0.recycle();
        tai.tActQueue = bq0;
    }

    AI_F3(tai, tg, cx, cy, cf, combo, scan) {
        var s, nf;
        var b;
        var bq = '';
        b = tg.mcore.clone();
        bq = tai.tActQueue;

        var mx = 0;
        for (var i = 0; i < 4; i++) {
            var xx = tg.mcore.cur_x + i;
            if (xx >= els.HENG)
                break;
            if (tg.mcore.col_top[xx] > mx)
                mx = tg.mcore.col_top[xx];
        }
        tg.moveBlk(els.SET, true);

        //直接下落
        while (tg.moveBlk(els.DDOWN, true) != els.REACH_BOTTOM);
        tai.tActQueue += 'W';
        nf = tg.mcore.fullrows.length;
        tg.clearRow(true);
        s = tai.getGridScore(tg, cx, cy, cf, nf, combo);
        if (s > tai.maxScore) {
            tai.mActQueue = tai.tActQueue;
            tai.mActQueue += 'N';
            tai.maxScore = s;
        }

        tg.mcore.recycle();
        tg.mcore = b.clone();
        b.recycle();
        tai.tActQueue = bq;
    }

    //如果自动运行动作序列为空则计算生成指令序列，否则返回动作指令  
    getAIAct(tg) {
        //return ''; //debug...
        var tai = this;
        var len = tai.mActQueue.length;
        var optN = 6;
        var minScore = -9000000000;

        //需要计算自动队列,第一帧先扫描第一块
        if (len == 0 && tai.work2idx < 0) {
            tai.maxScore = minScore;
            //保存现场
            var b = tg.mcore.clone();
            //遍历第一块获取分数和ms_scan列表
            tai.tActQueue = '';
            tg.clearRow(true);
            AIP.getMode(tg);
            tai.ms_scan = [];
            tai.AI_F1(tg, 0, 0, 0, 0, tai.AI_F2, false, true);
            //高分在前面
            tai.ms_scan.sort(function _(a, b) { return (b[0] - a[0]); });
            //console.log('AISORT'+tai.ms_scan.length+':'+tai.ms_scan);
            //删除并释放topN个最低分数
            if (tai.ms_scan.length > optN) {
                for (var i = 0; i < optN; i++) {
                    var tmp = tai.ms_scan.pop();
                    tmp[2].recycle();
                }
            }
            tai.work2idx = tai.ms_scan.length - 1;
            tg.mcore.recycle();
            tg.mcore = b.clone();
            b.recycle();
            return;
        }

        //针对ms_scan列表,进行第二块的遍历运算,每帧只算1个布局
        if (tai.work2idx >= 0) {
            var b = tg.mcore.clone();
            var m = tai.ms_scan[tai.work2idx];
            tg.mcore = m[2];
            tai.tActQueue = m[1];
            tai.AI_F1(tg, m[3], m[4], m[5], m[6], tai.AI_F3);
            tg.mcore.recycle();
            tg.mcore = b.clone();
            b.recycle();
            tai.work2idx -= 1;
            if (tai.work2idx == -1) tai.ms_scan = null;
            return;
        }

        //取走第一个动作码，返回
        var cret = tai.mActQueue[0];
        tai.mActQueue = tai.mActQueue.slice(1);
        return cret;
    }
}
