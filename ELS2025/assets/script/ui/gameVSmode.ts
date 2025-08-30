/**
 * 保星提示
 */
import { _decorator, Animation, Component, Label, Node, ParticleSystem, ParticleSystem2D, Prefab, tween, Vec2, Vec3 } from "cc";
import { tywx } from "../CommonFrame/GlobalInit";
import { els } from "../core/els";
import { UIManager } from "./ui_manager";
import { ShareInterface } from "../CommonFrame/ShareInterface";
import { StarControl } from "./star_control";
import { Main } from "../main";
import { GameButtonController } from "./GameButtonController";
const { ccclass, property } = _decorator;

@ccclass("GameVSmode")
export class GameVSmode extends Component {
    @property(Node)
    public gameNode = null;
    @property(Node)
    public keepstarOK = null;
    @property(Node)
    public keepstar = null;
    @property(Node)
    public lose = null;
    @property(Node)
    public win = null;
    @property(Prefab)
    public prefabMTAnima = null;
    @property(Node)
    public nodeAdapterBgHome = null;
    @property(Node)
    public nodeAdapterGame = null;
    
    // 游戏按钮控制器（运行时创建）
    private buttonController: GameButtonController = null;
    
    gameview: any;
    game: any;
    model: any;

    onLoad() {
        this.gameview = this.gameNode.getComponent(Main);
        this.lose = this.node.getChildByName("lose");
        this.win = this.node.getChildByName("win");
    }

    start() {}

    showMe() {
        this.game = UIManager.game;
        this.model = this.game.model;
        this.lose.active = false;
        this.win.active = false;
        this.keepstarOK.active = false;
        this.keepstar.active = false;
        this.stopAllParticleSys();
        this.nodeAdapterBgHome.active = false;
        this.nodeAdapterGame.active = true;
        
        // 创建游戏按钮控制器
        if (!this.buttonController) {
            this.buttonController = GameButtonController.createAndInit(this.game, this.node);
        }
    }

    showWin() {
        this.lose.active = false;
        this.win.active = true;
        var node = this.win.getChildByName("starcontainer");
        console.log("fengbing", "--------- pkstar_level: " + this.model, node);
        StarControl.createStars(node, els.PLAYER_TITLE2[this.model.pkstar_level][0], this.model.pkstar_level_get, 1);
        var bc = this.win.getChildByName("starlevel");
        bc.getComponent(Label).string = els.PLAYER_TITLE2[this.model.pkstar_level][1];
        setTimeout(function () {
            StarControl.playAddStarAni();
        }, 100);
        var succ = this.win.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs.resetSystem();
    }

    showLose() {
        console.log("showLose===>01");
        this.lose.active = true;
        this.win.active = false;
        this.keepstar.active = false;
        this.keepstarOK.active = false;
        if (!this.model.keepstar) {
            console.log(
                "showLose===>02",
                els.PLAYER_TITLE2[this.model.pkstar_level][0],
                els.PLAYER_TITLE2[this.model.pkstar_level][0]
            );
            this.lose.active = true;
            var node = this.lose.getChildByName("starcontainer");
            StarControl.createStars(
                node,
                els.PLAYER_TITLE2[this.model.pkstar_level][0],
                this.model.pkstar_level_get,
                1
            );
            var bc = this.lose.getChildByName("starlevel");
            bc.getComponent(Label).string = els.PLAYER_TITLE2[this.model.pkstar_level][1];
            console.log("show===>03", bc, node, node.active);
            setTimeout(function () {
                StarControl.playDelStarAni();
            }, 100);
            var shibai = this.lose.getChildByName("FangKuai_shibai");
            shibai.getComponent(Animation).play("FangKuai_shibai");
            let pcs = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
            pcs.resetSystem();
        } else {
            console.log("showLose===>03");
            this.keepstarOK.active = true;
            this.lose.active = false;
            var shibai = this.keepstarOK.getChildByName("FangKuai_shibai");
            shibai.getComponent(Animation).play("FangKuai_shibai");
            var node = this.keepstarOK.getChildByName("starcontainer");
            StarControl.createStars(
                node,
                els.PLAYER_TITLE2[this.model.pkstar_level][0],
                this.model.pkstar_level_get,
                1
            );
            var bc = this.keepstarOK.getChildByName("starlevel");
            bc.getComponent(Label).string = els.PLAYER_TITLE2[this.model.pkstar_level][1];
            setTimeout(function () {
                StarControl.playAddStarAni();
            }, 100);
            let pcs = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
            pcs.resetSystem();
        }
    }

    stopAllParticleSys() {
        var shibai = this.keepstarOK.getChildByName("FangKuai_shibai");
        shibai.getComponent(Animation).play("FangKuai_shibai");
        let pcs1 = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs1.stopSystem();
        var succ = this.win.getChildByName("FangKuai_shengli");
        succ.getComponent(Animation).play("FangKuai_shengli");
        let pcs2 = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs2.stopSystem();
    }

    showKeepStar() {
        this.lose.active = false;
        this.win.active = false;
        this.keepstarOK.active = false;
        this.keepstar.active = true;
        var btn = this.keepstar.getChildByName("btngiveup");
        var time: Node = this.keepstar.getChildByName("timettf");
        btn.active = false;
        time.getComponent(Label).string = 3 + "";
        setTimeout(function () {
            btn.active = true;
        }, 3000);
        // time.runAction(
        //     repeat(
        //         sequence(
        //             scaleTo(0.2, 1.2, 1.2),
        //             scaleTo(0.5, 1, 1),
        //             delayTime(0.3),
        //             callFunc(function () {
        //                 var label = time.getComponent(Label);
        //                 label.string = parseInt(label.string) - 1;
        //             })
        //         ),
        //         3
        //     )
        // );
        tween(time).repeat(
            3,
            tween(time)
                .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.5, { scale: Vec3.ONE })
                .delay(0.3)
                .call(() => {
                    var label = time.getComponent(Label);
                    label.string = parseInt(label.string) - 1 + "";
                })
        );
        var shibai = this.keepstar.getChildByName("FangKuai_shibai");
        shibai.getComponent(Animation).play("FangKuai_shibai");
        let pcs = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
        pcs.resetSystem();
    }

    btnKeepStarOk() {
        this.game.emergencyShare();
    }

    btnLoseBack() {
        this.stopAllParticleSys();
        UIManager.game.loseBackToHome();
    }

    btnRestarGame() {
        this.stopAllParticleSys();
        this.lose.active = false;
        this.game.reStartGame();
    }

    btnNextStage() {
        this.lose.active = false;
        this.win.active = false;
        this.stopAllParticleSys();
        this.game.nextStage();
    }

    btnKeepStarCancel() {
        this.game.cancelKeepStar();
    }

    btnKeepStarShare() {
        console.log("EEEEEEEEEE");
        if (this.game.model.keepstar == true) return;
        var time = this.keepstar.getChildByName("timettf");
        time.stopAllActions();
        this.game.keepStarShare();
    }

    btnShare() {
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.GAME_VS_WIN,
        });
    }
}
