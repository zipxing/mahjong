/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 15:07:01
 */
import { _decorator, Component, Sprite, Node, ScrollView, Prefab, Vec2, instantiate } from "cc";
import { els } from "../core/els";
import { isInWXChat } from "../CommonFrame/GlobalInit";
import { UIManager } from "./ui_manager";
const { ccclass, property } = _decorator;

@ccclass("Rank")
export class Rank extends Component {
    @property(Sprite)
    public sprOpenDataCanvasProxy = null;
    @property(Node)
    public sprRankChallengeSelected = null;
    @property(Node)
    public sprRankClassicSelected = null;
    @property(ScrollView)
    public scrollview = null;
    @property(Prefab)
    public rank_cell = null;

    onLoad() {}

    start() {}

    showMe() {
        if (!isInWXChat) return;
    }

    hideMe() {
        this.unscheduleAllCallbacks();
    }

    onRankChallengeSelected() {
        this.scrollview.scrollToTop(0, false);
        this._drawRankContentWithOpenDataCanvas("drawRankChallenge");
        this.sprRankChallengeSelected.active = true;
        this.sprRankClassicSelected.active = false;
    }

    onRankClassicSelected() {
        this.scrollview.scrollToTop(0, false);
        this._drawRankContentWithOpenDataCanvas("drawRankClassic");
        this.sprRankChallengeSelected.active = false;
        this.sprRankClassicSelected.active = true;
    }

    _drawRankContentWithOpenDataCanvas(drawCommand: any) {
        if (!isInWXChat) return;
        var self = this;
    }

    _drawRankData(data: any) {
        var w = 500;
        var h = 90;
        for (var i = 0; i < 21; i++) {
            var node = instantiate(this.rank_cell);
            node.position = new Vec2(0, h * i);
            node.parent = this.scrollview;
        }
    }

    btnClose() {
        this.hideMe();
        UIManager.hideUI(els.ELS_GAME_LAYER.RANK);
    }
}
