import { Node, Sprite, Tween, Vec2, Vec3, tween, UIOpacity, UITransform } from "cc";
import { nge } from "./engine";
import { els } from "./els";
import { Main } from "../main";

export class ElsRender extends nge.Render {
    index: any;
    grid: any;
    gnode: any;
    fullrow: {};
    constructor(idx?, grid?, gnode?) {
        super();
        this.index = idx;
        this.grid = grid;
        this.gnode = gnode;
        this.fullrow = {};
    }
    drawGrid() {
        var mt = this.grid.mtimer;
        if (mt.getFirstRenderFlag("clear-row")) {
            this.fullrow = {};
            var fr = this.grid.mtimer.getexdata("clear-row");
            for (var i = 0; i < fr.length; i++) {
                this.fullrow[fr[i]] = 1;
            }
            mt.resetFirstRenderFlag("clear-row");
        }
        var crs = this.grid.mtimer.getstat("clear-row");
        if (crs == 0) {
            if (this.grid.needdraw) this.grid.needdraw = false;
            else {
                //console.log('skip draw grid.....');
                return;
            }
        }
        //Render grid...
        var g = this.gnode.getComponent(Main);
        var dat = this.grid.mcore.grid;
        var blk = g.blocks[this.index];
        
        // 检查方块数组是否有效
        if (!blk) {
            g.init(); // 重新初始化
            blk = g.blocks[this.index];
        }
        

        
        for (var i = 0; i < els.ZONG; i++) {
            for (var j = 0; j < els.HENG; j++) {
                var gv = dat[i * els.GRIDW + j + 2];
                var opt = 0;
                if (crs != 0 && this.fullrow[i]) {
                    //满行消除前闪烁
                    opt = gv == 0 ? 0 : (crs / 2) % 2 == 0 ? 0 : 250;
                } else {
                    opt = gv == 0 ? 0 : 180;
                }
                
                // 检查单个方块节点是否有效
                var blockNode = blk[els.ZONG - i - 1][j];
                if (blockNode && blockNode.isValid && g.setBlkColor) {
                    g.setBlkColor(blockNode, opt, gv % 100);
                }
            }
        }

        //Render shadow... (新的虚影系统)
        if (this.index == 0) {
            var customShadow = null;
            try {
                var cb = this.grid.mcore.cur_block;
                var cx = this.grid.mcore.tdx;
                var cy = this.grid.mcore.tdy;
                var cz = this.grid.mcore.cur_z;
                
                // 安全检查游戏节点
                if (!this.gnode || !this.gnode.isValid) {
                    return;
                }
                
                // 虚影系统
                customShadow = this.gnode.getChildByName("my_shadow");
                if (!customShadow || !customShadow.isValid) {
                    // 清理可能存在的无效节点
                    let oldShadow = this.gnode.getChildByName("my_shadow");
                    if (oldShadow && !oldShadow.isValid) {
                        try {
                            oldShadow.removeFromParent();
                        } catch (e) {
                            console.warn("Failed to remove old shadow:", e);
                        }
                    }
                    
                    // 创建虚影节点
                    try {
                        customShadow = new Node("my_shadow");
                        const sprite = customShadow.addComponent(Sprite);
                        const transform = customShadow.addComponent(UITransform);
                        const opacity = customShadow.addComponent(UIOpacity);
                        
                        // 设置基本属性
                        if (transform) {
                            transform.setContentSize(50, 50);
                        }
                        if (sprite && g.blockimgs && g.blockimgs[0]) {
                            sprite.spriteFrame = g.blockimgs[0];
                        }
                        if (opacity) {
                            opacity.opacity = 100; // 半透明效果
                        }
                        
                        // 添加到游戏节点
                        customShadow.parent = this.gnode;
                        customShadow.active = true;
                    } catch (e) {
                        console.warn("Failed to create shadow node:", e);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Error in shadow system initialization:", e);
                return;
            }
            
            // 计算游戏区域内的正确位置
            var bs = (72 * 6.6) / els.HENG + 2;
            var gameAreaBaseX = 216; // 游戏区域起始X
            var gameAreaBaseY = 213; // 游戏区域起始Y
            
            // 使用已经计算好的正确落地位置
            // 确保testDDown已经被调用来计算tdx和tdy
            this.grid.testDDown();
            
            // 使用正确的落地位置
            var targetX = this.grid.mcore.tdx;
            var targetY = this.grid.mcore.tdy;
            
            try {
                // 确保虚影节点仍然有效
                if (customShadow && customShadow.isValid) {
                    // 根据落地位置计算虚影显示位置
                    var shadowX = gameAreaBaseX + targetX * bs;
                    var shadowY = gameAreaBaseY + (els.ZONG - targetY - 2) * bs; // 向下移动一个单元格
                    
                    // 应用方块类型和旋转状态的位置微调
                    if (els.BLK_C_OFFSET && els.BLK_C_OFFSET[cb] && els.BLK_C_OFFSET[cb][cz]) {
                        var offset = els.BLK_C_OFFSET[cb][cz];
                        shadowX += offset[0] * bs;
                        shadowY += offset[1] * bs;
                    }
                    
                    try {
                        customShadow.setPosition(shadowX, shadowY, 0);
                        customShadow.setScale(1, 1, 1);
                        customShadow.active = true;
                        
                        // 设置虚影组件
                        const shadowSprite = customShadow.getComponent(Sprite);
                        const shadowOpacity = customShadow.getComponent(UIOpacity);
                        const shadowTransform = customShadow.getComponent(UITransform);
                        
                        if (shadowSprite && g.blockimgs && g.blockimgs[cb + 11]) {
                            shadowSprite.spriteFrame = g.blockimgs[cb + 11];
                            shadowSprite.enabled = true;
                        }
                        
                        if (shadowOpacity) {
                            shadowOpacity.opacity = 80; // 更透明的虚影效果
                        }
                        
                        if (shadowTransform) {
                            shadowTransform.setAnchorPoint(0.5, 0.5);
                        }
                        
                        // 设置旋转（与当前方块同步）
                        customShadow.eulerAngles = new Vec3(0, 0, -90 * cz);
                    } catch (e) {
                        console.warn("Error updating shadow node:", e);
                    }
                }
            } catch (e) {
                console.warn("Error in shadow system update:", e);
            }
        }
    }
    drawHoldNext() {
        //Render hold next...
        if (this.index != 0) return;
        var g = this.gnode.getComponent(Main);
        var gr = this.grid;
        var blk = g.holdnext;
        var h = gr.mcore.save_block;
        var n1 = gr.mQueue[(gr.mcore.block_index + 1) % els.MAXBLKQUEUE];
        var n2 = gr.mQueue[(gr.mcore.block_index + 2) % els.MAXBLKQUEUE];
        var hnv = [h, n1, n2];
        for (var n = 0; n < 3; n++) {
            if (hnv[n] >= 0) {
                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        var gv = els.BLKDAT_C[hnv[n]][0][i * 4 + j];
                        g.setBlkColor(blk[n][i][j], gv == 0 ? 50 : 200, gv % 100);
                    }
                }
            } else {
                for (var i = 0; i < 4; i++) {
                    for (var j = 0; j < 4; j++) {
                        g.setBlkColor(blk[n][i][j], 50, 0);
                    }
                }
            }
        }
    }
    drawAttackLine(group, ptfrom, ptto, delay, t) {
        console.log("🚀🚀🚀 NEW CODE VERSION - drawAttackLine called! 🚀🚀🚀");
        var dis = Math.abs(Vec2.distance(ptfrom, ptto));
        var speed = dis / t;
        var g = this.gnode.getComponent(Main);
        var attAni = g.attani[this.index];
        console.log(`drawAttackLine: group=${group}, index=${this.index}, attAni:`, attAni);

        console.log("Starting for loop, j from 0 to 5");
        for (var j = 0; j < 6; j++) {
            console.log(`Loop iteration j=${j}`);
            let node: Node = attAni[group][j];
            console.log(`Attack node ${j}:`, node, "active:", node?.active, "parent:", node?.parent);
            
            if (!node) {
                console.error(`Node is null for j=${j}, group=${group}, index=${this.index}`);
                continue;
            }
            
            Tween.stopAllByTarget(node);
            node.setPosition(ptfrom);
            node.active = true; // 保持节点active，但sprite disabled
            console.log(`Checking j == 0: j=${j}, condition=${j == 0}`);
            if (j == 0) {
                console.log(`Entering j==0 branch for node ${j}`);
                // attAni[group][j].runAction(sequence(
                //     delayTime(delay),
                //     show(),
                //     spawn(rotateBy(t, 1800), moveTo(t, ptto)),
                //     callFunc(function hide(){
                //         this.getComponent(Sprite).setVisible(false);
                //     }, attAni[group][j])
                // ));
                console.log(`Starting tween for node ${j}, delay: ${delay}, target position:`, ptto);
                tween(node)
                    .target(node)
                    .delay(delay)
                    .call(() => {
                        console.log(`Tween started for node ${j}, showing node`);
                        node.active = true;
                        const sprite = node.getComponent(Sprite);
                        if (sprite) {
                            sprite.enabled = true;
                            console.log(`Sprite enabled for node ${j}`);
                        }
                    })
                    .parallel(
                        tween(node).by(t, { angle: 1800 }), 
                        tween(node).to(t, { position: ptto })
                    )
                    .call(() => {
                        console.log(`Tween finished for node ${j}, hiding sprite`);
                        const sprite = node.getComponent(Sprite);
                        if (sprite) {
                            sprite.enabled = false;
                        }
                    })
                    .start();
            } else {
                var dd = 20.0 / speed;
                tween(node)
                    .target(node)
                    .delay(delay + dd * j)
                    .show()
                    .to(t, { position: ptto })
                    .call(() => {
                        node.getComponent(Sprite).enabled = false;
                    })
                    .start();
                // node.runAction(sequence(
                //     delayTime(delay + dd * j), show(), moveTo(t, ptto),
                //     callFunc(function hide() {
                //         this.getComponent(Sprite).setVisible(false);
                //     }, node)
                // ));
            }
        }
    }
    drawAttack() {
        if (this.grid.mtimer.getFirstRenderFlag("attack")) {
            console.log("drawAttack called! grid index:", this.index);
            var g = this.gnode.getComponent(Main);
            var attack_count = this.grid.mtimer.getexdata("attack");
            console.log("attack_count:", attack_count, "grid index:", this.index);

            g.game.model.playMusic(els.ELS_VOICE.ATTACK_MUSIC, false);

            var linecnt = [2, 3, 5];
            var pt1 = this.index == 0 ? new Vec2(470, 630) : new Vec2(100, 880);
            // 播放攻击动画
            console.log("Starting attack animation, linecnt:", linecnt[attack_count - 1]);
            for (var i = 0; i < linecnt[attack_count - 1]; i++) {
                var pt2 = this.index == 0 ? new Vec2(100 + i * 20, 900 + i * 30) : new Vec2(470 + i * 20, 700 + i * 60);
                var delay = Math.random() * 0.1;
                console.log(`Drawing attack line ${i}: from (${pt1.x}, ${pt1.y}) to (${pt2.x}, ${pt2.y})`);
                this.drawAttackLine(i, pt1, pt2, delay, 0.3);
            }

            //TODO: 这里直接将第二个grid判断为AI,以后可能需要修改，虽然在game中AI也是这样判断的
            //! 攻击两个意味着消除了3行
            if (this.grid.index !== 1 && attack_count >= 2) {
                g.showClearAnimation(attack_count + 1);
            }

            this.grid.mtimer.resetFirstRenderFlag("attack");
        }
    }
    drawCombo() {
        if (this.grid.mtimer.getFirstRenderFlag("combo")) {
            var g = this.gnode.getComponent(Main);
            var c = this.grid.mtimer.getexdata("combo");
            var pt1 = this.index === 0 ? new Vec2(450, 830) : new Vec2(80, 980);

            if (c >= 3) {
                var mi = c;
                if (c > 14) mi = 14;
                g.game.model.playMusic(els.ELS_VOICE.COMBO_MUSIC[mi - 3], false);
            }
            if (this.grid.index !== 1) {
                console.log("show combo");
                g.showCombo(c);
            }
            this.grid.mtimer.resetFirstRenderFlag("combo");
        }
    }
    draw() {
        this.drawGrid();
        this.drawHoldNext();
        this.drawAttack();
        this.drawCombo();
    }
}
