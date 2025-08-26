import {
    _decorator,
    Component,
    Node,
    Sprite,
    Label,
    ParticleSystem2D,
    SpriteFrame,
    Texture2D,
    loader,
    log,
    Animation,
    assetManager,
    ImageAsset,
    resources,
} from "cc";
import { tywx } from "../CommonFrame/GlobalInit";
import { els } from "../core/els";
import { UIManager } from "./ui_manager";
import { ShareInterface } from "../CommonFrame/ShareInterface";
const { ccclass, property } = _decorator;

@ccclass("WhisperWinSingle")
export class WhisperWinSingle extends Component {
    @property(Node)
    public win_content = null;
    @property(Sprite)
    public win_content_icon = null;
    @property(Sprite)
    public user_win_content_icon = null;
    @property(Sprite)
    public win_whisper_image = null;
    @property(Label)
    public title = null;
    game: any;
    model: any;
    win_content_data: any;

    onLoad() {
        this.node.getChildByName("sShareBtn").on(Node.EventType.TOUCH_END, this.onwinShareHandler, this);
        this.node.getChildByName("sSaveBtn").on(Node.EventType.TOUCH_END, this.onwinSaveHandler, this);
        this.node.getChildByName("backBtn").on(Node.EventType.TOUCH_END, this.dismiss_btn_click, this);
        this.win_content = this.node.getChildByName("whisper_win_content");
        this.win_content_icon = this.node.getChildByName("whisper_win_content_icon");
    }

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
        let that = this;
        //todo check by zzg
        // resources.load("share_img/wisper_share", ImageAsset, (err, imageAsset: ImageAsset) => {
        //     let spriteFrame = new SpriteFrame();
        //     let texture = new Texture2D();
        //     texture.image = imageAsset;
        //     that.win_whisper_image.getComponent(Sprite).spriteFrame = spriteFrame;
        // });
    }

    dismiss_btn_click() {
        this.node.active = false;
        UIManager.hideAllUI();
        UIManager.showUI(els.ELS_GAME_LAYER.HOMEPAGE);
    }

    showWithData(data: any) {
        // tywx.AdManager.destroyBannerAd();
        let title = "恭喜通关";
        this.title.getComponent(Label).string = title;
        this.win_content_data = data;
        this.node.active = true;
        let _win_single = this.node;
        this.win_content.active = true;
        this.win_content.getComponent(Label).string = this.win_content_data.data;
        var self = this;
        assetManager.loadRemote(
            this.win_content_data.avatarUrl + "?aaa=aa.png",
            function (err, imageAsset: ImageAsset) {
                if (!err) {
                    let spriteFrame = new SpriteFrame();
                    let texture = new Texture2D();
                    texture.image = imageAsset;
                    spriteFrame.texture = texture;
                    self.win_content_icon.active = true;
                    self.win_content_icon.getComponent(Sprite).spriteFrame = spriteFrame;
                }
            }
        );
        assetManager.loadRemote(
            this.win_content_data.user_heard_url + "?aaa=aa.png",
            function (err, imageAsset: ImageAsset) {
                if (!err) {
                    let spriteFrame = new SpriteFrame();
                    let texture = new Texture2D();
                    texture.image = imageAsset;
                    self.user_win_content_icon.active = true;
                    self.user_win_content_icon.getComponent(Sprite).spriteFrame = spriteFrame;
                }
            }
        );
        var succ = _win_single.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs.resetSystem();
    }

    onwinShareHandler(eve: any) {
        this.stopAllParticleSys();
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.GAME_QQH_WIN,
        });
    }

    stopAllParticleSys() {
        var succ = this.node.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs2 = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs2.stopSystem();
    }

    onwinSaveHandler() {
        // console.log("onwinSaveHandler");
    }
}
