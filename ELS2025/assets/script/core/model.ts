import { director } from "cc";
import { AdManager } from "../CommonFrame/AdManager";
import { EventType } from "../CommonFrame/EventType";
import { isInWXChat } from "../CommonFrame/GlobalInit";
import { NotificationCenter } from "../CommonFrame/NotificationCenter";
import { Timer } from "../CommonFrame/Timer";
import { ElsAi } from "./ai";
import { nge } from "./engine";
import { ELSProfile } from "./ELSProfile";
import { ElsReplay } from "./ElsReplay";
import { ElsConfig } from "./ElsConfig";
import { els } from "./els";

export class ElsModel extends nge.Model {
    winlinedir: number;
    ebdir: number;
    begin_help1st: number;
    mgrid: any[];
    stage: number;
    emergency: boolean;
    keepstar: boolean;
    pause: boolean;
    currentStage: number;
    currentStatus: any;
    ElsGrid: any;
    allowDoPopAction: boolean;
    adSlot: number;
    adSlotConf: { "1": string; "2": string; "3": string };
    mBlockQueue: any[];
    mconf: any;
    mrep: ElsReplay;
    mai: any;
    mrender: any[];
    add_step: number;
    needhelp1st: boolean;
    bgAudioContext: any;
    tou: nge.Model;
    constructor(ElsGrid) {
        super();
        this.winlinedir = 1;
        this.ebdir = 1;
        this.begin_help1st = -1;
        this.mgrid = [];
        this.stage = 0;
        this.emergency = false;
        this.keepstar = false;
        this.pause = false;
        this.currentStage = 0;
        this.currentStatus = els.ELS_GAME_STATE.HOMEPAGE;
        this.ElsGrid = ElsGrid;
        this.allowDoPopAction = true;
        this.adSlot = -1; //广告槽
        this.adSlotConf = {
            "1": "adunit-b61c5f52e2942279",
            "2": "adunit-6bd777cddfba016a",
            "3": "adunit-cb6c0c6de7f272f1",
        };
        for (var i = 0; i < 2; i++) {
            this.mgrid[i] = new ElsGrid(this, i);
        }
        this.mBlockQueue = new Array(els.MAXBLKQUEUE);

        NotificationCenter.listen(EventType.GAME_SHOW, this.onForGround, this);
        NotificationCenter.listen("changeAd", this.onChangeAd, this);
    }

    //生成随机块序列
    genRandomBlockQueue(seed) {
        nge.nge._srand(seed);
        if (els.ELS_CLASSIC) this.mconf.block_type = 1;
        else this.mconf.block_type = 0;
        if (this.mconf.block_type == 1) {
            var tmptype: number;
            var block_tmp = -1;
            //生成500个块的序列
            for (var i = 0; i < els.MAXBLKQUEUE; i++) {
                while (true) {
                    tmptype = nge.nge._rand() % 9;
                    if (block_tmp != tmptype) break;
                }
                var tmpreplace = nge.nge._rand();
                if (tmpreplace % 2 == 0) {
                    if (tmptype == 5 || tmptype == 6) tmptype = 0;
                    if (tmptype == 3 || tmptype == 4) tmptype = 8;
                    if (tmptype == 1 || tmptype == 2) tmptype = 7;
                }
                this.mBlockQueue[i] = tmptype;
                block_tmp = tmptype;
            }
        }
        if (this.mconf.block_type == 0) {
            for (var i = 0; i < els.MAXBLKQUEUE; i++) {
                var tmpreplace = nge.nge._rand();
                var tmptype = nge.nge._rand() % 9;
                if (tmpreplace % 3 == 0) if (tmptype == 3 || tmptype == 4) tmptype = 2;
                this.mBlockQueue[i] = tmptype;
            }
        }
    }

    init(bmpindex, seed) {
        var bmp = [
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [2, 2, 2, 2, 2, 0, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 0, 2, 2, 2],
            [3, 3, 3, 0, 0, 3, 3, 3, 3, 3],
            [3, 3, 0, 0, 0, 0, 3, 3, 3, 3],
            [4, 4, 0, 0, 0, 0, 4, 4, 4, 4],
            [4, 4, 4, 0, 0, 4, 4, 4, 4, 4],
            [0, 5, 5, 5, 5, 5, 5, 5, 5, 0],
            [0, 0, 5, 5, 5, 5, 5, 5, 0, 0],
        ];

        //记录上一关卡的mode
        if (this.mconf && this.mconf.mode != undefined) {
            var _mode = this.mconf.mode;
            var _isWhisper = this.mconf.isWhisper;
            this.mconf = new ElsConfig();
            this.mconf.mode = _mode;
            this.mconf.isWhisper = _isWhisper;
        } else {
            this.mconf = new ElsConfig();
        }

        this.mrep = new ElsReplay();
        this.mai = new ElsAi();
        this.genRandomBlockQueue(seed);
        this.mrender = [];
        this.keepstar = false;
        for (var i = 0; i < 2; i++) {
            this.mgrid[i] = new this.ElsGrid(this, i);
            this.mgrid[i].mconf = this.mconf;
            if (els.ELS_CLASSIC) {
                this.mgrid[i].setBlkDat(els.BLKDAT_C);
            } else {
                this.mgrid[i].setBlkDat(els.BLKDAT_NC);
            }
            this.mgrid[i].setQueue(this.mBlockQueue);
            this.mgrid[i].reset();
            this.currentStage = bmpindex;
            var bn = els.ELSBMP_NANDU;
            if (bmpindex >= 0) {
                var bi = bn[bmpindex % bn.length][0] + 3;
                this.mgrid[i].setBmp(els.ELSBMP["i" + bi]);
                this.add_step = 0;
            }
        }
    }

    setGameStatus(_status) {
        this.currentStatus = _status;
        NotificationCenter.trigger("STATUS_CHANGE", this.currentStatus);
        this.displayAd();
    }

    getGameStatus() {
        return this.currentStatus;
    }

    //显示广告
    displayAd() {
        //AdManager.showAd({x:0,y:0}
        let self = this;
        function innerSV(v) {
            if (self.adSlot != v) {
                self.adSlot = v;
                AdManager.showBannerAd(self.adSlotConf[self.adSlot + ""]);
                self.setScheduleAd();
            }
        }
        //if(  this.getGameStatus() == els.ELS_GAME_STATE.HOMEPAGE  ||  (this.getGameStatus() != els.ELS_GAME_STATE.HOMEPAGE&&this.needhelp1st==false) ){
        if (this.getGameStatus() != els.ELS_GAME_STATE.HOMEPAGE && this.needhelp1st == false) {
            if (this.getGameStatus() == els.ELS_GAME_STATE.HOMEPAGE) {
                //首页槽1
                innerSV(1);
            } else {
                //非首页并且不播放帮助时候显示
                if (this.mconf.mode == els.ELS_MODE_AI) {
                    //AI槽2
                    innerSV(2);
                } else {
                    //单人槽3
                    innerSV(3);
                }
            }
        } else {
            AdManager.destroyBannerAd();
            this.canelScheduleAd();
        }
    }
    //取消广告计时器
    canelScheduleAd() {
        // if (Timer.isScheduledTimer(director, this.scheduleAd)) {
        //     Timer.cancelTimer(director, this.scheduleAd);
        // }
        if (this.adTimerKey) {
            clearInterval(this.adTimerKey);
        }
    }
    //开启广告计时器
    private adTimerKey: number;
    setScheduleAd() {
        this.canelScheduleAd();
        this.adTimerKey = setInterval(() => {
            this.scheduleAd();
        }, 20 * 1000);
        // Timer.setTimer(director, this.scheduleAd, 20);
    }
    //广告计时器
    scheduleAd() {
        NotificationCenter.trigger("changeAd", {});
    }
    //改变广告事件
    onChangeAd() {
        AdManager.showBannerAd(this.adSlotConf[this.adSlot + ""]);
    }

    checkPlayMusic() {
        let ret = true;
        //console.log('checkPlayMusic',ElsProfile.getInstance().getIsMusicMute());
        if (ELSProfile.getInstance().getIsMusicMute()) {
            ret = false;
            if (this.bgAudioContext) {
                this.bgAudioContext[0].destroy();
            }
        }
        return ret;
    }

    onForGround() {
        if (!this.checkPlayMusic()) {
            return;
        }

        if (this.bgAudioContext) {
            try {
                this.bgAudioContext[0].play();
            } catch (e) {
                this.bgAudioContext[0].destroy();
                this.playMusic(this.bgAudioContext[1], true, 0.2);
            }
        } else {
            this.playMusic(this.bgAudioContext[1], true, 0.2);
        }
    }

    playMusic(_audioName, _loop, volume) {
        //console.log('playMusic 1===>  ' + _audioName + this.stage);
        if (!isInWXChat || !this.checkPlayMusic()) return;
        //console.log('playMusic 2===>  ' + _audioName + this.stage);
        // var _audioContext = wx.createInnerAudioContext();
        // _audioContext.src = _audioName;
        // _audioContext.autoPlay = true;
        // _audioContext.loop = _loop;
        // _audioContext.volume = volume === undefined ? 1.0 : volume;
        // _audioContext.play();

        // if (_audioName === els.ELS_VOICE.BG_MUSIC){
        //     if(this.bgAudioContext) {
        //         this.bgAudioContext[0].destroy();
        //     }
        //     this.bgAudioContext = [_audioContext, els.ELS_VOICE.BG_MUSIC];
        // }
        // if (_audioName === els.ELS_VOICE.BG_MUSIC2){
        //     if(this.bgAudioContext) {
        //         this.bgAudioContext[0].destroy();
        //     }
        //     this.bgAudioContext = [_audioContext, els.ELS_VOICE.BG_MUSIC2];
        // }
    }
}
