import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ComboAnimation')
export class ComboAnimation extends Component {
    @property(Node)
    public nodeGood = null;
    @property(Node)
    public nodeCombo = null;
    @property(Node)
    public nodeAwesome = null;
    comboNum: number;
    playAnimationCount: number;
    is_combo: boolean;

    onLoad () {
        this.comboNum = 0;
        this.playAnimationCount = 0; 
        this.is_combo = false; 
        
        console.log('ComboAnimation onLoad - checking nodes:');
        console.log('nodeGood:', !!this.nodeGood, this.nodeGood?.name);
        console.log('nodeCombo:', !!this.nodeCombo, this.nodeCombo?.name);
        console.log('nodeAwesome:', !!this.nodeAwesome, this.nodeAwesome?.name);
        
        if (this.nodeGood) this.nodeGood.active = false; 
        if (this.nodeCombo) this.nodeCombo.active = false; 
        if (this.nodeAwesome) this.nodeAwesome.active = false; 
    }

    start () {
        this.play(); 
    }

    init (is_combo: any, combo: any) {
        console.log('combo animation init',is_combo,combo); 
        this.comboNum = combo; 
        this.is_combo = is_combo; 
        if(is_combo){ 
            let tmp_node = this.nodeCombo.getChildByName('heji'); 
            let combo_label = tmp_node.getChildByName('label').getComponent(Label); 
            if(combo_label){ 
                combo_label.string = combo + ''; 
            } 
        } 
    }

    play () {
        console.log('combo animation play'); 
        this.playAnimationCount = 0; 
        if(this.is_combo){ 
            if(this.comboNum >= 3){ 
                this.showCombo(); 
            } 
        } 
        else{ 
            if(this.comboNum === 3){ 
                this.showGood(); 
            } 
            else if(this.comboNum >= 4){ 
                this.showAwesome(); 
            } 
            else{ 
                this.node.removeFromParent(); 
            } 
        } 
    }

    showGood () {
        console.log('play good'); 
        if (!this.nodeGood) {
            console.error('nodeGood is null');
            this.animationEnd();
            return;
        }
        this.nodeGood.active = true; 
        let ani = this.nodeGood.getComponent(Animation); 
        if (!ani) {
            console.error('Animation component not found on nodeGood');
            this.animationEnd();
            return;
        }
        ani.play(); 
        this.playAnimationCount++; 
        let self = this; 
        ani.on('finished', (num, string)=>{ 
            console.log('good finished',num, string); 
            self.animationEnd(); 
        }, this); 
    }

    showAwesome () {
        console.log('play awesome'); 
        this.nodeAwesome.active = true; 
        let ani = this.nodeAwesome.getComponent(Animation); 
        ani.play(); 
        this.playAnimationCount++; 
        let self = this; 
        ani.on('finished', (num, string)=>{ 
            console.log('awesome finished',num, string); 
            self.animationEnd(); 
        }, this); 
    }

    showCombo () {
        console.log('play combo'); 
        if (!this.nodeCombo) {
            console.error('nodeCombo is null');
            this.animationEnd();
            return;
        }
        this.nodeCombo.active = true; 
        // Animation 组件在根节点上，不是在 combo 子节点上
        let ani = this.node.getComponent(Animation); 
        if (!ani) {
            console.error('Animation component not found on nodeCombo');
            // 如果没有动画组件，就简单显示一段时间后消失
            this.scheduleOnce(() => {
                console.log('No animation, removing after timeout');
                this.node.removeFromParent();
            }, 1.0);
            return;
        }
        ani.play(); 
        this.playAnimationCount++; 
        console.log('Animation started, duration:', ani.defaultClip?.duration || 'unknown');
        
        // 使用 scheduleOnce 作为备用方案
        let animDuration = ani.defaultClip?.duration || 1.0;
        this.scheduleOnce(() => {
            console.log('Scheduled animation end callback triggered');
            this.animationEnd();
        }, animDuration + 0.1);
        
        let self = this; 
        ani.on('finished', (type, state)=>{ 
            console.log('combo animation finished event:', type, state); 
            self.animationEnd(); 
        }, this); 
    }

    animationEnd () {
        if (this.playAnimationCount <= 0) {
            console.log('animationEnd already called, ignoring');
            return;
        }
        
        this.playAnimationCount--; 
        console.log('animationEnd called, playAnimationCount:', this.playAnimationCount);
        if(this.playAnimationCount <= 0){ 
            console.log('Removing combo animation node from parent');
            // 取消所有定时器
            this.unscheduleAllCallbacks();
            this.node.removeFromParent(); 
        } 
    }

}

