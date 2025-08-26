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
                g.setBlkColor(blk[els.ZONG - i - 1][j], opt, gv % 100);
            }
        }
        //Render shadow... (新的虚影系统)
        if (this.index == 0) {
            var cb = this.grid.mcore.cur_block;
            var cx = this.grid.mcore.tdx;
            var cy = this.grid.mcore.tdy;
            var cz = this.grid.mcore.cur_z;
            // 虚影系统
            let customShadow = this.gnode.getChildByName("my_shadow");
            if (!customShadow) {
                // 创建虚影节点
                customShadow = new Node("my_shadow");
                const sprite = customShadow.addComponent(Sprite);
                const transform = customShadow.addComponent(UITransform);
                const opacity = customShadow.addComponent(UIOpacity);
                
                // 设置基本属性
                transform.setContentSize(50, 50);
                sprite.spriteFrame = g.blockimgs[0];
                opacity.opacity = 100; // 半透明效果
                
                // 添加到游戏节点
                customShadow.parent = this.gnode;
                customShadow.active = true;
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
            
            // 根据落地位置计算虚影显示位置
            var shadowX = gameAreaBaseX + targetX * bs;
            var shadowY = gameAreaBaseY + (els.ZONG - targetY - 2) * bs; // 向下移动一个单元格
            
            // 应用方块类型和旋转状态的位置微调
            var offset = els.BLK_C_OFFSET[cb][cz];
            shadowX += offset[0] * bs;
            shadowY += offset[1] * bs;
            
            customShadow.setPosition(shadowX, shadowY, 0);
            customShadow.setScale(1, 1, 1);
            customShadow.active = true;
            
            // 设置虚影组件
            const shadowSprite = customShadow.getComponent(Sprite);
            const shadowOpacity = customShadow.getComponent(UIOpacity);
            const shadowTransform = customShadow.getComponent(UITransform);
            
            if (shadowSprite) {
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
        var dis = Math.abs(Vec2.distance(ptfrom, ptto));
        var speed = dis / t;
        var g = this.gnode.getComponent(Main);
        var attAni = g.attani[this.index];

        for (var j = 0; j < 6; j++) {
            let node: Node = attAni[group][j];
            Tween.stopAllByTarget(node);
            node.setPosition(ptfrom);
            node.active = false;
            if (j == 0) {
                // attAni[group][j].runAction(sequence(
                //     delayTime(delay),
                //     show(),
                //     spawn(rotateBy(t, 1800), moveTo(t, ptto)),
                //     callFunc(function hide(){
                //         this.getComponent(Sprite).setVisible(false);
                //     }, attAni[group][j])
                // ));
                tween(node)
                    .target(node)
                    .delay(delay)
                    .show()
                    .parallel(tween(node).by(t, { angle: 1800 }), tween(node).to(t, { position: ptto }))
                    .call(() => {
                        node.getComponent(Sprite).enabled = false;
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
            var g = this.gnode.getComponent(Main);
            var attack_count = this.grid.mtimer.getexdata("attack");

            g.game.model.playMusic(els.ELS_VOICE.ATTACK_MUSIC, false);

            var linecnt = [2, 3, 5];
            var pt1 = this.index == 0 ? new Vec2(470, 630) : new Vec2(100, 880);
            // 播放攻击动画
            for (var i = 0; i < linecnt[attack_count - 1]; i++) {
                var pt2 = this.index == 0 ? new Vec2(100 + i * 20, 900 + i * 30) : new Vec2(470 + i * 20, 700 + i * 60);
                var delay = Math.random() * 0.1;
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
