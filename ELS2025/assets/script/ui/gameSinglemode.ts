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
    Vec3,
    Button,
    Sprite,
    UITransform,
    Color,
} from "cc";
import { els } from "../core/els";
import { tywx, WXUserInfo } from "../CommonFrame/GlobalInit";
import { UIManager } from "./ui_manager";
import { ShareInterface } from "../CommonFrame/ShareInterface";
import { Main } from "../main";
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
    public sl_bg = null;
    @property(Prefab)
    public prefabMTAnima = null;
    @property(Node)
    public nodeAdapterBgHome = null;
    @property(Node)
    public nodeAdapterGame = null;

    // 游戏控制按钮
    @property(Node)
    public btnRotate = null;
    @property(Node)
    public btnMoveLeft = null;
    @property(Node)
    public btnMoveRight = null;
    @property(Node)
    public btnDrop = null;

    gameview: any;
    game_mask: Node;
    mask_btn: any;
    game: any;
    model: any;

    onLoad() {
        this.gameview = this.gameNode.getComponent(Main);
        this.game_mask = this.node.getChildByName("game_mask");
        if (this.game_mask) {
            this.mask_btn = this.game_mask.getChildByName("mask_btn");
            if (this.mask_btn) {
                this.mask_btn.on(Node.EventType.TOUCH_END, this.mask_btn_click, this);
            }
        }
        if (this.lose_single) {
            this.lose_single.getChildByName("sBackBtn").on(Node.EventType.TOUCH_END, this.onloseBackHandler, this);
            this.lose_single.getChildByName("sreGameBtn").on(Node.EventType.TOUCH_END, this.onloseRegameHandler, this);
        }
        if (this.win_single) {
            this.win_single.getChildByName("sNextBtn").on(Node.EventType.TOUCH_END, this.onwinNextHandler, this);
            this.win_single.getChildByName("sShareBtn").on(Node.EventType.TOUCH_END, this.onwinShareHandler, this);
        }
    }

    start() {
        this.game = UIManager.game;
        this.model = this.game.model;
    }

    // updateWinLine() {
    //     let tmp_model = UIManager.game.model;
    //     this.winline.active = true;
    //     this.winline.opacity(150);
    //     var ltl = 2;
    //     var strContent = "";
    //     var pos_y = -421;
    //     var pos_x = 103;
    //     if (tmp_model.currentStage <= 20 && tmp_model.currentStage >= 0) {
    //         ltl = 6;
    //     } else if (tmp_model.currentStage <= 50 && tmp_model.currentStage > 20) {
    //         ltl = 4;
    //     } else if (tmp_model.currentStage > 50) {
    //         ltl = 2;
    //     }
    //     strContent = `消到${ltl}行以下过关`;
    //     pos_y = ltl * 50 + pos_y;
    //     this.winline.position = new Vec2(pos_x, pos_y);
    //     let labelContent = this.winline.getChildByName("label_win").getComponent(Label);
    //     labelContent.string = strContent;
    // }

    updateWinLine() {
        let tmp_model = UIManager.game.model;
        if (!this.winline) {
            console.warn("winline node is not assigned!");
            return;
        }
        this.winline.active = true;
        
        // 设置透明度
        const uiOpacity = this.winline.getComponent(UIOpacity);
        if (uiOpacity) {
            uiOpacity.opacity = 100;
        }
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
        
        // 设置正确的位置，保持较高的Z值以确保显示在最前面
        this.winline.position = new Vec3(pos_x, pos_y, 0);
        
        // 尝试找到标签节点，可能是 label_win 或 label_line
        let labelNode = this.winline.getChildByName("label_win") || this.winline.getChildByName("label_line");
        if (labelNode) {
            let labelContent = labelNode.getComponent(Label);
            if (labelContent) {
                labelContent.string = strContent;
            } 
        } 
    }

    createControlButtons() {
        // 如果按钮已经存在，直接显示
        if (this.btnRotate && this.btnMoveLeft && this.btnMoveRight && this.btnDrop) {
            this.btnRotate.active = true;
            this.btnMoveLeft.active = true;
            this.btnMoveRight.active = true;
            this.btnDrop.active = true;
            return;
        }

        // 创建按钮容器
        const buttonContainer = new Node("ControlButtons");
        buttonContainer.addComponent(UITransform);
        buttonContainer.getComponent(UITransform).setContentSize(720, 120);
        buttonContainer.position = new Vec3(0, -500, 0); // 放在界面底部
        this.node.addChild(buttonContainer);

        // 按钮配置
        const buttonConfigs = [
            { name: "btnRotate", text: "旋转", x: -210, prop: "btnRotate" },
            { name: "btnMoveLeft", text: "←", x: -70, prop: "btnMoveLeft" },
            { name: "btnMoveRight", text: "→", x: 70, prop: "btnMoveRight" },
            { name: "btnDrop", text: "↓", x: 210, prop: "btnDrop" }
        ];

        // 创建每个按钮
        buttonConfigs.forEach(config => {
            const btnNode = this.createButton(config.text, config.x, 0);
            buttonContainer.addChild(btnNode);
            
            // 将按钮赋值给对应的属性
            this[config.prop] = btnNode;
            
            // 绑定事件
            this.bindButtonEvent(btnNode, config.prop);
        });
    }

    createButton(text: string, x: number, y: number): Node {
        const btnNode = new Node("Button");
        
        // 添加UITransform组件
        const uiTransform = btnNode.addComponent(UITransform);
        uiTransform.setContentSize(80, 80);
        
        // 添加Sprite组件（按钮背景）
        const sprite = btnNode.addComponent(Sprite);
        sprite.color = new Color(100, 149, 237, 255); // 蓝色背景
        
        // 添加Button组件
        const button = btnNode.addComponent(Button);
        
        // 创建文字标签
        const labelNode = new Node("Label");
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(80, 80);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 24;
        label.color = new Color(255, 255, 255, 255); // 白色文字
        
        btnNode.addChild(labelNode);
        btnNode.position = new Vec3(x, y, 0);
        
        return btnNode;
    }

    bindButtonEvent(btnNode: Node, propName: string) {
        const button = btnNode.getComponent(Button);
        if (button) {
            switch (propName) {
                case "btnRotate":
                    button.node.on(Node.EventType.TOUCH_END, this.onRotateHandler, this);
                    break;
                case "btnMoveLeft":
                    button.node.on(Node.EventType.TOUCH_END, this.onMoveLeftHandler, this);
                    break;
                case "btnMoveRight":
                    button.node.on(Node.EventType.TOUCH_END, this.onMoveRightHandler, this);
                    break;
                case "btnDrop":
                    button.node.on(Node.EventType.TOUCH_END, this.onDropHandler, this);
                    break;
            }
        }
    }

    showMe() {
        if (this.win_single) this.win_single.active = false;
        if (this.lose_single) this.lose_single.active = false;
        if (this.sl_bg) this.sl_bg.active = false;
        this.updateWinLine();
        this.stopAllParticleSys();
        if (this.nodeAdapterBgHome) this.nodeAdapterBgHome.active = false;
        if (this.nodeAdapterGame) this.nodeAdapterGame.active = true;
        
        // 创建控制按钮
        this.createControlButtons();
    }

    hideMe() {
        this.winline.active = false;
        
        // 隐藏控制按钮
        if (this.btnRotate) this.btnRotate.active = false;
        if (this.btnMoveLeft) this.btnMoveLeft.active = false;
        if (this.btnMoveRight) this.btnMoveRight.active = false;
        if (this.btnDrop) this.btnDrop.active = false;
    }



    hideMask() {
        if (!this.game_mask) return;
        
        let opacity = this.game_mask.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.game_mask.addComponent(UIOpacity);
        }
        opacity.opacity = 255;
        tween(opacity)
            .to(0.5, { opacity: 0 })
            .call(() => {
                if (this.game_mask) {
                    this.game_mask.active = false;
                    opacity.opacity = 255;
                }
            });
    }

    showWin() {
        this.updateWinLine();
        if (this.lose_single) this.lose_single.active = false;
        var _win_single = undefined;
        if (this.win_single) {
            this.win_single.active = true;
            _win_single = this.win_single;
        }
        if (_win_single) {
            var succ = _win_single.getChildByName("FangKuai_shengli");
            if (succ) {
                succ.getComponent(Animation).play("FangKuai_shengli");
                let pcs = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
                if (pcs) pcs.resetSystem();
            }
        }
    }

    showLose() {
        if (this.lose_single) this.lose_single.active = true;
        if (this.win_single) this.win_single.active = false;
        if (this.lose_single) {
            var shibai = this.lose_single.getChildByName("FangKuai_shibai");
            if (shibai) {
                shibai.getComponent(Animation).play("FangKuai_shibai");
                let pcs = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
                if (pcs) pcs.resetSystem();
            }
        }
    }

    stopAllParticleSys() {
        if (this.lose_single) {
            var shibai = this.lose_single.getChildByName("FangKuai_shibai");
            if (shibai) {
                shibai.getComponent(Animation).play("FangKuai_shibai");
                let pcs1: ParticleSystem2D = shibai.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
                if (pcs1) pcs1.stopSystem();
            }
        }
        if (this.win_single) {
            var succ = this.win_single.getChildByName("FangKuai_shengli");
            if (succ) {
                succ.getComponent(Animation).play("FangKuai_shengli");
                let pcs2: ParticleSystem2D = succ.getChildByName("particlesystem01").getComponent(ParticleSystem2D);
                if (pcs2) pcs2.stopSystem();
            }
        }
    }

    mask_btn_click() {
        console.log("mask_btn_click");
        if (this.game && this.game.hiden_mask) {
            this.game.hiden_mask();
        }
    }

    onloseBackHandler(eve: any) {
        if (this.lose_single) this.lose_single.active = false;
        this.stopAllParticleSys();
        if (this.game && this.game.loseBackToHome) {
            this.game.loseBackToHome();
        }
    }

    onloseRegameHandler(eve: any) {
        if (this.lose_single) this.lose_single.active = false;
        this.stopAllParticleSys();
        if (this.game && this.game.reStartGame) {
            this.game.reStartGame();
        }
    }

    onwinNextHandler(eve: any) {
        this.stopAllParticleSys();
        if (this.win_single) this.win_single.active = false;
        console.log("fengbing", " *-*-*-*- win next handler *-*-*-*-");
        if (this.game && this.game.nextStage) {
            this.game.nextStage();
        }
    }

    onwinShareHandler(eve: any) {
        this.stopAllParticleSys();
        // 闯关胜利 分享
        ShareInterface.shareMsg({
            type: els.SHRAE_TYPE.GAME_SINGLE_WIN,
        });
    }

    onwinSaveHandler() {
        console.log("onwinSaveHandler");
    }

    // 控制按钮事件处理函数
    onRotateHandler(eve: any) {
        console.log("旋转按钮被点击");
        if (this.game && this.game.playActionBase) {
            this.game.playActionBase(0, "T"); // T表示旋转
        }
    }

    onMoveLeftHandler(eve: any) {
        console.log("左移按钮被点击");
        if (this.game && this.game.playActionBase) {
            this.game.playActionBase(0, "L"); // L表示左移
        }
    }

    onMoveRightHandler(eve: any) {
        console.log("右移按钮被点击");
        if (this.game && this.game.playActionBase) {
            this.game.playActionBase(0, "R"); // R表示右移
        }
    }

    onDropHandler(eve: any) {
        console.log("下落按钮被点击");
        if (this.game && this.game.playActionBase) {
            this.game.playActionBase(0, "W"); // W表示直接下落
        }
    }
}
