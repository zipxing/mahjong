import {
    _decorator,
    Animation,
    Component,
    instantiate,
    Label,
    Node,
    ParticleSystem,
    ParticleSystem2D,
    Prefab,
    tween,
    UIOpacity,
    Vec2,
} from "cc";
import { els } from "../core/els";
import { tywx, WXUserInfo } from "../CommonFrame/GlobalInit";
import { UIManager } from "./ui_manager";
import { ShareInterface } from "../CommonFrame/ShareInterface";
const { ccclass, property } = _decorator;

@ccclass("GameSinglemode")
export class GameSinglemode extends Component {
    @property(Node)
    public gameNode = null;
    @property(Node)
    public winline = null;
    @property(Node)
    public lose_single = null;
    @property(Node)
    public win_single = null;
    @property(Node)
    public whisper_win_single = null;
    @property(Node)
    public sl_bg = null;
    @property(Prefab)
    public prefabMTAnima = null;
    @property(Node)
    public nodeAdapterBgHome = null;
    @property(Node)
    public nodeAdapterGame = null;
    @property([Node])
    public masks = [];
    @property(Prefab)
    public prefabWisperStartAni = null;
    @property(Node)
    public nodeWisperAniParent = null;
    gameview: any;
    game_mask: Node;
    mask_btn: any;
    win_content: any;
    win_content_icon: any;
    game: any;
    model: any;

    onLoad() {
        this.gameview = this.gameNode.getComponent("game");
        this.game_mask = this.node.getChildByName("game_mask");
        this.mask_btn = this.game_mask.getChildByName("mask_btn");
        this.mask_btn.on(Node.EventType.TOUCH_END, this.mask_btn_click, this);
        this.lose_single.getChildByName("sBackBtn").on(Node.EventType.TOUCH_END, this.onloseBackHandler, this);
        this.lose_single.getChildByName("sreGameBtn").on(Node.EventType.TOUCH_END, this.onloseRegameHandler, this);
        this.win_single.getChildByName("sNextBtn").on(Node.EventType.TOUCH_END, this.onwinNextHandler, this);
        this.win_single.getChildByName("sShareBtn").on(Node.EventType.TOUCH_END, this.onwinShareHandler, this);
        this.win_content = this.whisper_win_single.getChildByName("whisper_win_content");
        this.win_content_icon = this.whisper_win_single.getChildByName("whisper_win_content_icon");
    }

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
    }

    updateWinLine() {
        let tmp_model = UIManager.game.model;
        if (tmp_model.mconf.isWhisper) {
            this.winline.active = false;
        } else {
            this.winline.active = true;
            this.winline.opacity(150);
            var ltl = 2;
            var strContent = "";
            var pos_y = -421;
            var pos_x = 103;
            if (tmp_model.currentStage <= 20 && tmp_model.currentStage >= 0) {
                ltl = 6;
            } else if (tmp_model.currentStage <= 50 && tmp_model.currentStage > 20) {
                ltl = 4;
            } else if (tmp_model.currentStage > 50) {
                ltl = 2;
            }
            strContent = `消到${ltl}行以下过关`;
            pos_y = ltl * 50 + pos_y;
            this.winline.position = new Vec2(pos_x, pos_y);
            let labelContent = this.winline.getChildByName("label_win").getComponent(Label);
            labelContent.string = strContent;
        }
    }

    showMe() {
        this.win_single.active = false;
        this.whisper_win_single.active = false;
        this.lose_single.active = false;
        this.sl_bg.active = false;
        this.win_content.active = false;
        this.win_content_icon.active = false;
        this.updateWinLine();
        this.stopAllParticleSys();
        this.nodeAdapterBgHome.active = false;
        this.nodeAdapterGame.active = true;
    }

    hideMe() {
        this.winline.active = false;
    }

    showWisperStart(index: any) {
        console.log("showWisperStart", index);
        let self = this;
        let animation_end_callback = () => {
            self.game.hiden_mask();
            self.hideMask();
        };
        let content = this.game.win_content.split("\n")[1][index];
        let ani = instantiate(this.prefabWisperStartAni);
        ani.getComponent("WisperStartAnimation").init(
            content,
            animation_end_callback,
            this.masks[this.game.cipherIndex]
        );
        ani.parent = this.nodeWisperAniParent;
    }

    hideMask() {
        // let self = this;
        // this.game_mask.runAction(
        //     sequence(
        //         fadeOut(0.5),
        //         callFunc(() => {
        //             self.game_mask.active = false;
        //             self.game_mask.opacity = 255;
        //         })
        //     )
        // );
        let opacity = this.game_mask.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.game_mask.addComponent(UIOpacity);
        }
        opacity.opacity = 255;
        tween(opacity)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.game_mask.active = false;
                opacity.opacity = 255;
            });
    }

    showWin() {
        this.updateWinLine();
        this.lose_single.active = false;
        var _win_single = undefined;
        if (
            this.game.model.mconf.mode === els.ELS_MODE_SINGLE &&
            this.game.model.mconf.isWhisper === true &&
            this.game.cipherIndex == this.game.cipherData.length
        ) {
            this.whisper_win_single.getComponent("whisper_win_single").showWithData({
                avatarUrl: this.game.win_contetn_avatarUrl,
                user_heard_url: WXUserInfo.avatarUrl,
                data: this.game.win_content,
            });
            return;
        } else {
            this.whisper_win_single.active = false;
            this.win_single.active = true;
            _win_single = this.win_single;
        }
        var succ = _win_single.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs.resetSystem();
    }

    showLose() {
        this.lose_single.active = true;
        this.win_single.active = false;
        this.whisper_win_single.active = false;
        var shibai = this.lose_single.getChildByName("FangKuai_shibai");
        shibai.getComponent(Animation).play("FangKuai_shibai");
        let pcs = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs.resetSystem();
    }

    stopAllParticleSys() {
        var shibai = this.lose_single.getChildByName("FangKuai_shibai");
        shibai.getComponent(Animation).play("FangKuai_shibai");
        let pcs1: ParticleSystem2D = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs1.stopSystem();
        var succ = this.win_single.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs2: ParticleSystem2D = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs2.stopSystem();
    }

    mask_btn_click() {
        console.log("mask_btn_click");
        this.game.hiden_mask();
        this.masks[this.game.cipherIndex].active = false;
    }

    onloseBackHandler(eve: any) {
        this.lose_single.active = false;
        this.stopAllParticleSys();
        this.game.loseBackToHome();
    }

    onloseRegameHandler(eve: any) {
        this.lose_single.active = false;
        this.stopAllParticleSys();
        this.game.reStartGame();
    }

    onwinNextHandler(eve: any) {
        this.stopAllParticleSys();
        this.win_single.active = false;
        this.whisper_win_single.active = false;
        console.log("fengbing", " *-*-*-*- win next handler *-*-*-*-");
        if (
            this.game.model.mconf.mode == els.ELS_MODE_SINGLE &&
            this.game.model.mconf.isWhisper == true &&
            this.game.cipherIndex >= this.game.cipherData.length
        ) {
            this.game.loseBackToHome();
            this.win_content.getComponent(Label).string = "";
        } else {
            this.game.nextStage();
        }
    }

    onwinShareHandler(eve: any) {
        this.stopAllParticleSys();
        if (
            this.game.model.mconf.mode == els.ELS_MODE_SINGLE &&
            this.game.model.mconf.isWhisper == true &&
            this.game.cipherIndex >= this.game.cipherData.length
        ) {
            ShareInterface.shareMsg({
                type: els.SHRAE_TYPE.GAME_QQH_WIN,
            });
        } else {
            // 闯关胜利 分享
            ShareInterface.shareMsg({
                type: els.SHRAE_TYPE.GAME_SINGLE_WIN,
            });
        }
    }

    onwinSaveHandler() {
        console.log("onwinSaveHandler");
    }
}
