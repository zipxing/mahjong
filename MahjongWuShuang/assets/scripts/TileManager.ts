/**
 * 麻将管理器
 * 
 * 职责：
 * - 麻将节点的创建和渲染
 * - 麻将高亮效果管理
 * - 麻将动画效果（消除、移动失败、回退等）
 * - Sprite和Label两种渲染模式支持
 */

import { _decorator, Node, Vec3, Color, Label, UITransform, tween, UIOpacity, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
const { ccclass } = _decorator;

// 麻将数据接口（从GameManager复制）
interface TileData {
    type: number;
    symbol: string;
}

@ccclass('TileManager')
export class TileManager {
    
    // ==================== 配置常量 ====================
    private tileSize: number = 80;  // 麻将大小：80x80像素
    private tileTypes: string[] = [
        '🀄', '🀅', '🀆', '🀇',  // 中、发、白、一万
        '🀈', '🀉', '🀊', '🀋'   // 二万、三万、四万、五万
    ];
    
    // ==================== 高亮效果常量 ====================
    private readonly SELECTED_COLOR = new Color(100, 150, 255, 255);  // 蓝色：选中状态
    private readonly ELIMINABLE_COLOR = new Color(255, 255, 100, 255); // 黄色：可消除状态
    private readonly NORMAL_COLOR = new Color(255, 255, 255, 255);     // 白色：正常状态
    
    // ==================== 组件引用 ====================
    private mahjongAtlas: SpriteAtlas = null!;  // 麻将图集（用于DrawCall合批）
    
    // ==================== 高亮显示 ====================
    private highlightedTiles: Node[] = [];  // 当前高亮的麻将节点列表
    
    /**
     * 初始化麻将管理器
     */
    init(mahjongAtlas: SpriteAtlas) {
        this.mahjongAtlas = mahjongAtlas;
    }
    
    /**
     * 创建麻将节点
     * （从GameManager.createTileNode()直接复制）
     * 
     * 支持两种渲染模式：
     * 1. Sprite模式：使用SpriteAtlas进行DrawCall合批优化
     * 2. Label模式：兼容模式，当SpriteAtlas不可用时使用
     * 
     * @param tileData 麻将数据
     * @param parent 父节点
     * @returns 创建的麻将节点
     */
    createTileNode(tileData: TileData, parent: Node): Node {
        const tileNode = new Node(`Tile_${tileData.type}_${tileData.symbol}`);
        tileNode.setParent(parent);
        
        // 设置节点大小
        const transform = tileNode.addComponent(UITransform);
        transform.setContentSize(this.tileSize, this.tileSize);
        
        // 尝试使用Sprite模式（DrawCall优化）
        if (this.mahjongAtlas) {
            try {
                this.createSpriteBasedTile(tileNode, tileData);
                console.log(`✅ 使用Sprite模式创建麻将: ${tileData.symbol}`);
                return tileNode;
            } catch (error) {
                console.warn(`Sprite模式创建失败，回退到Label模式: ${error}`);
            }
        }
        
        // 回退到Label模式
        this.createLabelBasedTile(tileNode, tileData);
        console.log(`📝 使用Label模式创建麻将: ${tileData.symbol}`);
        
        return tileNode;
    }
    
    /**
     * 创建基于Sprite的麻将（DrawCall优化）
     * （从GameManager.createSpriteBasedTile()直接复制）
     */
    private createSpriteBasedTile(tileNode: Node, tileData: TileData) {
        const sprite = tileNode.addComponent(Sprite);
        const spriteFrameName = this.getSpriteFrameName(tileData.type);
        const spriteFrame = this.mahjongAtlas.getSpriteFrame(spriteFrameName);
        
        if (!spriteFrame) {
            throw new Error(`找不到SpriteFrame: ${spriteFrameName}`);
        }
        
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        
        // 存储麻将数据到节点
        (tileNode as any).tileData = tileData;
    }
    
    /**
     * 创建基于Label的麻将（兼容方式）
     * （从GameManager.createLabelBasedTile()直接复制）
     */
    private createLabelBasedTile(tileNode: Node, tileData: TileData) {
        // 创建文字标签
        const labelNode = new Node('Label');
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(this.tileSize, this.tileSize);
        
        const label = labelNode.addComponent(Label);
        label.string = tileData.symbol;
        label.fontSize = 36;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 设置颜色 - 8种麻将对应8种颜色（与原版完全一致）
        const colors = [
            new Color(229, 62, 62),   // 🀄 中 - 红色
            new Color(56, 161, 105),  // 🀅 发 - 绿色  
            new Color(49, 130, 206),  // 🀆 白 - 蓝色
            new Color(214, 158, 46),  // 🀇 一万 - 黄色
            new Color(128, 90, 213),  // 🀈 二万 - 紫色
            new Color(221, 107, 32),  // 🀉 三万 - 橙色
            new Color(49, 151, 149),  // 🀊 四万 - 青色
            new Color(236, 72, 153),  // 🀋 五万 - 粉色
        ];
        
        if (tileData.type < colors.length) {
            label.color = colors[tileData.type];
        }
        
        tileNode.addChild(labelNode);
        
        // 存储麻将数据到节点
        (tileNode as any).tileData = tileData;
    }
    
    /**
     * 获取Sprite图片名称
     * （从GameManager.getSpriteFrameName()直接复制）
     */
    private getSpriteFrameName(tileType: number): string {
        // 根据麻将类型返回对应的图片名称
        // 这里需要根据实际的SpriteAtlas中的图片名称来调整
        const typeNames = [
            'zhong',    // 🀄 中
            'fa',       // 🀅 发  
            'bai',      // 🀆 白
            'yi_wan',   // 🀇 一万
            'er_wan',   // 🀈 二万
            'san_wan',  // 🀉 三万
            'si_wan',   // 🀊 四万
            'wu_wan'    // 🀋 五万
        ];
        
        return typeNames[tileType] || 'zhong';
    }
    
    /**
     * 设置麻将高亮效果（简洁版）
     * （从GameManager.setTileHighlight()直接复制）
     * 
     * 支持两种高亮类型：
     * - 'selected': 蓝色高亮，表示当前选中的麻将
     * - 'eliminable': 黄色高亮，表示可以消除的麻将
     * 
     * @param tileNode 要高亮的麻将节点
     * @param type 高亮类型
     */
    setTileHighlight(tileNode: Node, type: 'selected' | 'eliminable') {
        if (!tileNode || !tileNode.isValid) return;
        
        // 检查是否已经在高亮列表中
        let isAlreadyHighlighted = false;
        for (let i = 0; i < this.highlightedTiles.length; i++) {
            if (this.highlightedTiles[i] === tileNode) {
                isAlreadyHighlighted = true;
                break;
            }
        }
        
        if (!isAlreadyHighlighted) {
            this.highlightedTiles.push(tileNode);
        }
        
        // 设置高亮颜色和缩放效果
        const targetColor = type === 'selected' ? this.SELECTED_COLOR : this.ELIMINABLE_COLOR;
        const targetScale = 1.1;
        
        // 应用颜色（根据渲染模式）
        const sprite = tileNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = targetColor;
        } else {
            // Label模式：查找子节点中的Label组件
            const labelNode = tileNode.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(Label);
                if (label) {
                    label.color = targetColor;
                }
            }
        }
        
        // 应用缩放动画
        tween(tileNode)
            .to(0.1, { scale: new Vec3(targetScale, targetScale, 1) })
            .start();
    }
    
    /**
     * 清除麻将高亮效果
     * （从GameManager.clearTileHighlight()直接复制）
     * 
     * @param tileNode 要清除高亮的麻将节点
     */
    clearTileHighlight(tileNode: Node) {
        if (!tileNode || !tileNode.isValid) return;
        
        // 从高亮列表中移除
        for (let i = 0; i < this.highlightedTiles.length; i++) {
            if (this.highlightedTiles[i] === tileNode) {
                this.highlightedTiles.splice(i, 1);
                break;
            }
        }
        
        // 恢复正常颜色和缩放
        const sprite = tileNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = this.NORMAL_COLOR;
        } else {
            // Label模式：恢复原来的颜色
            const labelNode = tileNode.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(Label);
                const tileData = (tileNode as any).tileData;
                if (label && tileData) {
                    // 恢复原来的颜色
                    const colors = [
                        new Color(229, 62, 62),   // 🀄 中 - 红色
                        new Color(56, 161, 105),  // 🀅 发 - 绿色  
                        new Color(49, 130, 206),  // 🀆 白 - 蓝色
                        new Color(214, 158, 46),  // 🀇 一万 - 黄色
                        new Color(128, 90, 213),  // 🀈 二万 - 紫色
                        new Color(221, 107, 32),  // 🀉 三万 - 橙色
                        new Color(49, 151, 149),  // 🀊 四万 - 青色
                        new Color(236, 72, 153),  // 🀋 五万 - 粉色
                    ];
                    
                    if (tileData.type < colors.length) {
                        label.color = colors[tileData.type];
                    }
                }
            }
        }
        
        // 恢复正常缩放
        tween(tileNode)
            .to(0.1, { scale: Vec3.ONE })
            .start();
    }
    
    /**
     * 清除所有高亮
     * （从GameManager.clearAllHighlights()直接复制）
     * 
     * 遍历所有高亮的麻将节点，清除它们的高亮效果
     * 这个方法通常在选择状态改变时调用
     */
    clearAllHighlights() {
        // 创建副本以避免在遍历过程中修改数组
        const tilesToClear = [...this.highlightedTiles];
        
        for (const tileNode of tilesToClear) {
            if (tileNode && tileNode.isValid) {
                this.clearTileHighlight(tileNode);
            }
        }
        
        // 确保列表被清空
        this.highlightedTiles.length = 0;
    }
    
    /**
     * 获取当前高亮的麻将节点列表
     */
    getHighlightedTiles(): Node[] {
        return [...this.highlightedTiles];
    }

    // ==================== 高亮效果常量 ====================
    private readonly HIGHLIGHT_SCALE = 1.3;           // 高亮时的缩放比例
    private readonly ANIMATION_SCALE = 1.5;            // 动画时的最大缩放比例

    /**
     * 高亮选中的麻将（带动画效果）
     * （从GameManager.highlightSelectedTile()完全复制）
     * 
     * @param tileNode 选中的麻将节点
     */
    highlightSelectedTile(tileNode: Node) {
        console.log('高亮选中麻将:', tileNode.name);
        
        this.setTileHighlight(tileNode, 'selected');
        
        // 添加选中动画（轻微的弹跳效果）
        console.log('添加选中动画');
        tween(tileNode)
            .to(0.1, { scale: new Vec3(this.ANIMATION_SCALE, this.ANIMATION_SCALE, 1) })
            .to(0.1, { scale: new Vec3(this.HIGHLIGHT_SCALE, this.HIGHLIGHT_SCALE, 1) })
            .start();
            
        // 注意：不需要再次添加到highlightedTiles，因为setTileHighlight已经处理了
    }

    /**
     * 高亮可消除的麻将
     * （从GameManager.highlightEliminable()完全复制）
     * 
     * @param row 指定麻将的行
     * @param col 指定麻将的列
     * @param boardManager 棋盘管理器
     * @param boardSize 棋盘大小
     * @param canEliminateCallback 消除判断回调函数
     */
    highlightEliminable(
        row: number, 
        col: number, 
        boardManager: any, 
        boardSize: number, 
        canEliminateCallback: (r1: number, c1: number, r2: number, c2: number) => boolean
    ) {
        this.clearAllHighlights();
        
        const currentTile = boardManager.getTileData(row, col);
        if (!currentTile) return;
        
        // 遍历所有麻将，找出可消除的
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (r === row && c === col) continue;
                
                if (canEliminateCallback(row, col, r, c)) {
                    const tileNode = boardManager.getTileNode(r, c);
                    if (tileNode && tileNode.isValid) {
                        console.log(`高亮麻将: (${r}, ${c})`);
                        this.setTileHighlight(tileNode, 'eliminable');
                        
                        // 注意：不需要再次添加到highlightedTiles，因为setTileHighlight已经处理了
                    }
                }
            }
        }
        
        console.log(`高亮了 ${this.highlightedTiles.length} 个可消除的麻将`);
    }
    
    /**
     * 消除一对麻将
     * （从GameManager.eliminatePair()直接复制动画部分）
     * 
     * @param node1 第一个麻将节点
     * @param node2 第二个麻将节点
     * @param callback 动画完成后的回调函数
     */
    eliminatePair(node1: Node, node2: Node, callback?: () => void) {
        if (!node1 || !node1.isValid || !node2 || !node2.isValid) {
            console.error('无效的麻将节点');
            if (callback) callback();
            return;
        }
        
        console.log('🎯 开始消除动画');
        
        // 清除高亮效果
        this.clearTileHighlight(node1);
        this.clearTileHighlight(node2);
        
        // 创建消除动画：旋转 + 缩放 + 淡出
        const animationDuration = 0.5;
        
        // 第一个麻将的动画
        const anim1 = tween(node1)
            .parallel(
                tween().to(animationDuration, { 
                    scale: new Vec3(0.1, 0.1, 1),
                    angle: 360 
                }),
                tween().to(animationDuration, {}, {
                    onUpdate: (target: Node, ratio: number) => {
                        const opacity = node1.getComponent(UIOpacity);
                        if (!opacity) {
                            const newOpacity = node1.addComponent(UIOpacity);
                            newOpacity.opacity = Math.floor(255 * (1 - ratio));
                        } else {
                            opacity.opacity = Math.floor(255 * (1 - ratio));
                        }
                    }
                })
            );
        
        // 第二个麻将的动画
        const anim2 = tween(node2)
            .parallel(
                tween().to(animationDuration, { 
                    scale: new Vec3(0.1, 0.1, 1),
                    angle: 360 
                }),
                tween().to(animationDuration, {}, {
                    onUpdate: (target: Node, ratio: number) => {
                        const opacity = node2.getComponent(UIOpacity);
                        if (!opacity) {
                            const newOpacity = node2.addComponent(UIOpacity);
                            newOpacity.opacity = Math.floor(255 * (1 - ratio));
                        } else {
                            opacity.opacity = Math.floor(255 * (1 - ratio));
                        }
                    }
                })
            );
        
        // 启动动画
        anim1.start();
        anim2.call(() => {
            console.log('✅ 消除动画完成');
            
            // 销毁节点
            if (node1.isValid) node1.destroy();
            if (node2.isValid) node2.destroy();
            
            // 执行回调
            if (callback) callback();
        }).start();
    }
    
    /**
     * 播放移动失败动画
     * （从GameManager中提取相关逻辑）
     */
    playMoveFailedAnimation(tileNode: Node) {
        if (!tileNode || !tileNode.isValid) return;
        
        console.log('❌ 播放移动失败动画');
        
        // 红色闪烁效果
        const failedColor = new Color(255, 100, 100, 255);  // 红色
        
        const sprite = tileNode.getComponent(Sprite);
        
        tween(tileNode)
            .call(() => {
                if (sprite) {
                    sprite.color = failedColor;
                } else {
                    // Label模式：设置子节点Label的颜色
                    const labelNode = tileNode.getChildByName('Label');
                    if (labelNode) {
                        const label = labelNode.getComponent(Label);
                        if (label) {
                            label.color = failedColor;
                        }
                    }
                }
            })
            .delay(0.2)
            .call(() => {
                // 恢复原来的颜色
                this.clearTileHighlight(tileNode);
            })
            .start();
    }
    
    /**
     * 播放回退动画
     * （从GameManager中提取相关逻辑）
     */
    playRollbackAnimation(tileNodes: Node[]) {
        console.log('🔄 播放回退动画');
        
        tileNodes.forEach(tileNode => {
            if (!tileNode || !tileNode.isValid) return;
            
            // 闪烁效果
            const sprite = tileNode.getComponent(Sprite);
            const yellowColor = new Color(255, 255, 0, 255);  // 黄色
            
            tween(tileNode)
                .call(() => {
                    if (sprite) {
                        sprite.color = yellowColor;
                    } else {
                        // Label模式：设置子节点Label的颜色
                        const labelNode = tileNode.getChildByName('Label');
                        if (labelNode) {
                            const label = labelNode.getComponent(Label);
                            if (label) {
                                label.color = yellowColor;
                            }
                        }
                    }
                })
                .delay(0.1)
                .call(() => {
                    // 恢复原来的颜色
                    this.clearTileHighlight(tileNode);
                })
                .delay(0.1)
                .call(() => {
                    if (sprite) {
                        sprite.color = yellowColor;
                    } else {
                        // Label模式：设置子节点Label的颜色
                        const labelNode = tileNode.getChildByName('Label');
                        if (labelNode) {
                            const label = labelNode.getComponent(Label);
                            if (label) {
                                label.color = yellowColor;
                            }
                        }
                    }
                })
                .delay(0.1)
                .call(() => {
                    // 恢复原来的颜色
                    this.clearTileHighlight(tileNode);
                })
                .start();
        });
    }
    
    // ==================== Getter方法 ====================
    
    getTileTypes(): string[] {
        return [...this.tileTypes];
    }
    
    getTileSize(): number {
        return this.tileSize;
    }
}
