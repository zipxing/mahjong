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
    make_share: Node;
    submit_btn: any;
    plaintext: any;
    ciphertext: any;
    show_share: Node;
    share_img: any;
    show_share_loading: any;
    show_data: any;
    share_tips: any;
    share_tips_img: any;
    text_tip_p: any;
    text_tip_w: any;
    game: any;
    model: any;
    _query: any;

    onLoad() {
        this.menu = this.node.getChildByName("menu");
        this.make_share = this.node.getChildByName("make_share");
        this.submit_btn = this.make_share.getChildByName("submit_btn");
        this.plaintext = this.make_share.getChildByName("plaintext");
        this.ciphertext = this.make_share.getChildByName("ciphertext");
        this.show_share = this.node.getChildByName("show_share");
        this.share_img = this.show_share.getChildByName("share_img");
        this.show_share_loading = this.show_share.getChildByName("show_share_loading");
        this.show_data = {};
        this.share_tips = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE)
            .node.getChildByName("sl_bg")
            .getChildByName("sl_tips");
        this.share_tips_img = UIManager.getUI(els.ELS_GAME_LAYER.GAME_SINGLE)
            .node.getChildByName("sl_bg")
            .getChildByName("sl_icon");
        this.show_share.getChildByName("reset_editing_btn").on("click", this.reset_editing_btn_click, this);
        this.show_share.getChildByName("back_home_btn").on("click", this.back_home_btn_click, this);
        this.plaintext.on("editing-did-began", this.editingDidBegan_plaintext, this);
        this.plaintext.on("editing-did-ended", this.editingDidEnded_plaintext, this);
        this.ciphertext.on("editing-did-began", this.editingDidBegan_ciphertext, this);
        this.ciphertext.on("editing-did-ended", this.editingDidEnded_ciphertext, this);
        this.text_tip_p = this.make_share.getChildByName("text_tip_plaint");
    }

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
        this.playLogoAnimationRandom();
        this.model.checkPlayMusic();
        this.refreshSoundBtnState();
        this.refreshStar();
    }

    editingDidBegan_plaintext(ret: any) {
        console.log(ret);
        this.text_tip_p.active = false;
    }

    editingDidEnded_plaintext(ret: any) {
        console.log(ret);
        let plaintext = this.plaintext.getComponent(EditBox).string;
        if (plaintext.length === 0) {
            this.text_tip_p.active = true;
        } else {
            let ciphertext = this.ciphertext.getComponent(EditBox).string;
            if (ciphertext.length === 0) {
                this.text_tip_w.active = true;
            }
        }
    }

    editingDidBegan_ciphertext(ret: any) {
        this.text_tip_w.active = false;
    }

    editingDidEnded_ciphertext(ret: any) {
        let ciphertext = this.ciphertext.getComponent(EditBox).string;
        var plaintext = this.plaintext.getComponent(EditBox).string;
        if (ciphertext.length == 0 && plaintext.length > 0) {
            this.text_tip_w.active = true;
        }
    }

    showMe() {
        console.log("homepage showMe");
        this.nodeAdapterBgHome.active = true;
        this.nodeAdapterGame.active = false;
        this.refreshStar();
    }

    onEnable() {
        this.text_tip_p.active = true;
        this.plaintext.getComponent(EditBox).string = "";
        this.ciphertext.getComponent(EditBox).string = "";
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

    create_btn_click(event: any) {
        console.log("create_btn_click");
        this.make_share.active = true;
    }

    submit_btn_click(event: any) {
        console.log("submit_btn_click");
        var reg = new RegExp("^[\\u4E00-\\u9FFF]+$", "g");
        var plaintext = this.plaintext.getComponent(EditBox).string;
        var ciphertext = this.ciphertext.getComponent(EditBox).string;
        if (!reg.test(plaintext) || plaintext.length > 6 || plaintext.length < 2) {
            return;
        }
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (!reg.test(ciphertext) || ciphertext.length > 6 || ciphertext.length < 2) {
            return;
        }
        SecretLanguage.get_wxtetris_makeimage(plaintext, ciphertext, "send");
        this.make_share.active = !this.make_share.active;
        this.show_share.active = true;
    }

    show_btn_click(event: any) {
        console.log(this.show_data);
        var _imageUrl = this.show_data["imgUrl"];
        var self = this;
        var shareAppMsg = function (inviteName, avatarUrl) {
            var _imageUrl = self.show_data["imgUrl"];
            var plaintext = self.show_data["plainText"];
            var ciphertext = self.show_data["cipherText"];
            var _query =
                "plaintext=" +
                plaintext +
                "&ciphertext=" +
                ciphertext +
                "&inviteName=" +
                inviteName +
                "&avatarUrl=" +
                avatarUrl +
                "&randomKey=" +
                Util.createUUID();
            ShareInterface.shareMsg({
                type: els.SHRAE_TYPE.GAME_QQH_MAKE,
                imageUrl: _imageUrl,
                query: _query,
                successCallback: function (ret) {
                    self.show_share.active = !self.show_share.active;
                },
                failCallback: function () {
                    console.log("分享失败");
                },
            });
        };
        if (WXUserInfo) {
            var inviteName = WXUserInfo.nickName;
            var avatarUrl = WXUserInfo.avatarUrl;
            shareAppMsg(inviteName, avatarUrl);
        } else {
            OpenDataContextUtil.getUserInfo(
                function (ret) {
                    console.log("ret-->" + ret);
                    let userInfo = ret[0];
                    WXUserInfo.nickName = userInfo.nickName;
                    WXUserInfo.avatarUrl = userInfo.avatarUrl;
                    var inviteName = WXUserInfo.nickName;
                    var avatarUrl = WXUserInfo.avatarUrl;
                    shareAppMsg(inviteName, avatarUrl);
                },
                function (ret) {
                    console.log(ret);
                }
            );
        }
    }


    back_btn_1_click() {
        this.make_share.active = false;
        this.onEnable();
    }

    back_btn_2_click() {
        this.show_share.active = false;
        this.onEnable();
    }

    reset_editing_btn_click() {
        this.show_share.active = false;
        this.make_share.active = true;
    }

    back_home_btn_click() {
        this.show_share.active = false;
    }



    _drawWithData(data: any, _node: any) {
        this.show_share.getChildByName("show_share_bg").removeAllChildren();
        var plainData = data["plainData"];
        var cipherData = data["cipherData"];
        for (var n = 0; n < 6; n++) {
            var data = cipherData.length > n ? cipherData[n] : undefined;
            this._draw_one_data(data, n);
            if (!data) {
                continue;
            }
        }
    }

    _draw_one_data(data: any, idx: any) {
        var dx = -this.node.width / 2 + 20;
        var dy = 437;
        var _w = 215;
        var _h = 316;
        var _offset_x = (this.node.width - _w * 3) / 4;
        var _offset_y = 12;
        var _x = dx + (idx % 3) * _offset_x + (idx % 3) * _w;
        var _y = dy - (idx >= 3 ? 1 : 0) * (_h + _offset_y);
        var _node = instantiate(this.label_content);
        _node.position = new Vec2(_x, _y);
        _node.parent = this.show_share.getChildByName("show_share_bg");
        var length = 11;
        var _toffset = 1;
        var _tw = (_w - (length + 1) * _toffset) / 11;
        var _tdy = -_h + _w;
        if (!data) {
            return;
        }
        var s_x = 0;
        for (var i = 0, il = data.length; i < il; i++) {
            var c_id = 1 + parseInt(((Math.random() * 10000) % 10).toString());
            var sf = this.game.gameNode.getComponent(Main).blockimgs[c_id];
            for (var j = 0, jl = data[i].length; j < jl; j++) {
                if (data[i][j]) {
                    var c = instantiate(this.game.gameNode.getComponent(Main).prefabblock);
                    c.getComponent("Sprite").spriteFrame = sf;
                    c.scale = _tw / 72;
                    var _tx = _toffset + j * (_tw + _toffset);
                    var _ty = _tdy - _toffset - (i + 1) * (_toffset + _tw);
                    c.position = new Vec2(_tx, _ty);
                    c.parent = _node;
                }
            }
        }
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
