import { ElsCore } from "./ElsCore";
import { ElsStat } from "./ElsStat";
import { ElsTimer } from "./ElsTimer";
import { els } from "./els";
import { nge } from "./engine";

//玩家区域网格,关键变量,以及核心处理逻辑
export class ElsGrid {
    mod: any;
    mcore: ElsCore;
    corecls: any;
    mtimer: any;
    mstat: any;
    isActive: boolean;
    mQueue = [];
    mBlkDat: any;
    index: any;
    needdraw: boolean;
    fangcha: any[];
    mconf: any;
    constructor(mod, i) {
        this.mod = mod;
        this.mcore = new ElsCore();
        this.corecls = ElsCore;
        this.mtimer = new ElsTimer();
        this.mstat = new ElsStat();
        this.isActive = false;
        this.mQueue = [];
        this.mBlkDat = null;
        this.index = i;
        this.needdraw = true;
    }

    //用于冒险模式设置10x10地图
    setBmp(bmp) {
        for (var i = 0; i < els.ZONG; i++) {
            for (var j = 0; j < els.HENG; j++) {
                this.mcore.grid[i * els.GRIDW + 2 + j] =
                    i >= els.ZONG - els.HENG ? 100 + bmp[i - (els.ZONG - els.HENG)][j] : 0;
                if (this.mcore.grid[i * els.GRIDW + 2 + j] == 100) {
                    this.mcore.grid[i * els.GRIDW + 2 + j] = 0;
                }
            }
        }
    }

    //用于AI模式设置难度
    setLevel(nandu) {
        this.mstat.level = nandu;
    }

    //设置方块类别，目前支持经典和非经典两种，参考block.h
    setBlkDat(bd) {
        this.mBlkDat = bd;
    }

    //设置方块序列
    setQueue(queue) {
        this.mQueue = queue;
        console.log("mq in setqueue..." + queue);
    }

    //重置数据，每局开始调用
    reset() {
        var tgrid = this; //必须用局部变量保存起来供回调时使用，回调时不能用this
        this.mcore = new ElsCore();
        this.mtimer = new ElsTimer();
        this.mtimer.setup("next-block", 0.8);
        this.mtimer.setup("clear-row", 0.3, function () {
            if (0 == tgrid.index) {
                tgrid.mod.playMusic(els.ELS_VOICE.CLEAR_MUSI, false);
            }

            tgrid.clearRow(false);
        });
        this.mtimer.setup("game-over", 0.12, function () {
            console.log("OVER" + tgrid.index);
            tgrid.mcore.game_over = true;
            //if(tgrid.index==1)
            //    process.exit(1);
        });
        this.mtimer.setup("fall", 0.01, function () {
            tgrid.fall();
        });
        this.mtimer.setup("combo", 0.8);
        this.mtimer.setup("attack", 0.8);

        //设置初始grid.边框置为200，限制方块活动范围
        for (var i = 0; i < els.ZONG + 2; i++)
            for (var j = 0; j < els.HENG + 4; j++) this.mcore.grid[i * els.GRIDW + j] = 200;
        for (var i = 0; i < els.ZONG; i++)
            for (var j = 0; j < els.HENG; j++) this.mcore.grid[i * els.GRIDW + 2 + j] = 0;

        //初始化各种变量
        this.mcore.cur_block = this.mQueue[0];
        this.mcore.next_block = this.mQueue[1];
        this.mcore.save_block = -1;
        this.mcore.save_lock = false;
        this.mcore.cur_x = 5;
        this.mcore.cur_y = 0;
        this.mcore.cur_z = 0;
        this.mcore.game_over = false;
        this.mcore.block_index = 0;
        this.mcore.game_result = 0;

        //计算初始col,hole,top
        //UpdateColHoleTop(2, 11);

        //用于判断用户是否主动放弃
        this.fangcha = [];
    }

    //下一块
    nextBlk(ai, issave?) {
        //console.log("NEXT>>>>>>>>");
        if (!ai) {
            if (this.index == 0) {
                this.mod.tou._maxDAct = 0;
                this.mod.tou._maxRLAct = 0;
            }
            this.mstat.addScore(10);
        }
        this.mcore.block_index++;
        this.mcore.cur_block = this.mcore.next_block;
        if (!issave) this.mtimer.trigger("next-block", 0.8);
        this.mcore.cur_x = 5;
        this.mcore.cur_y = 0;
        this.mcore.cur_z = 0;
        this.moveBlk(els.SET, ai);
        this.mcore.next_block = this.mQueue[(this.mcore.block_index + 1) % els.MAXBLKQUEUE];

        if (!ai && this.index == 0) this.fangcha[this.mcore.block_index] = this.calcFangCha();
    }

    calcFangCha() {
        //计算总空
        var top_total = 0;
        for (var i = 0; i < els.HENG; i++) {
            top_total += this.mcore.col_top[i] * 10;
        }

        //计算平均行高,计算行高方差
        var top_avg = top_total / els.HENG;
        var fangcha = 0;
        for (i = 0; i < els.HENG; i++) {
            var t = this.mcore.col_top[i] * 10 - top_avg;
            fangcha += t * t;
        }

        return fangcha;
    }

    isUserGiveup() {
        // 先计算一下方差,看看是不是用户自己放弃了
        var giveup = false;

        // 当前方差
        var curfangcha = this.fangcha[this.fangcha.length - 1];
        // 5步之前的方差
        var step = 0;
        if (this.fangcha.length > 5) step = this.fangcha.length - 6;
        var prefangcha = this.fangcha[step];
        if (curfangcha > 13000 || Math.abs(curfangcha - prefangcha) > 7000) giveup = true;

        return giveup;
    }

    //暂存块,每次确认下落后才能再次存(save_lock)
    saveBlk(ai) {
        if (!this.mcore.save_lock) {
            this.mcore.save_lock = true;
            this.moveBlk(els.CLEAR, ai);
            if (this.mcore.save_block >= 0) {
                var blktmp = this.mcore.cur_block;
                this.mcore.cur_block = this.mcore.save_block;
                this.mcore.save_block = blktmp;
                this.mcore.cur_x = 5;
                this.mcore.cur_y = 0;
                this.mcore.cur_z = 0;
                this.moveBlk(els.SET, ai);
            } else {
                this.mcore.save_block = this.mcore.cur_block;
                this.nextBlk(ai, false);
            }
            //触发保存块动画
            this.mtimer.save_block = 10;
        }
    }

    //消除最底下三行
    clearThreeBottomLines() {
        if (this.index != 0) return;

        for (var i = els.ZONG - 5; i < els.ZONG; i++) {
            for (var j = 2; j < els.HENG + 2; j++) {
                this.mcore.grid[i * els.GRIDW + j] = 101 + (Math.floor(Math.random() * 1000) % 6);
            }
        }

        this.mcore.fullrows = [16, 17, 18, 19, 20];
        //this.clearRow(false);
        this.mtimer.trigger("clear-row", nge.nge._clone(this.mcore.fullrows));
    }

    clearRow(ai) {
        if (!ai) {
            //console.log("CLEAR ROW"+this.mcore.fullrows.length);
            if (this.mtimer.getstat("game-over")) {
                //console.log("cancel over...");
                this.mtimer.cancel("game-over");
                this.mcore.game_over = false;
            }
        }

        this.mstat.clear_lines += this.mcore.fullrows.length;
        if (this.mcore.fullrows.length % 100) {
            var i, j, n;
            for (n = 0; n < this.mcore.fullrows.length % 100; n++) {
                for (i = this.mcore.fullrows[n]; i >= 0; i--) {
                    for (j = 0; j < els.HENG; j++) {
                        if (i) {
                            if (
                                this.mcore.grid[(i - 1) * els.GRIDW + j + 2] > 100 ||
                                this.mcore.grid[(i - 1) * els.GRIDW + j + 2] == 0
                            ) {
                                if (
                                    !(
                                        this.mcore.grid[i * els.GRIDW + j + 2] < 10 &&
                                        this.mcore.grid[i * els.GRIDW + j + 2] > 0
                                    )
                                )
                                    this.mcore.grid[i * els.GRIDW + j + 2] =
                                        this.mcore.grid[(i - 1) * els.GRIDW + j + 2];
                            } else if (
                                !(
                                    this.mcore.grid[i * els.GRIDW + j + 2] < 10 &&
                                    this.mcore.grid[i * els.GRIDW + j + 2] > 0
                                )
                            ) {
                                this.mcore.grid[i * els.GRIDW + j + 2] = 0;
                            }
                        } else {
                            if (
                                !(
                                    this.mcore.grid[i * els.GRIDW + j + 2] < 10 &&
                                    this.mcore.grid[i * els.GRIDW + j + 2] > 0
                                )
                            )
                                this.mcore.grid[i * els.GRIDW + j + 2] = 0;
                        }
                    }
                }
                this.mcore.fullrows[n] = 0;
            }
            this.updateColHoleTop(2, 11);
        }
        this.mcore.fullrows.length = 0;
    }

    fall() {
        do {
            if (this.mcore.game_over) break;
        } while (this.moveBlk(els.DDOWN, false) != els.REACH_BOTTOM);
        this.nextBlk(false);
        console.log("fall调用testDDown");
        this.testDDown();
    }

    updateColHoleTop(gxs, gxe) {
        var m, n;
        for (m = gxs; m <= gxe; m++) {
            this.mcore.col_top[m - 2] = 0;
            this.mcore.col_hole[m - 2] = 0;
            for (n = els.ZONG; n > 0; n--) {
                if (this.mcore.grid[(els.ZONG - n) * els.GRIDW + m] > 100) {
                    this.mcore.col_top[m - 2] = n;
                    break;
                }
            }
            for (; n > 0; n--) {
                if (this.mcore.grid[(els.ZONG - n) * els.GRIDW + m] == 0) this.mcore.col_hole[m - 2] += n;
            }
        }
        this.mcore.top_line = 0;
        for (m = 0; m < els.HENG; m++)
            if (this.mcore.col_top[m] > this.mcore.top_line) this.mcore.top_line = this.mcore.col_top[m];

        //检测紧急模式

        // this.mod.checkEmergency();
    }

    //用于预先绘制下落到底部的虚影，用于更好的瞄准
    testDDown() {
        // console.log("=== testDDown 开始执行 ===");
        // console.log("当前方块位置: x=" + this.mcore.cur_x + ", y=" + this.mcore.cur_y);
        var x, y;
        var tmp = this.mcore.clone();
        while (this.moveBlk(els.DDOWN, true) != els.REACH_BOTTOM);
        (x = this.mcore.cur_x), (y = this.mcore.cur_y);
        // console.log("计算的虚影位置: x=" + x + ", y=" + y);
        this.mcore.recycle();
        this.mcore = tmp.clone();
        tmp.recycle();
        (this.mcore.tdx = x), (this.mcore.tdy = y);
        // console.log("设置虚影位置: tdx=" + this.mcore.tdx + ", tdy=" + this.mcore.tdy);
        // console.log("=== testDDown 执行完成 ===");
        return 0;
    }

    //操作方块,更新Grid
    moveBlk(dir, ai) {
        var i, j, m, n, fflag;

        if (this.mcore.game_over) {
            if (dir == els.LEFT || dir == els.RIGHT) return els.REACH_BORDER;
            else return els.REACH_BOTTOM;
        }

        if (!ai) this.needdraw = true;

        var type = this.mcore.cur_block;
        var cx = this.mcore.cur_x;
        var cy = this.mcore.cur_y;
        var cz = this.mcore.cur_z;
        var x = 0,
            y = 0,
            z = 0;

        switch (dir) {
            case els.TURN_CW:
                x = cx;
                y = cy;
                z = (cz + 5) % 4;
                this.mtimer.ready_wending = els.WENDING;
                break;
            case els.TURN_CCW:
                x = cx;
                y = cy;
                z = (cz + 3) % 4;
                this.mtimer.ready_wending = els.WENDING;
                break;
            case els.DOWN:
            case els.DDOWN:
                (x = cx), (y = cy + 1), (z = cz);
                break;
            case els.LEFT:
                (x = cx - 1), (y = cy), (z = cz);
                this.mtimer.ready_wending = els.WENDING;
                break;
            case els.RIGHT:
                (x = cx + 1), (y = cy), (z = cz);
                this.mtimer.ready_wending = els.WENDING;
                break;
            case els.SET:
                (x = cx), (y = cy), (z = cz);
                break;
            case els.CLEAR:
                (x = cx), (y = cy), (z = cz);
                break;
        }

        //不稳定块置0,100以上为已经下落稳定的块
        for (i = 0; i < 4; i++)
            for (j = 0; j < 4; j++)
                if (this.isInGrid(cy + i, cx + j) && this.mcore.grid[(cy + i) * els.GRIDW + cx + j] < 100)
                    this.mcore.grid[(cy + i) * els.GRIDW + cx + j] = 0;

        if (dir == els.CLEAR) return els.NORMAL; //清除漂浮的块

        for (i = 0; i < 4; i++) {
            for (j = 0; j < 4; j++) {
                //检测到了碰撞,可能是到底,到边,或者遇到了别的块,无法下落
                if (this.mcore.grid[(y + i) * els.GRIDW + x + j] && this.mBlkDat[type][z][i * 4 + j]) {
                    var gv = this.mcore.grid[(y + i) * els.GRIDW + x + j];
                    var mv = this.mBlkDat[type][z][i * 4 + j];
                    //if(!ai) console.log("CCC"+this.index+"..y+i="+(y+i)+" x+j="+(x+j)+" type="+type+" z="+z+" i="+i+" j="+j+" gv="+gv+" mv="+mv);
                    if (dir == els.DOWN || dir == els.DDOWN) {
                        if (dir == els.DOWN) {
                            //普通下落（非直落）还没粘住的情况
                            if (this.mtimer.ready_wending >= 0) {
                                //触发UpdateELS开始对ready_wending计数
                                if (this.mtimer.ready_wending == els.WENDING) this.mtimer.ready_wending--;
                                for (m = 0; m < 4; m++) {
                                    for (n = 0; n < 4; n++) {
                                        if (this.isInGrid(cy + m, cx + n) && this.mBlkDat[type][z][m * 4 + n])
                                            this.mcore.grid[(cy + m) * els.GRIDW + cx + n] =
                                                this.mBlkDat[type][z][m * 4 + n];
                                    }
                                }
                                return els.READY_BOTTOM;
                            } else {
                                this.mtimer.ready_wending = els.WENDING;
                            }
                        }

                        //加100设置为稳定块，并统计需要显示粘住光晕的块位置
                        if (!ai) {
                            this.mcore.cling_blocks.length = 0;
                        }
                        for (m = 0; m < 4; m++) {
                            for (n = 0; n < 4; n++) {
                                if (this.isInGrid(cy + m, cx + n) && this.mBlkDat[type][z][m * 4 + n]) {
                                    this.mcore.grid[(cy + m) * els.GRIDW + cx + n] =
                                        100 + this.mBlkDat[type][z][m * 4 + n]; //加100,置为稳定块
                                    if (!ai) {
                                        if (this.mcore.grid[(cy + m) * els.GRIDW + cx + n] != 100) {
                                            //纪录下需要显示“粘住光晕”的块坐标及个数
                                            this.mcore.cling_blocks[this.mcore.cling_blocks.length] = new nge.Point(
                                                cx + n - 2,
                                                cy + m
                                            );
                                            //this->GenItem(idx, gp, cy+m, cx+n); //随机产生道具
                                        }
                                    }
                                }
                            }
                        }
                        //触发粘住光晕动画...
                        //CALLUI cling block animation...
                        /*if (m_pElSModel->mcore[idx].cling_count>0 && idx==0) 
                          m_pPlayAreas[idx]->New_lighting();*/

                        this.updateColHoleTop(2, 11);

                        //标注满行，检测满行信息 标记到fullrow里 同时标记full_rows_count
                        //扫描判断满行,放入fullrows数组
                        for (m = 0; m < 4; m++) {
                            fflag = true;
                            for (n = 0; n < els.HENG; n++) {
                                if (this.isInGrid(cy + m, n + 2)) {
                                    if (
                                        this.mcore.grid[(cy + m) * els.GRIDW + n + 2] < 100 ||
                                        this.mcore.grid[(cy + m) * els.GRIDW + n + 2] == 200
                                    ) {
                                        fflag = false;
                                        break;
                                    }
                                }
                            }
                            if (fflag) {
                                this.mcore.fullrows[this.mcore.fullrows.length] = cy + m;
                            }
                        }
                        //如果有满行，设置full_rows_count
                        if (this.mcore.fullrows.length > 0) {
                            if (!ai) {
                                //console.log("fullrows......"+this.mcore.fullrows.length);
                                if (this.mtimer.getstat("game-over")) {
                                    this.mtimer.cancel("game-over");
                                    this.mcore.game_over = false;
                                }
                            }
                            this.mcore.combo++;
                            if (!ai) {
                                this.mcore.attack[0] = this.mcore.fullrows.length - 1;
                                //! Modify by lu ning. 现在2连击的时候就有特效。
                                if (this.mcore.combo >= 3) {
                                    this.mstat.combo_total += this.mcore.combo;
                                    if (this.mcore.combo > this.mstat.combo_max)
                                        this.mstat.combo_max = this.mcore.combo;
                                    this.mstat.combo_current = this.mcore.combo;
                                    this.mcore.attack[0]++; // 如果连击数大于等于3   再给别人加一行
                                    this.mtimer.trigger("combo", this.mcore.combo);
                                    this.mstat.addScore(this.mcore.combo * 100);
                                }
                                this.mcore.attack[1] = this.mcore.block_index;
                                //this.mstat.clear_lines+=this.mcore.fullrows.length;
                                console.log(`CurrentClearLines===>${this.mstat.clear_lines}`);
                                var fs = [50, 150, 300, 500];
                                this.mstat.addScore(fs[this.mcore.fullrows.length - 1]);
                                this.mtimer.trigger("clear-row", nge.nge._clone(this.mcore.fullrows));
                                if (this.mconf.mode == els.ELS_MODE_AI)
                                    this.mstat.addScore(this.mcore.attack[0] * 10000);
                            }
                        } else {
                            this.mcore.combo = 0;
                            this.mstat.combo_current = 0;
                        }
                        //进入了下一块处理,可以保存块了
                        this.mcore.save_lock = false;
                        return els.REACH_BOTTOM;
                    } else if (dir == els.LEFT || dir == els.RIGHT) {
                        for (i = 0; i < 4; i++) {
                            for (j = 0; j < 4; j++) {
                                if (
                                    this.isInGrid(cy + i, cx + j) &&
                                    this.mcore.grid[(cy + i) * els.GRIDW + cx + j] == 0
                                )
                                    this.mcore.grid[(cy + i) * els.GRIDW + cx + j] += this.mBlkDat[type][z][i * 4 + j];
                            }
                        }
                        return els.REACH_BORDER;
                    } else {
                        if (dir == els.TURN_CW || dir == els.TURN_CCW) {
                            for (i = 0; i < 4; i++)
                                for (j = 0; j < 4; j++) {
                                    if (
                                        this.isInGrid(y + i, x + j) &&
                                        this.mcore.grid[(y + i) * els.GRIDW + x + j] == 0
                                    )
                                        this.mcore.grid[(y + i) * els.GRIDW + x + j] +=
                                            this.mBlkDat[type][cz][i * 4 + j];
                                }
                            return els.REACH_BORDER;
                        }
                        //调用NextBlk会调用MoveBlk(SET),
                        //此时方块刚出来就有碰撞表明Game Over了
                        if (dir == els.SET && !ai) {
                            //console.log("TRIGGER OVER");
                            this.mstat.isKO = true;
                            this.mtimer.trigger("game-over", 0.12);
                        }
                        return els.NORMAL;
                    }
                }
            }
        }
        //更新真正的Grid,置当前x,y,z,返回
        for (i = 0; i < 4; i++) {
            for (j = 0; j < 4; j++) {
                if (this.isInGrid(y + i, x + j)) {
                    this.mcore.grid[(y + i) * els.GRIDW + x + j] += this.mBlkDat[type][z][i * 4 + j];
                }
            }
        }
        this.mcore.cur_x = x;
        this.mcore.cur_y = y;
        this.mcore.cur_z = z;
        if (!ai) {
            // console.log("moveBlk调用testDDown, dir=" + dir);
            this.testDDown();
        }
        return els.NORMAL;
    }

    isInGrid(x, y) {
        return x >= 0 && x < els.ZONG + 2 && y >= 0 && y < els.HENG + 4;
    }

    //攻击对方
    attack(target, line, spaceseed) {
        var i,
            j,
            flowflag = 0;
        var tgrid = [];
        for (i = 0; i < els.ZONG + 2; i++) tgrid[i] = new Array(els.HENG + 4);

        if (target.mcore.game_over || line <= 0) return;
        if (target.mtimer.getstat("clear-row")) target.mtimer.cancel("clear-row");
        if (target.mtimer.getstat("fall")) target.mtimer.cancel("fall");

        nge.nge._srand(spaceseed);
        //@ts-ignore todo check by zzg
        tgrid = new Uint8Array(els.GRIDSIZE);
        //@ts-ignore
        tgrid.set(target.mcore.grid);
        for (i = 0; i < els.ZONG - line; i++) {
            for (j = 0; j < els.HENG; j++) {
                tgrid[i * els.GRIDW + 2 + j] = target.mcore.grid[(i + line) * els.GRIDW + 2 + j];
                if (tgrid[i * els.GRIDW + 2 + j] < 10 && tgrid[i * els.GRIDW + 2 + j] > 0) {
                    flowflag = 1;
                    tgrid[i * els.GRIDW + 2 + j] = 0;
                }
            }
        }

        for (i = 0; i < line; i++) {
            var r = nge.nge._rand() % els.HENG;
            for (j = 0; j < els.HENG; j++) {
                if (r == j) {
                    tgrid[(els.ZONG - 1 - i) * els.GRIDW + 2 + j] = 0;
                } else {
                    tgrid[(els.ZONG - 1 - i) * els.GRIDW + 2 + j] = 111;
                }
            }
        }

        target.mcore.grid = new Uint8Array(els.GRIDSIZE);
        target.mcore.grid.set(tgrid);

        if (flowflag) {
            var x = target.mcore.cur_x;
            var y = target.mcore.cur_y;
            var z = target.mcore.cur_z;
            var type = target.mcore.cur_block;
            var needUp = false;
            for (i = 0; i < 4; i++)
                for (j = 0; j < 4; j++) {
                    if (this.isInGrid(y + i, x + j)) {
                        if (target.mcore.grid[(y + i) * els.GRIDW + x + j] && target.mBlkDat[type][z][i * 4 + j])
                            needUp = true;
                    }
                }
            if (needUp) {
                //printf("ATTACK NEED UP CURRENT BLOCK!\n");
                target.mcore.cur_y -= line;
                y = target.mcore.cur_y;
            }
            for (i = 0; i < 4; i++)
                for (j = 0; j < 4; j++) {
                    if (this.isInGrid(y + i, x + j))
                        target.mcore.grid[(y + i) * els.GRIDW + x + j] += target.mBlkDat[type][z][i * 4 + j];
                }
        }

        for (i = 0; i < els.HENG; i++) target.mcore.col_top[i] += line;

        if (target.mcore.fullrows.length != 0) {
            for (var f = 0; f < target.mcore.fullrows.length; f++) target.mcore.fullrows[f] -= line;
            //DumpELS(idx, "ATTACK add fullrows!!!");
        }
        //TODO:攻击影响col_hole
    }

    update() {
        if (this.mtimer.ready_wending != els.WENDING) {
            //if(this.index==0) console.log("UPDATE WENDING...."+this.mtimer.ready_wending);
            this.mtimer.ready_wending--;
        }
        this.mtimer.update();
    }
}
