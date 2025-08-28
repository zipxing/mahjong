import {
    _decorator,
    Component,
    Animation,
    Sprite,
    SpriteFrame,
    Node,
    Prefab,
    Label,
    Vec2,
    instantiate,
    assetManager,
    Texture2D,
    ImageAsset,
    loader,
    EditBox,
} from "cc";
import { els } from "../core/els";
import { UserInfo, WXUserInfo, tywx } from "../CommonFrame/GlobalInit";
import { UIManager } from "./ui_manager";
import { EventType } from "../CommonFrame/EventType";
import { NotificationCenter } from "../CommonFrame/NotificationCenter";
import { OpenDataContextUtil } from "../CommonFrame/OpenDataContextUtil";
import { SecretLanguage } from "../CommonFrame/PropagateInterface";
import { ShareInterface } from "../CommonFrame/ShareInterface";
import { Util } from "../CommonFrame/Util";
import { StarControl } from "./star_control";
import { ELSProfile } from "../core/ELSProfile";
import { Main } from "../main";
const { ccclass, property } = _decorator;

@ccclass("HomePage")
export class HomePage extends Component {
    @property(Animation)
    public animLogo = null;
    @property(Sprite)
    public spriteBtnSoundDisplay = null;
    @property(SpriteFrame)
    public spriteFrameSoundDisable = null;
    @property(SpriteFrame)
    public spriteFrameSoundEnable = null;
    @property(Node)
    public nodeAdapterBgHome = null;
    @property(Node)
    public nodeAdapterGame = null;
    @property(Prefab)
    public label_content = null;

    menu: Node;

    show_data: any;
    share_tips: any;
    share_tips_img: any;

    game: any;
    model: any;
    _query: any;

    onLoad() {
        this.menu = this.node.getChildByName("menu");

        this.show_data = {};
        this.share_tips = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE)
            .node.getChildByName("sl_bg")
            .getChildByName("sl_tips");
        this.share_tips_img = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE)
            .node.getChildByName("sl_bg")
            .getChildByName("sl_icon");

    }

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
        this.playLogoAnimationRandom();
        this.model.checkPlayMusic();
        this.refreshSoundBtnState();
        this.refreshStar();
    }



    showMe() {
        console.log("homepage showMe");
        this.nodeAdapterBgHome.active = true;
        this.nodeAdapterGame.active = false;
        this.refreshStar();
    }

    onEnable() {
    }

    hideMe() {}

    refreshStar() {
        let self = this;
        setTimeout(function () {
            var node = self.menu.getChildByName("starcontainer");
            let starNum = els.PLAYER_TITLE2[self.model.pkstar_level][0];
            StarControl.createStars(node, starNum, self.model.pkstar_level_get, 0);
            var bc = self.menu.getChildByName("starlevel");
            //@ts-ignore
            bc.getComponent(Label).string = els.PLAYER_TITLE2[self.model.pkstar_level][1];
        }, 1000);
    }

    onVsHandler(eve: any) {
        console.log("fengbing", "--------------- vs handle --------------");
        UIManager.hideAllUI();
        UIManager.showUI(els.ELS_GAME_LAYER.GAME_SINGLE);
        this.game.fightAI_fun();
    }

    onHelpHandler(eve: any) {
        UIManager.showUI(els.ELS_GAME_LAYER.HELP);
    }

    onSingleHandler(eve: any) {
        this.game.startClassicGame();
        UIManager.hideAllUI();
        UIManager.showUI(els.ELS_GAME_LAYER.GAME_SINGLE);
    }

    onPmHandler(eve: any) {
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.HOMEPAGE_GROUP_RANK,
            successCallback: (err) => {
                console.log(`share success ==> ${err}`);
                UIManager.showUI(els.ELS_GAME_LAYER.RANK);
                ELSProfile.getInstance().setShareTimeStamp();
            },
            failCallback: (err) => {
                console.log(`share fialed ==> ${err}`);
            },
        });
    }

    onShareHandler(eve: any) {
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.HOMEPAGE,
        });
    }

    editBoxTextDidEnd(event: any) {
        console.log(event);
        var text = event.string;
        var reg = new RegExp("^[\\u4E00-\\u9FFF]+$", "g");
        if (!reg.test(text)) {
            event.getComponent(EditBox).string = "";
            return;
        }
        if (text.length > 6) {
            text = text.slice(0, 6);
        }
        event.getComponent(EditBox).string = text;
    }

    playLogoAnimationRandom() {
        console.log("playLogoAnimationRandom");
        let self = this;
        this.animLogo.on(
            "finished",
            (param) => {
                let delay = Math.random() * 20000 + 10000;
                console.log(`LogoAnimationEnd params = ${param},${delay}`);
                setTimeout(() => {
                    self.animLogo.play("logo");
                }, delay);
            },
            this
        );
        this.animLogo.play("logo");
    }

    onBtnMusicClickCallback() {
        console.log("onBtnMusicClickCallback");
        ELSProfile.getInstance().switchMusicMute();
        this.model.playMusic(els.ELS_VOICE.BG_MUSIC, true, 0.4);
        this.refreshSoundBtnState();
    }

    refreshSoundBtnState() {
        this.spriteBtnSoundDisplay.spriteFrame = ELSProfile.getInstance().getIsMusicMute()
            ? this.spriteFrameSoundDisable
            : this.spriteFrameSoundEnable;
    }
}
