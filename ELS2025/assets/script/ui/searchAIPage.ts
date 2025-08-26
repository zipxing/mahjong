import { _decorator, Component, Label, Node, Sprite } from "cc";
import { els } from "../core/els";
import { UIManager } from "./ui_manager";
import { Main } from "../main";
const { ccclass, property } = _decorator;

@ccclass("SearchAIPage")
export class SearchAIPage extends Component {
    @property(Node)
    public gameNode = null;
    @property(Node)
    public searchdone = null;
    @property(Node)
    public searchai_msg = null;
    @property(Node)
    public mogu = null;
    game: any;
    model: any;

    onLoad() {}

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
    }

    showMe() {
        this.mogu.active = true;
        this.searchai_msg.active = true;
        this.searchdone.active = false;
        this.searchai_msg.string = "正在匹配对手...";
        var that = this;
        setTimeout(function () {
            that._searchResult();
            setTimeout(function () {
                UIManager.hideAllUI();
                UIManager.showUI(els.ELS_GAME_LAYER.GAME_VS);
                that.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
                that.game.startTimerCountdown(els.TIMER_COUNT);
            }, 2000);
        }, 1500);
    }

    _searchResult() {
        this.mogu.active = false;
        this.searchai_msg.active = false;
        this.searchdone.active = true;
        var random = Math.floor(Math.random() * 13);
        var headSpri = this.searchdone.getChildByName("headsprite").getComponent(Sprite);
        var info = this.searchdone.getChildByName("info_level_msg").getComponent(Label);
        var gameview = this.gameNode.getComponent(Main);
        if (gameview.headAtlas) {
            var frame = gameview.headAtlas.getSpriteFrame(random + 1);
            headSpri.spriteFrame = frame;
        }
        console.log("AILEVEL" + this.model.ailevel);
        info.string = els.PLAYER_TITLE2[parseInt(this.model.ailevel)][1];
    }
}

/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// var els = require("../core/els.js");
//
// Class({
//     extends: Component,
//
//     properties: {
//         gameNode : Node,
//         searchdone: Node,
//         searchai_msg:Node,
//         mogu:Node
//     },
//
//     // LIFE-CYCLE CALLBACKS:
//
//     onLoad () {},
//
//     start () {
//         this.game = UIManager.game;
//         this.model = this.game.model;
//     },
//
//     showMe : function () {
//         this.mogu.active = true;
//         this.searchai_msg.active = true;
//         this.searchdone.active = false;
//         this.searchai_msg.string = '正在匹配对手...';
//
//         var that = this;
//         setTimeout(function () {
//             that._searchResult();
//             setTimeout(function () {
//                 UIManager.hideAllUI();
//                 UIManager.showUI(els.ELS_GAME_LAYER.GAME_VS);
//                 that.model.setGameStatus(els.ELS_GAME_STATE.PLAYING);
//                 that.game.startTimerCountdown(els.ELS_TIMER_COUNT);
//             }, 2000);
//         }, 1500);
//     },
//
//     _searchResult: function () {
//         this.mogu.active = false;
//         this.searchai_msg.active = false;
//         this.searchdone.active = true;
//
//         var random = Math.floor(Math.random() * 13);
//
//         var headSpri = this.searchdone.getChildByName("headsprite").getComponent(Sprite);
//         var info = this.searchdone.getChildByName("info_level_msg").getComponent(Label);
//
//         var gameview = this.gameNode.getComponent('main');
//         if (gameview.headAtlas) {
//             var frame = gameview.headAtlas.getSpriteFrame(random + 1);
//             headSpri.spriteFrame = frame;
//         };
//
//         console.log("AILEVEL" + this.model.ailevel);
//         info.string = els.PLAYER_TITLE2[parseInt(this.model.ailevel)][1];
//     },
//     // update (dt) {},
// });
