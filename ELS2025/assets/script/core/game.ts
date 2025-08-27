import { ParticleSystem, Label, sys, Sprite, Vec2, ParticleSystem2D } from "cc";
import { BiLog, clickStatEventType } from "../CommonFrame/Bilog";
import { EventType } from "../CommonFrame/EventType";
import { SystemInfo, isInWXChat } from "../CommonFrame/GlobalInit";
import { HttpUtil } from "../CommonFrame/HttpUtil";
import { NotificationCenter } from "../CommonFrame/NotificationCenter";
import { PropagateInterface } from "../CommonFrame/PropagateInterface";
import { ShareInterface } from "../CommonFrame/ShareInterface";
import { StarControl } from "../ui/star_control";
import { UIManager } from "../ui/ui_manager";
import { nge } from "./engine";
import { ElsRender } from "./render";
import { els } from "./els";
import { Main } from "../main";
import { ShareGiftAnimationView } from "../ui/shareGiftAnimationView";
import { GameSinglemode } from "../ui/gameSinglemode";
import { Node } from "cc";

//从game.js分离
export class ElsGame extends nge.Game {
    shareInfo: {};
    config: any;
    requestTimes: number;
    gameNode: any;
    mrender: any[];

    _time: any;
    countTimerObj: number;
    randomKey: any;
    constructor(model, render) {
        super(model, render);
        this.shareInfo = {};
        NotificationCenter.listen(EventType.GET_SHARE_CONFIG_SUCCESS, this.onGetShareMsg, this);
        // PropagateInterface.getShareConfigInfo(null); //获取所有分享点信息
        this.config = null;
        this.requestTimes = 3; //请求次数上线
        this.requestConfigInfo(); //请求配置信息
        this.model.playMusic(els.ELS_VOICE.BG_MUSIC, true, 0.4);
    }

    onGetShareMsg(msg) {
        if (!msg || !msg.retmsg) return;

        var _deliveryList = msg.retmsg.delivery;
        var _randomIndex = Math.floor(Math.random() * 10000) % _deliveryList.length;
        var _deliveryInfo = _randomIndex[_randomIndex];

        if (
            !_deliveryInfo ||
            !_deliveryInfo.shareContent ||
            !_deliveryInfo.sharePicUrl ||
            !_deliveryInfo.sharePointId ||
            !_deliveryInfo.shareSchemeId
        ) {
            return;
        }

        ShareInterface.setOnShareAppMessageInfo(
            _deliveryInfo.shareContent,
            _deliveryInfo.sharePicUrl,
            _deliveryInfo.sharePointId,
            _deliveryInfo.shareSchemeId
        );
    }

    initGame(gameNode, bmp, seed) {
        this.model.stage = 0;
        this.gameNode = gameNode;
        try {
            this.model.init(bmp, seed);
        } catch (e) {
            console.log(e);
        }

        this.mrender = [];
        for (var i = 0; i < 2; i++) {
            this.mrender[i] = new ElsRender(i, this.model.mgrid[i], this.gameNode);
        }

        this.useract = [];
        if (this.model.mconf.mode == els.ELS_MODE_AI) {
            this.startTimerCountdown(els.TIMER_COUNT);
        }
        this.playActionBase(0, "D");

        //重置关卡用于测试
        //this.delItem('ELS_HELP1ST');
        //this.delItem('ELS_PKCOUNT');
        //this.delItem('ELS_PKLOG');
        //this.delItem('ELS_PKLEVEL');
        //this.delItem('ELS_PKSTAR');
        //this.delItem('ELS_CURRENT_STAGE2');
        // this.saveItem('ELS_PKCOUNT', 0);
        // this.saveItem('ELS_PKLOG', '[]');
        // this.saveItem('ELS_PKLEVEL', 1);
        // this.saveItem('ELS_CURRENT_STAGE2', 0);
        // this.saveItem('ELS_PKSTAR', 20);
    }

    /**
     * 请求获取配置信息
     */
    requestConfigInfo() {
        this.requestTimes--;
        var _configUrl = SystemInfo.cdnPath + "config/teris_config.json";
        var that = this;

        var successcb = function (ret) {
            that.requestTimes = 3;
            console.log(_configUrl + "ret ======> " + JSON.stringify(ret));
            that.config = ret;

            //TEST openEmergency FLAG...
            //ret.openEmergency = true;
        };

        var failcb = function (ret) {
            if (that.requestTimes > 0) {
                that.requestConfigInfo();
            }
        };
        HttpUtil.httpGet({ url: _configUrl }, successcb, failcb);
    }
    //现在自己调用 防治不停的调用
    scheduleUpdate_Manual(dt) {
        return;
        // this.model.stage++;
        // let self = this;

        // var _gameCtrl = this.gameNode.getComponent(Main);
        // var _ui_list = [
        //     _gameCtrl.menu,
        //     _gameCtrl.share5line,
        //     _gameCtrl.lose, //保星失败
        //     _gameCtrl.win, //AI对战成功
        //     _gameCtrl.pause,
        //     _gameCtrl.searchai,
        //     _gameCtrl.help,
        //     _gameCtrl.rank,
        //     _gameCtrl.share5step,
        //     _gameCtrl.keepstar, //失败保护
        //     _gameCtrl.keepstarOK, //保星成功
        //     _gameCtrl.lose_single, //单机失败
        //     _gameCtrl.win_single, //单机成功
        //     _gameCtrl.backmask, //半透底板

        //     _gameCtrl.helpbg, //帮助的背景z
        // ];
        // for (var i in _ui_list) {
        //     if (_ui_list[i]) {
        //         _ui_list[i].active = false;
        //         _ui_list[i].opacity = 0;
        //     }
        // }

        // var _status = this.model.getGameStatus();
        // if (_status != els.ELS_GAME_STATE.RESULT_WIN) {
        //     _gameCtrl.yanhua.active = false;
        // }
        // switch (_status) {
        //     case els.ELS_GAME_STATE.SHOW_MASK:
        //         _ui_list[13].active = false;
        //         _ui_list[4].active = false;
        //         _gameCtrl.logo.opacity = 0;
        //         _gameCtrl.lbl_next.opacity = 255;
        //         _gameCtrl.lbl_hold.opacity = 255;
        //         break;
        // }
    }
    //每秒FRAME_HZ(缺省60)次调用此方法 ,只更新游戏中，其他状态手动更新
    scheduleUpdate(dt) {
        this.model.stage++;
        var _status = this.model.getGameStatus();
        var _gameCtrl = this.gameNode.getComponent(Main);

        var _ui_list = [
            _gameCtrl.menu, //0
            _gameCtrl.share5line, //1
            _gameCtrl.lose, //保星失败      //2
            _gameCtrl.win, //AI对战成功    //3
            _gameCtrl.pause, //4
            _gameCtrl.searchai, //5
            _gameCtrl.help, //6
            _gameCtrl.rank, //7
            _gameCtrl.share5step, //8
            _gameCtrl.keepstar, //失败保护    //9
            _gameCtrl.keepstarOK, //保星成功    //10
            _gameCtrl.lose_single, //单机失败    //11
            _gameCtrl.win_single, //单机成功   //12
            _gameCtrl.backmask, //半透底板  //13
        ];

        switch (_status) {
            case els.ELS_GAME_STATE.PLAYING:
                this.updatePlayingView(dt);
                if (this.model.needhelp1st) {
                    //轮播help图片...
                    _gameCtrl.mask.opacity(200);
                    if (this.model.stage % 150 == 0) {
                        if (_gameCtrl.maskidx == null) {
                            //检测值
                            _gameCtrl.maskidx = 0;
                        }

                        _gameCtrl.maskidx = (_gameCtrl.maskidx + 1) % 5;
                        _gameCtrl.mask.getComponent(Sprite).spriteFrame = _gameCtrl.blockimgs[20 + _gameCtrl.maskidx];
                        if (_gameCtrl.maskidx != 0)
                            this.model.playMusic(els.ELS_VOICE.HELP_MUSIC[_gameCtrl.maskidx - 1], false);
                        if (_gameCtrl.maskidx >= 4) {
                            this.model.needhelp1st = false;
                            this.saveItem("ELS_HELP1ST", 1);

                            this.model.displayAd();
                        }
                    }
                }

                if (this.model.emergency) {
                    var eb = null;
                    if (this.model.mconf.mode === els.ELS_MODE_AI) {
                        eb = _ui_list[1];
                    } else {
                        eb = _ui_list[8];
                    }
                    eb.active = true;
                    //eb.opacity = 205;
                    var t = this.model.stage % 6;
                    if (t === 0) this.model.ebdir = this.model.ebdir * -1;
                    //eb.rotation = 3 - this.model.ebdir * this.model.stage % 6;
                    _gameCtrl.animShare5Line.getComponent(ShareGiftAnimationView).show();
                    _gameCtrl.animShare5Step.getComponent(ShareGiftAnimationView).show();
                } else {
                    _ui_list[1].active = false;
                    _ui_list[8].active = false;
                    _gameCtrl.animShare5Line.getComponent(ShareGiftAnimationView).hide();
                    _gameCtrl.animShare5Step.getComponent(ShareGiftAnimationView).hide();
                }

                this.updateScoreTitle();

                if (!this.model.mconf.canRun) {
                    this.show_mask();
                    console.log("show_mask");
                }
                break;
            default:
                break;
        }
    }
    updatePlayingView(dt) {
        this.mrender[0].draw();
        if (this.model.mconf.mode !== els.ELS_MODE_SINGLE) this.mrender[1].draw();

        //this.model.mgrid[0].mcore.game_over = true;  //每局开始就胜利

        if (this.model.mconf.isreplay) {
            if (this.model.pause) return;
        } else {
            switch (this.model.mconf.mode) {
                case els.ELS_MODE_SINGLE:
                    if (this.model.pause) return;

                    var ltl = 2;
                    if (this.model.currentStage <= 20 && this.model.currentStage >= 0) ltl = 6;
                    if (this.model.currentStage <= 50 && this.model.currentStage > 20) ltl = 4;
                    if (this.model.currentStage > 50) ltl = 2;

                    if (this.model.mgrid[0].mcore.top_line <= ltl && this.model.mgrid[0].mcore.block_index > 1) {
                        console.log("single mode success!!!");
                        //粒子 烟花
                        var _gameCtrl = this.gameNode.getComponent(Main);
                        var particleSystem = _gameCtrl.yanhua
                            .getChildByName("particlesystem")
                            .getComponent(ParticleSystem2D);
                        _gameCtrl.yanhua.active = true;
                        if (particleSystem && this.model.begin_win_partical == -1) {
                            this.model.begin_win_partical = 0;
                            _gameCtrl.yanhua.active = true;
                            particleSystem.resetSystem();

                            var self = this;
                            setTimeout(function () {
                                self.model.begin_win_partical = -1;
                                self.model.playMusic(els.ELS_VOICE.WIN_MUSIC, false);
                                self.model.currentStage += 1;
                                self.updateStage(self.model.currentStage);
                                BiLog.clickStat(clickStatEventType.clickStatEventTypeEndSingleWin, [
                                    self.model.currentStage,
                                ]);
                                self.model.setGameStatus(els.ELS_GAME_STATE.RESULT_WIN); //此局胜利

                                self.scheduleUpdate_Manual(0);
                            }, 1200);
                        }
                        return;
                    }
                    var mstep = els.ELSBMP_NANDU[this.model.currentStage][1];
                    if (this.model.mgrid[0].mcore.block_index >= mstep + this.model.add_step) {
                        if (this.model.mgrid[0].mcore.fullrows.length == 0) {
                            this.model.playMusic(els.ELS_VOICE.LOSE_MUSIC, false);
                            this.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE); //此局失败
                            // this.scheduleUpdate_Manual();
                            BiLog.clickStat(clickStatEventType.clickStatEventTypeEndSingleLose, [
                                this.model.currentStage,
                                this.model.add_step,
                            ]);
                            this.scheduleUpdate_Manual(0);

                            return;
                        }
                    }
                    if (this.model.mgrid[0].mcore.game_over) {
                        this.model.playMusic(els.ELS_VOICE.LOSE_MUSIC, false);
                        this.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE); //此局失败
                        // this.scheduleUpdate_Manual();
                        return;
                    }
                    this.playAutoDownAction(dt);
                    this.playUserAction(dt);
                    break;

                case els.ELS_MODE_AI:
                    if (this.model.pause) return;
                    if (this.model.mgrid[0].mcore.game_over) {
                        this.model.playMusic(els.ELS_VOICE.LOSE_MUSIC, false);
                        if (this.config && this.config.openEmergency)
                            this.model.setGameStatus(els.ELS_GAME_STATE.KEEPSTAR); //此局失败
                        else {
                            this.updatePKStar(-1);
                            this.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE);
                            BiLog.clickStat(clickStatEventType.clickStatEventTypeEndVSLoseNE, [
                                this.model.pkstar,
                                this.model.pklevel,
                                this.model.ailevel,
                            ]);
                        }
                        //this.updatePKLevel();

                        // this.scheduleUpdate_Manual();
                        return;
                    }
                    if (this.model.mgrid[1].mcore.game_over) {
                        //粒子 烟花
                        var _gameCtrl = this.gameNode.getComponent(Main);
                        var particleSystem = _gameCtrl.yanhua
                            .getChildByName("particlesystem")
                            .getComponent(ParticleSystem2D);
                        _gameCtrl.yanhua.active = true;
                        if (particleSystem && this.model.begin_win_partical == -1) {
                            particleSystem.resetSystem();
                            this.model.begin_win_partical = 0;

                            var self = this;
                            setTimeout(function () {
                                self.model.begin_win_partical = -1;
                                self.model.playMusic(els.ELS_VOICE.WIN_MUSIC, false);
                                var ostar = self.model.pkstar;
                                var opkl = self.model.pklevel;
                                self.updatePKLevel();
                                self.updatePKStar(1);
                                self.model.setGameStatus(els.ELS_GAME_STATE.RESULT_WIN); //此局胜利
                                BiLog.clickStat(clickStatEventType.clickStatEventTypeEndVSWin, [
                                    ostar,
                                    opkl,
                                    self.model.pkstar,
                                    self.model.pklevel,
                                    self.model.ailevel,
                                ]);
                                self.scheduleUpdate_Manual(0);
                            }, 1200);
                        }
                        // this.model.setGameStatus(els.ELS_GAME_STATE.RESULT_WIN);   //此局胜利

                        return;
                    }
                    this.playAutoDownAction(dt);
                    this.playUserAction(dt);
                    this.playAIAction(dt);
                    break;
            }
        }
        //倒计时不累计所用的时间
        //if(!mstate->countDown) mTimeUsed+=dt;
        for (var i = 0; i < 2; i++) this.updateELS(i, dt);

        this.checkEmergency();
    }
    // updateLocQuery() {
    //     throw new Error("Method not implemented.");
    // }
    // nextStage() {
    //     throw new Error("Method not implemented.");
    // }

    //自然下落...
    playAutoDownAction(dt) {
        //倒计时还没有结束
        //if(mstate->countDown) return;
        //自然下落...
        var tdtime, tlevel;
        if (this.model.mconf.mode == els.ELS_MODE_AI) tlevel = 0;
        else tlevel = this.model.mgrid[0].mstat.level;
        tdtime = els.DOWN_TIME[tlevel] * 1000;
        //tdtime =els.DOWN_TIME[0]*1000;
        if (this.timeoauto > tdtime) {
            this.timeoauto = 0;
            //如果正在直落，不进行以下处理
            if (this.model.mgrid[0].mtimer.getstat("fall")) return;
            this.playActionBase(0, "D");
        } else {
            this.timeoauto += dt;
        }
    }
    //AI动作
    playAIAction(dt) {
        //if (mstate->countDown) return;
        //if(this.timeoai>AI_SPEED[this.model.mgrid[1].mstat.level]) {

        //把计算任务分到多帧...
        if (this.model.mai.work2idx >= 0) this.model.mai.getAIAct(this.model.mgrid[1]);

        //var ais = els.AI_SPEED[this.model.currentStage] || els.AI_SPEED[els.AI_SPEED.length - 1];
        var ais = els.AI_SPEED[this.model.ailevel];
        //ais = 80; //test...
        if (this.timeoai > ais) {
            var aiact = this.model.mai.getAIAct(this.model.mgrid[1]);
            this.playActionBase(1, aiact);
            // if(aiact=='W')
            //     console.log("play ai action.....");
            this.timeoai = 0;
        } else {
            this.timeoai += dt;
        }
    }
    //用户键盘输入
    playUserAction(dt) {
        for (var i = 0; i < this.useract.length; i++)
            if (!this.model.mconf.isreplay) this.playActionBase(0, this.useract[i]);
        this.useract = [];
    }
    //检测攻击
    updateELS(id, dt) {
        //if (mCountDown>0) return;
        var pcore = this.model.mgrid[id].mcore;
        if (pcore.game_over) return;
        //检测执行攻击
        if (pcore.attack[0]) {
            for (var m = 0; m < 2; m++) {
                if (m != id && !pcore.game_over) {
                    console.log("ATTACK!!!!!!!" + pcore.attack[0]);
                    this.model.mgrid[id].attack(this.model.mgrid[m], pcore.attack[0], pcore.attack[1]);
                    this.model.mgrid[m].testDDown();
                    this.model.mgrid[id].mtimer.trigger("attack", pcore.attack[0]);
                }
            }
            pcore.attack[0] = 0;
        }
        //更新内部定时器等操作
        this.model.mgrid[id].update(dt);
    }
    //检测是否开始紧急救助模式
    checkEmergency() {
        if (!this.config || !this.config.openEmergency) return;
        if (this.model.getGameStatus() != els.ELS_GAME_STATE.PLAYING) return;
        if (this.model.mconf.mode == els.ELS_MODE_AI) {
            //TODO: 存在行数 大于等于此时显示救济按钮
            let have_line = 14;
            var gtop = this.model.mgrid[0].mcore.top_line;
            if (gtop >= have_line) {
                this.model.emergency = true;
                return;
            }
        }
        if (this.model.mconf.mode == els.ELS_MODE_SINGLE) {
            var mstep = els.ELSBMP_NANDU[this.model.currentStage][1];
            //TODO: 剩余步数 小于等于此时显示救济按钮
            let remaining_setp = 7;
            if (this.model.mgrid[0].mcore.block_index >= mstep + this.model.add_step - remaining_setp) {
                this.model.emergency = true;
                return;
            }
        }
        this.model.emergency = false;
    }
    updateScoreTitle() {
        var _status = this.model.getGameStatus();
        var lbl_antiscore = this.gameNode.getComponent(Main).lbl_antiscore;
        var lbl_progress = this.gameNode.getComponent(Main).lbl_progress;
        var lbl_title = this.gameNode.getComponent(Main).lbl_title;
        var lbl_myscore = this.gameNode.getComponent(Main).lbl_myscore;

        if (
            _status == els.ELS_GAME_STATE.HOMEPAGE ||
            _status == els.ELS_GAME_STATE.HELP ||
            _status == els.ELS_GAME_STATE.RANK
        ) {
            lbl_antiscore.active = false;
            lbl_progress.active = false;
            lbl_title.active = false;
            lbl_myscore.active = false;
        } else {
            if (this.model.mconf.mode == els.ELS_MODE_AI) {
                lbl_antiscore.active = true;
                lbl_progress.active = true;
                lbl_title.active = true;
                lbl_myscore.active = true;
                var _stage = this.model.ailevel + "";
                var _aiti_score = this.model.mgrid[1].mstat.score;
                var _my_score = this.model.mgrid[0].mstat.score;
                lbl_antiscore.getComponent(Label).string =
                    Math.floor(_aiti_score / 10000) + "攻" + (_aiti_score % 10000) + "分";
                lbl_title.getComponent(Label).string = els.PLAYER_TITLE2[this.model.pkstar_level][1];
                lbl_myscore.getComponent(Label).string =
                    Math.floor(_my_score / 10000) + "攻" + (_my_score % 10000) + "分";
            } else {
                lbl_title.active = true;
                lbl_myscore.active = true;
                lbl_progress.active = false;
                lbl_antiscore.active = false;
                lbl_title.getComponent(Label).string = parseInt(this.model.currentStage) + 1 + "级";
                lbl_myscore.getComponent(Label).string = this.model.mgrid[0].mstat.score + "分";
            }
        }
        if (_status != els.ELS_GAME_STATE.PLAYING) {
            this.stopTimerCountdown();
            this.gameNode.getComponent(Main).timestep.active = false;
            this.gameNode.getComponent(Main).lbl_time.active = false;
        } else {
            this.gameNode.getComponent(Main).timestep.active = true;
            if (this.model.mconf.mode == els.ELS_MODE_AI) {
                this.gameNode.getComponent(Main).lbl_time.active = true;
                this.gameNode.getComponent(Main).lbl_time.getComponent(Label).string = this._time;
            }
            if (this.model.mconf.mode == els.ELS_MODE_SINGLE) {
                this.gameNode.getComponent(Main).lbl_time.active = true;
                var mstep = els.ELSBMP_NANDU[this.model.currentStage][1];
                this.gameNode.getComponent(Main).lbl_time.getComponent(Label).string =
                    mstep + this.model.add_step - this.model.mgrid[0].mcore.block_index + "";
            }
        }
    }
    _freshCountDown(obj) {
        var that = obj;
        that._time--;
        //倒计时快结束时的提醒动画
        if (this._time == 3) {
            //todo by zzg 闪烁动画
            // that.gameNode.getComponent(Main).lbl_time.runAction(blink(3, 12));
        }
        if (that._time <= 0) {
            that._time = 0;
            that.stopTimerCountdown();
            if (that.model.mconf.mode === els.ELS_MODE_AI) {
                if (that.model.mgrid[0].mstat.score > that.model.mgrid[1].mstat.score) {
                    that.model.mgrid[1].mcore.game_over = true;
                } else if (that.model.mgrid[0].mstat.score < that.model.mgrid[1].mstat.score) {
                    that.model.mgrid[0].mcore.game_over = true;
                } else {
                    that.model.mgrid[1].mcore.game_over = true;
                }
            }
        }
    }
    stopTimerCountdown() {
        //todo check by zzg
        // this.gameNode.getComponent(Main).lbl_time.stopAllActions();
        this.countTimerObj && clearInterval(this.countTimerObj);
        this.countTimerObj = null;
    }
    //AI 模式下开启倒计时
    startTimerCountdown(_time) {
        var that = this;
        this._time = _time;
        if (this.countTimerObj != null) clearInterval(this.countTimerObj);
        this.countTimerObj = setInterval(function () {
            that._freshCountDown(that);
        }, 1000);
    }
    delItem(key) {
        sys.localStorage.removeItem(key);
        if (!isInWXChat) return;
        // wx.removeUserCloudStorage({
        //     keyList: [key],
        //     success: (msg) => { console.log('removeObjectCloud  ' + key + ' succeeds', msg); },
        //     fail: (msg) => { console.log('removeObjectCloud  ' + key + ' fails', msg); },
        // });
    }
    saveItem(key, value, only_local?) {
        value = value + "";
        sys.localStorage.setItem(key, value);
        if (!isInWXChat) return;
        if (!only_local) {
            //FIXED: 做版本检测，版本低的会有黑屏
            // if(wx.setUserCloudStorage){
            //     wx.setUserCloudStorage({
            //         KVDataList: [{ key: key, value: value }],
            //         success: (msg) => { console.log('saveObjectToCloud  ' + key + ' succeeds', msg); },
            //         fail: (msg) => { console.log('saveObjectToCloud  ' + key + ' fails', msg); },
            //     });
            // }
        }
    }
    loadItem(key, default_value) {
        var v = sys.localStorage.getItem(key);
        // console.log(key, 'v'+v);
        if (!v) {
            sys.localStorage.setItem(key, default_value);
            return default_value;
        }
        return v;
    }
    //闯关休闲模式过关时调用...
    updateStage(stage) {
        var ls = parseInt(this.loadItem("ELS_CURRENT_STAGE2", stage));
        if (stage > ls) this.saveItem("ELS_CURRENT_STAGE2", stage);
    }
    updatePKStar(val) {
        var ps = this.model.pkstar;
        ps = Math.max(0, ps + val);
        this.saveItem("ELS_PKSTAR", ps);
        this.model.pkstar = ps;
        //TODO: 根据PKSTAR更新this.model.pkstar_level
        //参考 els.PLAYER_TITLE2
        console.log("fengbing", " -----------  update pk star ---------  " + ps);
        var level_state = this._getPKStarLevel(ps);
        this.model.pkstar_level = level_state[0];
        this.model.pkstar_level_get = level_state[1];

        console.log(
            "fengbing",
            " update pkstar_level:  " +
                this.model.pkstar_level +
                "   this.model.pkstar_level_get: " +
                this.model.pkstar_level_get
        );
    }
    /**
     * 通过星星获取当前PLAYER_TITLE2级别
     * @param star
     * @private
     */
    _getPKStarLevel(star) {
        if (!star) return [0, 0];
        var len = els.PLAYER_TITLE2.length;
        var startotal = 0,
            star_level = 0,
            cur_star = 0;
        for (var i = 0; i < len; i++) {
            //@ts-ignore
            var starnum: number = els.PLAYER_TITLE2[i][0];
            startotal += starnum;
            if (startotal >= star) {
                star_level = i;
                break;
            }
        }
        //@ts-ignore
        cur_star = els.PLAYER_TITLE2[star_level][0] - (startotal - star);
        return [star_level, cur_star];
    }
    /**
     * 获取当前star_level的名称
     * @param star
     * @returns {*}
     * @private
     */
    _getPKStarLevelName(star) {
        var level = this._getPKStarLevel(star)[0];
        return els.PLAYER_TITLE2[level][1];
    }
    //对战模式一局结束，不管胜利失败都要调用...
    //PL = PL + k*(P - E)
    updatePKLevel() {
        var g0 = this.model.mgrid[0];
        var g1 = this.model.mgrid[1];

        if (g0.isUserGiveup()) {
            console.log("GIVEUP?..." + g0.isUserGiveup());
            return;
        }
        //update pkcount...
        var pkcount = parseInt(this.loadItem("ELS_PKCOUNT", 0)) + 1;
        this.saveItem("ELS_PKCOUNT", pkcount);

        //update pklevel
        //performance = score diff
        var performance = Math.abs(g0.mstat.score - g1.mstat.score) / 10000.0;
        var pl = this.model.pklevel;
        var al = this.model.ailevel;
        //expect = level diff
        var expect = pl - al;
        var k = els.LEVEL_K[parseInt(pl)];
        pl = pl + k * (performance - expect);
        if (pkcount <= 5 && performance < 1.0) {
            console.log("pkcount..." + pkcount + " pl..." + pl);
            pl += 2;
        }
        if (pl < 0) pl = 0;
        if (pl > 18) pl = 18;

        console.log(
            "PK...pklevel=" +
                this.model.pklevel +
                " ailevel=" +
                al +
                " performance=" +
                performance +
                " expect=" +
                expect +
                " k=" +
                k +
                " newpl=" +
                pl
        );

        this.model.pklevel = pl;
        this.saveItem("ELS_PKLEVEL", this.model.pklevel);

        //保存近十局的对战记录
        //var pklog = this.loadItem('ELS_PKLOG', '[]');
        //pklog = JSON.parse(pklog);
        //if(pklog.length==10) pklog.shift();
        //pklog[pklog.length] = {me:this.model.pklevel, ai:this.model.ailevel, p:performance};
        //this.saveItem('ELS_PKLOG', JSON.stringify(pklog));
    }
    //旋转动作的辅助函数
    _testTurn(pg, dir, testcmd) {
        var tcore = pg.mcore.clone();
        var mret;

        for (var i = 0; i < testcmd.length; i++) {
            if (testcmd[i] === "L") pg.moveBlk(els.LEFT, false);
            if (testcmd[i] === "R") pg.moveBlk(els.RIGHT, false);
        }
        mret = pg.moveBlk(dir, false);
        if (mret === els.NORMAL) {
            pg.testDDown();
            return true;
        } else {
            pg.mcore.recycle();
            pg.mcore = tcore.clone();
            tcore.recycle();
        }
        return false;
    }
    //执行动作码的基础方法
    playActionBase(index, act) {
        var dir;
        var pg = this.model.mgrid[index];

        if (pg.mtimer.getstat("fall")) pg.mtimer.cancel("fall");
        switch (act) {
            case "T":
            case "U":
                if (0 === index) this.model.playMusic(els.ELS_VOICE.TURN_MUSIC, false);
                //顺时针旋转。到边时，如果旋转遇到碰撞，就尝试自动左右移动，看看能否不碰撞了
                dir = act === "T" ? els.TURN_CW : els.TURN_CCW;
                //this.mrep.recordAction(index, act);
                if (pg.moveBlk(dir, false) === els.NORMAL) {
                    pg.testDDown();
                    break;
                } else {
                    //开始尝试左右移动再转...
                    if (this._testTurn(pg, dir, "L")) break;
                    if (this._testTurn(pg, dir, "LL")) break;
                    if (this._testTurn(pg, dir, "R")) break;
                    if (this._testTurn(pg, dir, "RR")) break;
                }
                break;
            case "W":
                //this.mrep.recordAction(index, act);
                if (0 === index) this.model.playMusic(els.ELS_VOICE.DROP_MUSIC, false);
                pg.mtimer.trigger("fall", 0.12);
                break;
            case "D":
                //this.mrep.recordAction(index, act);
                if (0 === index) this.model.playMusic(els.ELS_VOICE.MOVE_MUSIC, false);
                if (pg.moveBlk(els.DOWN, false) === els.REACH_BOTTOM) pg.nextBlk(false);
                pg.testDDown();
                break;
            case "L":
                if (0 === index) this.model.playMusic(els.ELS_VOICE.MOVE_MUSIC, false);
                pg.moveBlk(els.LEFT, false);
                pg.testDDown();
                //this.mrep.recordAction(index, act);
                break;
            case "R":
                if (0 === index) this.model.playMusic(els.ELS_VOICE.MOVE_MUSIC, false);
                pg.moveBlk(els.RIGHT, false);
                pg.testDDown();
                //this.mrep.recordAction(index, act);
                break;
            case "S":
                //this.mrep.recordAction(index, act);
                pg.saveBlk(false);
                pg.testDDown();
                break;
            case "N":
                //this.mrep.recordAction(index, act);
                break;
        }
    }
    updateBlock() {
        //生成精灵

        var _main = this.gameNode.getComponent(Main);

        var setBlkColor = function (c: Node, op, idx, scale?) {
            var cmap = [0, 9, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0];
            c.opacity(op);
            if (scale != null && scale != undefined) {
                c.setScale(scale * c.scale.x, scale * c.scale.y, 1);
            }
            c.getComponent(Sprite).spriteFrame = _main.blockimgs[cmap[idx]];
        };

        for (var n = 0; n < 2; n++) {
            for (var i = 0, il = els.ZONG; i < il; i++) {
                for (var j = 0, jl = els.HENG; j < jl; j++) {
                    var c = _main.blocks[n][i][j];
                    
                    // 检查方块节点是否存在且有效
                    if (!c || !c.isValid) {
                        console.warn("Block node missing, recreating blocks...");
                        _main.init(); // 重新初始化方块
                        c = _main.blocks[n][i][j]; // 重新获取
                        if (!c) {
                            console.error("Failed to recreate block node");
                            continue;
                        }
                    }
                    
                    var scale = n == 0 ? 6.6 / els.HENG : 2.4 / els.HENG;
                    var bsize = 72 * scale + 2;
                    c.scale = scale;
                    setBlkColor(c, 0, 8); // 设置为透明，这是正确的，因为游戏开始时方块应该是空的
                    if (n == 0) c.position = new Vec2(216 + j * bsize, 215 + i * bsize); //重置时候的方块位置
                    if (n == 1) c.position = new Vec2(14 + j * bsize, 796 + i * bsize);
                }
            }
        }

        if (els.HENG == 10) {
            for (var n = 0; n < 2; n++) {
                for (var i = 0; i < els.ZONG; i++) {
                    var c = _main.blocks[n][i][10];
                    if (c && c.isValid) {
                        setBlkColor(c, 0, 0);
                    }
                }
            }
        }
    }
    _backToHomePage() {
        els.HENG = 10;
        var _game = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE).node.getComponent(GameSinglemode);
        _game.node.getChildByName("win_tips").active = false;
        this.updateBlock();
        this.model.setGameStatus(els.ELS_GAME_STATE.HOMEPAGE);
        
        // 确保重新初始化Main组件的blocks数组
        var mainComponent = this.gameNode.getComponent(Main);
        if (mainComponent) {
            mainComponent.init();
        }
        
        this.initGame(this.gameNode, 0, parseInt((Math.random() * 10000).toString()));
        this.model.playMusic(els.ELS_VOICE.BG_MUSIC, true, 0.4);
        UIManager.hideAllUI();
        UIManager.showUI(els.ELS_GAME_LAYER.HOMEPAGE);
    }
    matchAiLevel() {
        this.model.pklevel = parseInt(this.loadItem("ELS_PKLEVEL", 0));
        if (isNaN(this.model.pklevel)) {
            console.log("PKLEVEL NaN....");
            this.model.pklevel = 6 + Math.random() * 6;
            this.saveItem("ELS_PKLEVEL", this.model.pklevel);
        }
        var ps = this.model.pkstar;
        var pl = this.model.pklevel;
        var al = 0;
        if (ps < 50) {
            var rd = Math.random();
            if (rd <= 0.8) al = pl - 2 - Math.random();
            else al = pl + 0.5 + Math.random();
        } else {
            al = pl - Math.random() * 4 + 2;
        }
        al = parseInt(al.toFixed(0));
        console.log("AL..." + al);
        if (al < 0) al = 0;
        if (al > 18) al = 18;
        this.model.ailevel = al;
    }
    //对战按钮
    fightAI_fun() {
        this.matchAiLevel();
        this.initGame(this.gameNode, -1, parseInt((Math.random() * 10000).toString()));
        BiLog.clickStat(clickStatEventType.clickStatEventTypeStartVSHome, [
            this.model.pkstar,
            this.model.pklevel,
            this.model.ailevel,
        ]);
        this.model.mconf.mode = els.ELS_MODE_AI;
        this.model.allowDoPopAction = true;
        this.model.playMusic(els.ELS_VOICE.READYGO_MUSIC, false);
        this.model.playMusic(els.ELS_VOICE.BG_MUSIC2, true, 0.4);
        this.model.setGameStatus(els.ELS_GAME_STATE.SEARCH_AI);
        StarControl.clearNodes();
        this.gameNode.getComponent(Main).showBeyondNode("ELS_PKSTAR");
    }

    //开始经典模式
    startClassicGame() {
        this.model.currentStage = parseInt(this.loadItem("ELS_CURRENT_STAGE2", 0));
        this.model.mconf.mode = els.ELS_MODE_SINGLE;
        this.initGame(this.gameNode, this.model.currentStage, parseInt((Math.random() * 10000).toString()));
        this.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
        this.model.allowDoPopAction = true;
        this.model.playMusic(els.ELS_VOICE.READYGO_MUSIC, false);
        this.model.playMusic(els.ELS_VOICE.BG_MUSIC2, true, 0.4);
        StarControl.clearNodes();
        this.gameNode.getComponent(Main).showBeyondNode("ELS_CURRENT_STAGE2");
    }
    //返回主页  失败
    loseBackToHome() {
        var _gameCtrl = this.gameNode.getComponent(Main);
        _gameCtrl.yanhua.active = false;
        this.model.allowDoPopAction = true;
        this.stopTimerCountdown();
        this._backToHomePage();
        StarControl.clearNodes();
        this.scheduleUpdate_Manual(0);
    }
    //重新挑战 失败
    reStartGame() {
        if (this.model.mconf.mode === els.ELS_MODE_AI) {
            this.matchAiLevel();
            this.model.setGameStatus(els.ELS_GAME_STATE.SEARCH_AI);
            BiLog.clickStat(clickStatEventType.clickStatEventTypeStartVSRestart, [
                this.model.pkstar,
                this.model.pklevel,
                this.model.ailevel,
            ]);
            this.initGame(this.gameNode, -1, parseInt((Math.random() * 10000).toString()));
        } else {
            this.initGame(this.gameNode, this.model.currentStage, parseInt((Math.random() * 10000).toString()));
            this.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
        }
        this.model.allowDoPopAction = true;
        this.scheduleUpdate_Manual(0);
    }
    updateLocQuery() {

        var _query_key = "SECRETLANGUAGEDATA";
        var querys = JSON.parse(this.loadItem(_query_key, ""));
        var inLoc = false;
        var new_querys = []; //new Array();
        for (var i = 0; i < querys.length; i++) {
            var _tq = querys[i];
            if (_tq["randomKey"] == this.randomKey) {
                _tq["curIndex"] = 0;
            }
            new_querys.push(_tq);
        }
        this.saveItem(_query_key, JSON.stringify(new_querys), true);
    }
    //下一关 成功
    nextStage() {
        if (this.model.mconf.mode === els.ELS_MODE_AI) {
            this.matchAiLevel();
            this.model.setGameStatus(els.ELS_GAME_STATE.SEARCH_AI);
            BiLog.clickStat(clickStatEventType.clickStatEventTypeStartVSNext, [
                this.model.pkstar,
                this.model.pklevel,
                this.model.ailevel,
            ]);
            this.initGame(this.gameNode, -1, parseInt((Math.random() * 10000).toString()));
        } else {
            this.initGame(this.gameNode, this.model.currentStage, parseInt((Math.random() * 10000).toString()));
            this.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
        }
        //去掉烟花效果
        var _gameCtrl = this.gameNode.getComponent(Main);
        var particleSystem = _gameCtrl.yanhua.getChildByName("particlesystem").getComponent(ParticleSystem2D);
        _gameCtrl.yanhua.active = false;
        StarControl.clearNodes();
        this.model.allowDoPopAction = true;
        this.scheduleUpdate_Manual(0);
    }
    // 展示蒙版
    show_mask() {
        if (this.model.getGameStatus() == els.ELS_GAME_STATE.PLAYING) {
            this.model.setGameStatus(els.ELS_GAME_STATE.SHOW_MASK);
            var _game = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE).node.getComponent(GameSinglemode);
            if (_game && _game.game_mask) {
                _game.game_mask.active = true;
            }
            this.stopTimerCountdown();
            this.model.allowDoPopAction = true;
            this.scheduleUpdate_Manual(0);
        }
    }
    hiden_mask() {
        if (this.model.getGameStatus() == els.ELS_GAME_STATE.SHOW_MASK) {
            this.model.mconf.canRun = true;
            var _game = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE).node.getComponent(GameSinglemode);
            if (_game && _game.game_mask) {
                _game.game_mask.active = false;
            }
            this.continueGame();
        }
    }
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.model.getGameStatus() == els.ELS_GAME_STATE.PLAYING) {
            this.model.setGameStatus(els.ELS_GAME_STATE.PAUSE);
            this.stopTimerCountdown();
        }
    }
    /**
     * 继续游戏
     */
    continueGame() {
        this.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
        this.startTimerCountdown(this._time);
    }
    backToHomePage() {
        this.stopTimerCountdown();
        this._backToHomePage();
    }
    //放弃保星
    cancelKeepStar() {
        this.model.keepstar = false;
        this.updatePKStar(-1);
        StarControl.clearNodes();
        this.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE);
        this.model.begin_cd = -1;
        BiLog.clickStat(clickStatEventType.clickStatEventTypeEndVSLoseNoKeep, [
            this.model.pkstar,
            this.model.pklevel,
            this.model.ailevel,
        ]);
    }
    //保星 分享到群
    keepStarShare() {
        var that = this;
        var _successCall = function () {
            console.log("keepstar _successCall");
            that.model.keepstar = true;
            that.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE);
            BiLog.clickStat(clickStatEventType.clickStatEventTypeEndVSLoseKeep, [
                that.model.pkstar,
                that.model.pklevel,
                that.model.ailevel,
            ]);
        };
        var _failCall = function () {
            console.log("_failCall");
            that.model.keepstar = false;
            that.updatePKStar(-1);
            that.model.setGameStatus(els.ELS_GAME_STATE.RESULT_LOSE);
        };
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.GAME_KEEP_STAR,
            successCallback: _successCall,
            failCallback: _failCall,
        });
        this.model.allowDoPopAction = true;
        StarControl.clearNodes();
        this.model.begin_cd = -1;
        this.scheduleUpdate_Manual(0);
    }
    //保星 分享成功    加五步。减5行
    emergencyShare() {
        if (
            (this.model.mconf.mode == els.ELS_MODE_AI || this.model.mconf.mode == els.ELS_MODE_SINGLE) &&
            this.model.emergency
        ) {
            var that = this;
            var _share_type = undefined;
            if (this.model.mconf.mode === els.ELS_MODE_AI) {
                _share_type = els.SHRAE_TYPE.GAME_SHARE_DEL5;
            }
            if (this.model.mconf.mode === els.ELS_MODE_SINGLE) {
                _share_type = els.SHRAE_TYPE.GAME_SHARE_ADD5;
            }
            var _successCall = function () {
                console.log("emergency _successCall");
                if (that.model.mconf.mode == els.ELS_MODE_AI) {
                    that.model.mgrid[0].clearThreeBottomLines();
                }
                if (that.model.mconf.mode == els.ELS_MODE_SINGLE) {
                    that.model.add_step += 5;
                    console.log("ADD5STEP!!!");
                    //todo by zzg 动画效果替换
                    // var a5 = that.gameNode.getComponent(Main).add5step;
                    // a5.opacity = 255;
                    // a5.runAction(
                    //     sequence(
                    //         blink(1.5, 5),
                    //         callFunc(function () {
                    //             a5.opacity = 0;
                    //         })
                    //     )
                    // );
                }
            };
            var _failCall = function () {
                console.log("_failCall");
            };
            ShareInterface.shareMsg({
                type: _share_type,
                successCallback: _successCall,
                failCallback: _failCall,
            });
            this.model.allowDoPopAction = true;
            StarControl.clearNodes();
            //-------------------------------
            this.scheduleUpdate_Manual(0);
        }
    }
}
