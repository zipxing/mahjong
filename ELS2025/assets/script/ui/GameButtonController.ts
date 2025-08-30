import {
    _decorator,
    Component,
    Node,
    Button,
    Sprite,
    UITransform,
    Color,
    Label,
    Vec3,
} from "cc";

const { ccclass, property } = _decorator;

/**
 * 游戏按钮控制器 - 可复用的游戏控制按钮组件
 * 支持长按重复功能
 */
@ccclass("GameButtonController")
export class GameButtonController extends Component {
    // 游戏控制按钮
    @property(Node)
    public btnRotate = null;
    @property(Node)
    public btnMoveLeft = null;
    @property(Node)
    public btnMoveRight = null;
    @property(Node)
    public btnDrop = null;
    @property(Node)
    public btnDown = null;
    @property(Node)
    public btnHold = null;

    // 长按重复功能相关属性
    private repeatTimers: Map<string, number> = new Map(); // 存储各按钮的定时器ID
    private repeatIntervals: Map<string, number> = new Map(); // 存储各按钮的重复间隔定时器ID
    private readonly INITIAL_DELAY = 300; // 首次重复前的延迟时间(ms)
    private readonly REPEAT_INTERVAL = 150; // 重复间隔时间(ms)

    // 游戏实例引用
    private game: any = null;

    /**
     * 初始化按钮控制器
     * @param gameInstance 游戏实例，需要有playActionBase方法
     * @param parentNode 父节点，按钮将添加到此节点下
     */
    public initController(gameInstance: any, parentNode: Node) {
        this.game = gameInstance;
        this.createControlButtons(parentNode);
    }

    /**
     * 静态方法：创建并初始化按钮控制器
     * 这个方法可以在任何地方调用，不需要在编辑器中预先分配组件
     */
    public static createAndInit(gameInstance: any, parentNode: Node): GameButtonController {
        // 创建一个新的GameButtonController实例
        const controllerNode = new Node("GameButtonController");
        const controller = controllerNode.addComponent(GameButtonController);
        
        // 将控制器节点添加到父节点（但不显示，只是为了管理生命周期）
        parentNode.addChild(controllerNode);
        controllerNode.active = false; // 隐藏控制器节点本身
        
        // 初始化控制器
        controller.initController(gameInstance, parentNode);
        
        return controller;
    }

    /**
     * 创建控制按钮
     */
    private createControlButtons(parentNode: Node) {
        // 如果按钮已经存在，直接显示
        if (this.btnRotate && this.btnMoveLeft && this.btnMoveRight && this.btnDrop && this.btnDown && this.btnHold) {
            this.btnRotate.active = true;
            this.btnMoveLeft.active = true;
            this.btnMoveRight.active = true;
            this.btnDrop.active = true;
            this.btnDown.active = true;
            this.btnHold.active = true;
            return;
        }

        // 创建按钮容器
        const buttonContainer = new Node("ControlButtons");
        buttonContainer.addComponent(UITransform);
        buttonContainer.getComponent(UITransform).setContentSize(540, 120);
        buttonContainer.position = new Vec3(0, -500, 0); // 放在界面底部
        parentNode.addChild(buttonContainer);

        // 按钮配置
        const buttonConfigs = [
            { name: "btnRotate", text: "turn", x: -225, prop: "btnRotate" },
            { name: "btnMoveLeft", text: "←", x: -135, prop: "btnMoveLeft" },
            { name: "btnDown", text: "↓", x: -45, prop: "btnDown" },
            { name: "btnMoveRight", text: "→", x: 45, prop: "btnMoveRight" },
            { name: "btnDrop", text: "drop", x: 135, prop: "btnDrop" },
            { name: "btnHold", text: "hold", x: 225, prop: "btnHold" }
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

    /**
     * 创建单个按钮
     */
    private createButton(text: string, x: number, y: number): Node {
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

    /**
     * 绑定按钮事件
     */
    private bindButtonEvent(btnNode: Node, propName: string) {
        if (!btnNode) {
            console.error("bindButtonEvent: btnNode is null");
            return;
        }
        const button = btnNode.getComponent(Button);
        if (button) {
            switch (propName) {
                case "btnRotate":
                case "btnMoveLeft":
                case "btnMoveRight":
                case "btnDrop":
                case "btnDown":
                case "btnHold":
                    button.node.on(Node.EventType.TOUCH_START, () => this.onButtonTouchStart(propName), this);
                    button.node.on(Node.EventType.TOUCH_END, () => this.onButtonTouchEnd(propName), this);
                    button.node.on(Node.EventType.TOUCH_CANCEL, () => this.onButtonTouchEnd(propName), this);
                    break;
            }
        }
    }

    /**
     * 按钮按下事件处理
     */
    private onButtonTouchStart(propName: string) {
        // 立即执行一次动作
        this.executeButtonAction(propName);
        
        // 设置初始延迟定时器
        const initialTimer = setTimeout(() => {
            // 设置重复间隔定时器
            const intervalTimer = setInterval(() => {
                this.executeButtonAction(propName);
            }, this.REPEAT_INTERVAL);
            
            this.repeatIntervals.set(propName, intervalTimer);
        }, this.INITIAL_DELAY);
        
        this.repeatTimers.set(propName, initialTimer);
    }
    
    /**
     * 按钮松开事件处理
     */
    private onButtonTouchEnd(propName: string) {
        // 清除初始延迟定时器
        const initialTimer = this.repeatTimers.get(propName);
        if (initialTimer) {
            clearTimeout(initialTimer);
            this.repeatTimers.delete(propName);
        }
        
        // 清除重复间隔定时器
        const intervalTimer = this.repeatIntervals.get(propName);
        if (intervalTimer) {
            clearInterval(intervalTimer);
            this.repeatIntervals.delete(propName);
        }
    }
    
    /**
     * 执行按钮对应的游戏动作
     */
    private executeButtonAction(propName: string) {
        if (!this.game || !this.game.playActionBase) return;
        
        switch (propName) {
            case "btnRotate":
                console.log("旋转按钮动作");
                this.game.playActionBase(0, "T"); // T表示旋转
                break;
            case "btnMoveLeft":
                console.log("左移按钮动作");
                this.game.playActionBase(0, "L"); // L表示左移
                break;
            case "btnMoveRight":
                console.log("右移按钮动作");
                this.game.playActionBase(0, "R"); // R表示右移
                break;
            case "btnDrop":
                console.log("下落按钮动作");
                this.game.playActionBase(0, "W"); // W表示直接下落
                break;
            case "btnDown":
                console.log("下移按钮动作");
                this.game.playActionBase(0, "D"); // D表示向下移动一格
                break;
            case "btnHold":
                console.log("Hold按钮动作");
                this.game.playActionBase(0, "S"); // S表示暂存/交换方块
                break;
        }
    }
    
    /**
     * 清理所有定时器
     */
    public clearAllRepeatTimers() {
        // 清除所有初始延迟定时器
        this.repeatTimers.forEach((timer) => {
            clearTimeout(timer);
        });
        this.repeatTimers.clear();
        
        // 清除所有重复间隔定时器
        this.repeatIntervals.forEach((timer) => {
            clearInterval(timer);
        });
        this.repeatIntervals.clear();
    }
    
    /**
     * 组件销毁时清理资源
     */
    onDestroy() {
        // 确保在组件销毁时清除所有定时器
        this.clearAllRepeatTimers();
    }

    /**
     * 显示所有按钮
     */
    public showButtons() {
        if (this.btnRotate) this.btnRotate.active = true;
        if (this.btnMoveLeft) this.btnMoveLeft.active = true;
        if (this.btnMoveRight) this.btnMoveRight.active = true;
        if (this.btnDrop) this.btnDrop.active = true;
        if (this.btnDown) this.btnDown.active = true;
        if (this.btnHold) this.btnHold.active = true;
    }

    /**
     * 隐藏所有按钮
     */
    public hideButtons() {
        if (this.btnRotate) this.btnRotate.active = false;
        if (this.btnMoveLeft) this.btnMoveLeft.active = false;
        if (this.btnMoveRight) this.btnMoveRight.active = false;
        if (this.btnDrop) this.btnDrop.active = false;
        if (this.btnDown) this.btnDown.active = false;
        if (this.btnHold) this.btnHold.active = false;
    }
}
