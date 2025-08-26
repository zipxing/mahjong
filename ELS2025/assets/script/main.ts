/**
 * 展示连击动画
 *
 * @param {int} combo_count
 */
/**
 * 播放消除动画
 *
 * @param {int} clear_count 消除的行数
 */
import {
    _decorator,
    assert,
    assetManager,
    Component,
    EventTouch,
    ImageAsset,
    instantiate,
    Label,
    loader,
    Node,
    Prefab,
    resources,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
    Texture2D,
    UIOpacity,
    UITransform,
    Vec2,
    Vec3,
} from "cc";
import { NotificationCenter } from "./CommonFrame/NotificationCenter";
import { OpenDataContextUtil } from "./CommonFrame/OpenDataContextUtil";
import { StarControl } from "./ui/star_control";
import { UIManager } from "./ui/ui_manager";
import { tywx, WXUserInfo, GameUserInfo, UserRankData } from "./CommonFrame/GlobalInit";
import { els } from "./core/els";
import { nge } from "./core/engine";
import { ElsGame } from "./core/game";
import { ElsGrid } from "./core/grid";
import { ElsRender } from "./core/render";
import { ElsTouch } from "./core/touch";
import { ElsModel } from "./core/model";
import { ShareGiftAnimationView } from "./ui/shareGiftAnimationView";
import { GameSinglemode } from "./ui/gameSinglemode";
import { GameVSmode } from "./ui/gameVSmode";
import { ComboAnimation } from "./ui/ComboAnimation";
const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {
    @property(Node)
    public gameCommon = null;
    @property(Node)
    public hgNode = null;
    @property(Node)
    public saiNode = null;
    @property(Node)
    public gvsNode = null;
    @property(Node)
    public gleNode = null;
    @property(Node)
    public helpNode = null;
    @property(Node)
    public rankNode = null;
    @property(Node)
    public beyondNode = null;
    @property(Node)
    public pause = null;
    @property(Prefab)
    public prefabblock = null;
    @property(Prefab)
    public prefabattack0 = null;
    @property(Prefab)
    public prefabattack1 = null;
    @property([SpriteFrame])
    public blockimgs = [];
    @property(Prefab)
    public p_c = null;
    @property(Prefab)
    public mask_label = null;
    @property(Prefab)
    public prefabGiftAnimation = null;
    @property(Node)
    public nodeYanHua = null;
    @property(Prefab)
    public prefabCombo = null;
    headAtlas: any;
    lbl_next: Node;
    lbl_hold: Node;
    yanhua: any;
    backmask: Node;
    add5step: any;
    share5line: any;
    share5step: any;
    animShare5Line: any;
    animShare5Step: any;
    lbl_time: Node;
    lbl_antiscore: Node;
    lbl_progress: Node;
    lbl_title: Node;
    lbl_myscore: Node;
    back: Node;
    shadow: Node;
    mask: Node;
    ad: Node;
    timestep: Node;
    combo: any[];
    blocks: any[][];
    holdnext: any[][];
    attani: any[][][];
    singleView: any;
    vsView: any;
    tou: any;
    game: any;
    frametime: number;
    pk_star_data: any;

    onLoad() {
        // debug.setDisplayStats(false);
        NotificationCenter.listen("STATUS_CHANGE", this.onStatusChange, this);
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.headAtlas = undefined;
        var self = this;
        resources.load("heads/heads", SpriteAtlas, function (err, atlas) {
            self.headAtlas = atlas;
        });
        UIManager.registerUI(els.ELS_GAME_LAYER.HOMEPAGE, this.hgNode, "HomePage");
        UIManager.registerUI(els.ELS_GAME_LAYER.GAME_COMMON, this.gameCommon);
        UIManager.registerUI(els.ELS_GAME_LAYER.GAME_SINGLE, this.gleNode, "GameSinglemode");
        UIManager.registerUI(els.ELS_GAME_LAYER.GAME_VS, this.gvsNode, "GameVSmode");
        UIManager.registerUI(els.ELS_GAME_LAYER.GAME_SEARCH_AI, this.saiNode, "SearchAIPage");
        UIManager.registerUI(els.ELS_GAME_LAYER.RANK, this.rankNode, "Rank");
        UIManager.registerUI(els.ELS_GAME_LAYER.HELP, this.helpNode);
        StarControl.init();
    }

    init() {
        this.lbl_next = this.node.getChildByName("next");
        this.lbl_hold = this.node.getChildByName("hold");
        this.yanhua = this.nodeYanHua;
        this.backmask = this.node.getChildByName("backmask");
        this.add5step = this.gleNode.getChildByName("add5step");
        this.add5step.opacity(0);
        this.share5line = this.gvsNode.getChildByName("share-5");
        this.share5line.active = false;
        this.share5step = this.gleNode.getChildByName("share+5");
        this.share5line.active = false;
        this.animShare5Line = instantiate(this.prefabGiftAnimation);
        this.animShare5Line.getComponent(ShareGiftAnimationView).init("分享到群\n减5行");
        this.animShare5Line.parent = this.share5line;
        this.animShare5Step = instantiate(this.prefabGiftAnimation);
        this.animShare5Step.getComponent(ShareGiftAnimationView).init("分享到群\n加5步");
        this.animShare5Step.parent = this.share5step;
        this.pause = this.pause; //this.node.getChildByName('pause');
        this.lbl_time = this.node.getChildByName("time");
        this.lbl_antiscore = this.node.getChildByName("lbl_antiscore");
        this.lbl_progress = this.node.getChildByName("lbl_progress");
        this.lbl_title = this.node.getChildByName("lbl_title");
        this.lbl_myscore = this.node.getChildByName("lbl_myscore");
        this.back = this.node.getChildByName("back");
        this.shadow = this.node.getChildByName("shadow");
        let scale2 = 9.8 / els.HENG;
        this.shadow.scale = new Vec3(scale2, scale2, 1);
        this.mask = this.node.getChildByName("mask");
        this.ad = this.node.getChildByName("ad");
        this.timestep = this.node.getChildByName("timestep");
        this.combo = [];
        this.combo[0] = this.node.getChildByName("combo0");
        this.combo[1] = this.node.getChildByName("combo1");
        this.node.getChildByName("back").removeAllChildren();
        this.blocks = [[], []];
        for (var n = 0; n < 2; n++) {
            for (var i = 0, il = els.ZONG; i < il; i++) {
                this.blocks[n][i] = new Array(els.HENG + 1);
                for (var j = 0, jl = els.HENG + 1; j < jl; j++) {
                    var c: Node = instantiate(this.prefabblock);
                    this.blocks[n][i][j] = c;
                    var scale = n == 0 ? 6.6 / els.HENG : 2.4 / els.HENG;
                    var bsize = 72 * scale + 2;
                    c.setScale(scale, scale, 1);
                    this.setBlkColor(c, 0, 8);
                    if (n == 0) c.setPosition(new Vec3(216 + j * bsize, 215 + i * bsize, 0)); //自己202
                    if (n == 1) c.setPosition(new Vec3(14 + j * bsize, 810 + i * bsize, 0)); //AI  796
                    c.parent = this.node.getChildByName("back");
                }
            }
        }
        this.holdnext = [[], [], []];
        var by = [295, 530, 430];
        for (var n = 0; n < 3; n++) {
            for (var i = 0; i < 4; i++) {
                this.holdnext[n][i] = new Array(4);
                for (var j = 0; j < 4; j++) {
                    var c: Node = instantiate(this.prefabblock);
                    this.holdnext[n][i][j] = c;
                    c.setScale(0.18, 0.18, 1);
                    var bsize = 72 * 0.18 + 2;
                    this.setBlkColor(c, 50, 10);
                    c.setPosition(new Vec3(72 + j * bsize, 170 + by[n] - i * bsize, 0));
                    c.parent = this.node.getChildByName("back");
                }
            }
        }
        this.node.getChildByName("anim").removeAllChildren();
        this.attani = [
            [[], [], [], [], []],
            [[], [], [], [], []],
        ];
        var scaletail = [2.0, 1.5, 1.35, 1.2, 1.05, 0.9];
        var op = [255, 255, 220, 190, 160, 130];
        for (var n = 0; n < 2; n++) {
            for (var i = 0; i < 5; i++) {
                this.attani[n][i] = new Array(6);
                for (var j = 0; j < 6; j++) {
                    var c: Node = j == 0 ? instantiate(this.prefabattack0) : instantiate(this.prefabattack1);
                    this.attani[n][i][j] = c;
                    let scale = scaletail[j];
                    c.setScale(scale, scale, 1);
                    c.opacity(op[j]);
                    c.getComponent(Sprite).enabled = false;
                    c.parent = this.node.getChildByName("anim");
                }
            }
        }
        this.beyondNode.active = false;
    }

    start() {
        this.init();
        this.singleView = this.gleNode.getComponent(GameSinglemode);
        this.vsView = this.gvsNode.getComponent(GameVSmode);
        var m = new ElsModel(ElsGrid);
        var r = new ElsRender();
        var game = new ElsGame(m, r);
        var tou = new ElsTouch(game);
        this.tou = tou;
        m.tou = tou;
        game.initGame(this.node, 0, parseInt((Math.random() * 10000).toString()));
        m.setGameStatus(els.ELS_GAME_STATE.HOMEPAGE);
        this.game = game;
        UIManager.initGame(this.game);
        game.model.begin_help1st = -1;
        game.model.begin_cd = -1;
        game.model.begin_win_partical = -1;
        if (parseInt(game.loadItem("ELS_HELP1ST", 0)) === 0) game.model.needhelp1st = true;
        else game.model.needhelp1st = false;
        game.model.pkstar = parseInt(game.loadItem("ELS_PKSTAR", 0));
        game.model.pkstar = !game.model.pkstar ? 0 : game.model.pkstar;
        game.updatePKStar(0);
        this.frametime = 0;
        nge.nge.run(this.game);
        UIManager.showUI(els.ELS_GAME_LAYER.HOMEPAGE, null, false);
        this.getWXUserInfo();
        this.getFriendCloudStorage();
    }

    getNextUserInfo() {
        let getdat = function (_type, data) {
            if (!data) {
                return undefined;
            }
            let d = undefined;
            for (let i = 0; i < data.length; i++) {
                if (data[i].key == _type) {
                    console.log(data[i].value);
                    d = data[i].value;
                }
            }
            return parseInt(d);
        };
        for (let i = 0; i < this.pk_star_data.length; i++) {
            let t = this.pk_star_data[i];
            if (t.nickname == WXUserInfo.nickName && t.avatarUrl == WXUserInfo.avatarUrl) {
                UserRankData.KVDataList = t.KVDataList;
            }
        }
        var next_pk_star_data = undefined;
        var next_current_stage = undefined;
        let user_data = UserRankData.KVDataList.length > 0 ? UserRankData.KVDataList : undefined;
        for (let i = 0; i < this.pk_star_data.length; i++) {
            let t = this.pk_star_data[i];
            let data = t.KVDataList.length > 0 ? t.KVDataList : undefined;
            if (getdat("ELS_PKSTAR", data) > getdat("ELS_PKSTAR", user_data)) {
                console.log("123");
                if (!next_pk_star_data) {
                    next_pk_star_data = data;
                }
                if (getdat("ELS_PKSTAR", data) < getdat("ELS_PKSTAR", next_pk_star_data)) {
                    next_pk_star_data = data;
                    GameUserInfo.next_pk_user = t;
                }
            }
            if (getdat("ELS_CURRENT_STAGE2", data) > getdat("ELS_CURRENT_STAGE2", user_data)) {
                console.log("123");
                if (!next_current_stage) {
                    next_current_stage = data;
                }
                if (
                    next_current_stage &&
                    getdat("ELS_CURRENT_STAGE2", data) < getdat("ELS_CURRENT_STAGE2", next_current_stage)
                ) {
                    next_current_stage = data;
                    GameUserInfo.next_current_stage_user = t;
                }
            }
        }
        console.log("getNextUserInfo");
    }

    getFriendCloudStorage() {
        let self = this;
        OpenDataContextUtil.getFriendCloudStorage(
            ["ELS_PKSTAR", "ELS_CURRENT_STAGE2"],
            function (para) {
                console.log(JSON.stringify(para));
                self.pk_star_data = para;
                self.getNextUserInfo();
            },
            function (para) {
                console.log(JSON.stringify(para));
            }
        );
    }

    getWXUserInfo() {
        let self = this;
        OpenDataContextUtil.getUserInfo(
            function (ret) {
                console.log("ret-->" + ret);
                tywx["WXUserInfo"] = ret[0];
                self.getFriendCloudStorage();
            },
            function (ret) {
                console.log(ret);
            }
        );
    }

    refreshBgAdapter() {}

    onStatusChange(status: any) {
        switch (status) {
            case els.ELS_GAME_STATE.PLAYING:
                this.refreshShow(this.game.model.mconf.mode);
                break;
            case els.ELS_GAME_STATE.RESULT_LOSE:
                this.showGameLost();
                break;
            case els.ELS_GAME_STATE.RESULT_WIN:
                this.showGameWin();
                break;
            case els.ELS_GAME_STATE.KEEPSTAR:
                this.vsView.showKeepStar();
                break;
            case els.ELS_GAME_STATE.SEARCH_AI:
                UIManager.showUI(els.ELS_GAME_LAYER.GAME_SEARCH_AI);
                break;
        }
    }

    emergencyShare() {
        this.game.emergencyShare();
    }

    showGameLost() {
        if (this.game.model.mconf.mode === els.ELS_MODE_SINGLE) {
            this.singleView.showLose();
        } else {
            this.vsView.showLose();
        }
    }

    showGameWin() {
        if (this.game.model.mconf.mode === els.ELS_MODE_SINGLE) {
            this.singleView.showWin();
        } else {
            this.vsView.showWin();
        }
    }

    btnPause() {
        if (this.game.model.getGameStatus() === els.ELS_GAME_STATE.PLAYING) {
            this.pause.active = true;
            this.game.pauseGame();
        }
    }

    btnContinue() {
        this.pause.active = false;
        this.game.continueGame();
    }

    btnBackToHome() {
        this.pause.active = false;
        UIManager.hideAllUI();
        this.game._backToHomePage();
        UIManager.showUI(els.ELS_GAME_LAYER.HOMEPAGE);
    }

    touchStart(event: EventTouch) {
        var t1 = event.getLocation();
        var temp = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(t1.x, t1.y, 0));
        this.tou.began(temp.x, temp.y);
    }

    touchMove(event: EventTouch) {
        var t1 = event.getLocation();
        var temp = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(t1.x, t1.y, 0));
        this.tou.moved(temp.x, temp.y);
    }

    touchEnd(event: EventTouch) {
        var t1 = event.getLocation();
        var temp = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(t1.x, t1.y, 0));
        this.tou.ended(temp.x, temp.y);
    }

    update(dt: any) {
        this.frametime += dt;
        if (this.frametime >= 0.02) {
            this.frametime = 0;
            nge.nge.run(this.game);
        }
    }

    setBlkColor(c: Node, op: any, idx: any, scale?: any) {
        var cmap = [0, 9, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0];
        let opacity = c.getComponent(UIOpacity);
        if (!opacity) {
            opacity = c.addComponent(UIOpacity);
        }
        opacity.opacity = op;
        if (scale != null && scale != undefined) {
            c.setScale(scale * c.scale.x, scale * c.scale.y, 1);
        }
        c.getComponent(Sprite).spriteFrame = this.blockimgs[cmap[idx]];
    }

    refreshShow(mode: any) {
        this.pause.active = false;
        if (mode != els.ELS_MODE_SINGLE) {
            this.timestep.getComponent(Label).string = "时间";
            this.ad.opacity(0);
        } else {
            this.timestep.getComponent(Label).string = "剩余步数";
            this.ad.opacity(195);
        }
    }

    showCombo(combo_count: any) {
        let combo = instantiate(this.prefabCombo);
        combo.parent = this.node;
        combo.position = new Vec2(320, 640);
        combo.getComponent(ComboAnimation).init(true, combo_count);
    }

    showClearAnimation(clear_count: any) {
        // console.log('showClearAnimation',clear_count);
        // let combo = instantiate(this.prefabCombo);
        // combo.parent = this.node;
        // combo.position = new Vec2(320,640);
        // combo.getComponent('ComboAnimation').init(false, clear_count);
    }

    showBeyondNode(_type: any) {
        let self = this;
        let _data = undefined;
        this.beyondNode.active = false;
        this.ad.active = false;
        if (_type == "ELS_CURRENT_STAGE2") {
            this.ad.active = true;
            _data = GameUserInfo.next_current_stage_user;
        } else if (_type == "ELS_PKSTAR") {
            _data = GameUserInfo.next_pk_user;
        }
        if (!_data) {
            return;
        }
        this.ad.active = false;
        this.beyondNode.active = true;
        assetManager.loadRemote(_data.avatarUrl + "?aaa=aa.png", (err, imageAsset: ImageAsset) => {
            if (!err) {
                let spriteFrame = new SpriteFrame();
                let texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                self.beyondNode.getChildByName("user_icon").getComponent(Sprite).spriteFrame = spriteFrame;
            }
        });
        self.beyondNode.getChildByName("user_name").getComponent(Label).string = _data.nickname;
        self.beyondNode.getChildByName("user_score").getComponent(Label).string = "";
    }

    hidenBeyondNode() {
        this.beyondNode.active = false;
    }
}
