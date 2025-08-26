import { _decorator, Component, Sprite, Node, Animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Star")
export class Star extends Component {
    @property(Sprite)
    public small_get = null;
    @property(Sprite)
    public small_not = null;
    @property(Sprite)
    public large_get = null;
    @property(Sprite)
    public large_not = null;
    @property(Node)
    public ani_add_node = null;
    @property(Node)
    public ani_del_node = null;
    _addAnimation: any;
    _delAnimation: any;
    _type: any;
    _state: any;
    size_w: number;

    onLoad() {
        this._addAnimation = this.ani_add_node.getComponent(Animation);
        this._delAnimation = this.ani_del_node.getComponent(Animation);
    }

    init(type: any, state: any) {
        console.log("star init start", type, state);
        this._resetState();
        this._type = type;
        this._state = state;
        if (type === 0) {
            //小
            if (state === 0) {
                this.small_not.node.active = true;
            } else {
                this.small_get.node.active = true;
            }
            this.size_w = 23;
        } else {
            //大
            if (state === 0) {
                this.large_not.node.active = true;
            } else {
                this.large_get.node.active = true;
            }
            this.size_w = 46;
        }
        console.log("star int end");
    }

    playAniAdd() {
        if (this._type == 0) return;
        this.ani_add_node.active = true;
        this._addAnimation.play();
    }

    playAnidel() {
        if (this._type == 0) return;
        this.ani_del_node.active = true;
        this._delAnimation.play();
    }

    _resetState() {
        this.small_get.node.active = false;
        this.small_not.node.active = false;
        this.large_get.node.active = false;
        this.large_not.node.active = false;
        this.ani_add_node.active = false;
        this.ani_del_node.active = false;
    }

    start() {
        var self = this;
        this._addAnimation.on(
            "finished",
            function () {
                self._state = 1;
                self.large_not.node.active = false;
                self.large_get.node.active = true;
            },
            this
        );
        this._delAnimation.on(
            "finished",
            function () {
                self._state = 0;
                self.large_not.node.active = true;
                self.large_get.node.active = false;
            },
            this
        );
    }
}
