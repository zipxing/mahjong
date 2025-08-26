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
        this.nodeGood.active = false; 
        this.nodeCombo.active = false; 
        this.nodeAwesome.active = false; 
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
        this.nodeGood.active = true; 
        let ani = this.nodeGood.getComponent(Animation); 
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
        this.nodeCombo.active = true; 
        let ani = this.nodeCombo.getComponent(Animation); 
        ani.play(); 
        this.playAnimationCount++; 
        let self = this; 
        ani.on('finished', (num, string)=>{ 
            console.log('combo finished',num, string); 
            self.animationEnd(); 
        }, this); 
    }

    animationEnd () {
        this.playAnimationCount--; 
        if(this.playAnimationCount <= 0){ 
            this.node.removeFromParent(); 
        } 
    }

}

