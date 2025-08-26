import { Node, Vec2, Vec3, tween } from "cc";
import { Singleton } from "../Singleton";

/**
 * 简易UI管理
 * @type {{}}
 */
export class CUIManager extends Singleton {
    public Init() {
        if (!this._container) {
            this._container = {};
        }
        if (!this.uistack) {
            this.uistack = [];
        }
        return this;
    }
    public UnInit() {}
    //ui 容器
    _container: any = {};
    //ui 当前显示堆栈
    uistack: Array<any>;
    game: any;
    _curLayer: any;
    initGame(game) {
        this.game = game;
    }

    registerUI(uikey, uinode, jsname?) {
        if (!this._container) {
            this._container = {};
        }
        this._container[uikey] = this._container[uikey] || [];
        this._container[uikey] = {
            node: uinode,
            jsname: jsname,
        };
    }

    getUI(uikey) {
        let layer = this._container[uikey];
        return layer;
    }

    showUI(uikey, params?, withaction?, closepre?) {
        if (closepre === true) {
            this.popCurrentUI();
        }

        let layer = this._container[uikey];
        if (layer && layer.node) {
            this._curLayer = layer.node;
            var node = layer.node;
            node.active = true;
            if (layer.jsname) {
                var js = node.getComponent(layer.jsname);
                if (js && js.showMe) {
                    js.showMe(params);
                } else {
                    console.error("UI", node.name, "error: component  " + layer.jsname + "  not on " + node.name);
                }
            }
            //是否是bool。并且为true
            console.log("-----withaction 类型:----" + typeof withaction);
            if (typeof withaction === "boolean" && withaction !== false) this._doAction(node);
            this.pushCurrentUI(node);
        } else {
            console.error("UI", "error:  " + uikey + "  not in ui manager");
        }
    }

    _doAction(node: Node) {
        if (!node) return;
        node.setScale(0, 0);
        tween(node)
            .to(0.2, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: Vec3.ONE });
        // node.runAction(sequence(scaleTo(0.2, 1.1, 1.1), scaleTo(0.1, 1, 1)));
    }

    hideUI(uikey) {
        let layer = this._container[uikey];
        if (layer && layer.node) {
            var node = layer.node;
            node.active = false;
            var js = node.getComponent(layer.jsname);
            if (js && js.hideMe) {
                js.hideMe();
            }
            this.popCurrentUI();
        }
    }

    getCurrentUI() {
        if (this.uistack.length > 0) {
            return this.uistack[this.uistack.length - 1];
        }
        return undefined;
    }

    pushCurrentUI(layer) {
        if (layer) {
            this.uistack.push(layer);
        }
    }

    popCurrentUI() {
        if (this.uistack.length > 0) {
            this.uistack.pop();
        }
    }

    hideAllUI() {
        while (this.uistack.length > 0) {
            var node = this.uistack.pop();
            if (node) node.active = false;
        }
    }
}
export var UIManager = CUIManager.getInstance().Init();
let tywx = window["tywx"] || {};
tywx["UIManager"] = UIManager;
