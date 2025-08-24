/**
 * 麻将无双游戏 - Cocos Creator版本
 * 
 * 主要特性：
 * - 8x8棋盘，8种不同的麻将类型
 * - 点击选择与智能消除系统
 * - 拖拽移动与推动效果
 * - 移动失败自动回退
 * - 完整的触摸事件处理
 * - 坐标系统转换（屏幕坐标 ↔ 网格坐标）
 * 
 * 技术要点：
 * - 使用Tween系统实现各种动画效果
 * - 完善的错误处理和安全检查
 * - 智能的拖拽组选择算法（推动逻辑）
 * - 基于移动历史的回退系统
 * 
 * @author Zipxing & Cursor
 * @version 1.0
 * @date 2025-08-24
 */

import { _decorator, Component, Node, Vec3, Color, Label, UITransform, input, Input, EventTouch, Vec2, tween, UIOpacity, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
import { BoardManager } from './BoardManager';
import { TileManager } from './TileManager';
import { ShadowPool } from './ShadowPool';
import { LogicManager } from './LogicManager';
const { ccclass, property } = _decorator;

/**
 * 麻将无双游戏管理器
 * 
 * 核心功能：
 * - 8x8棋盘生成与渲染
 * - 点击选择与智能消除
 * - 拖拽移动与组合推动
 * - 移动回退与状态管理
 * - 高亮显示与视觉反馈
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    // ==================== 组件引用 ====================
    @property(Node)
    gameBoard: Node = null!;  // 游戏棋盘根节点
    
    @property(SpriteAtlas)
    mahjongAtlas: SpriteAtlas = null!;  // 麻将图集（用于DrawCall合批）
    
    // ==================== 游戏状态 ====================
    private selectedTile: {row: number, col: number, node: Node} | null = null;  // 当前选中的麻将
    private score: number = 0;                                           // 当前游戏得分
    
    // ==================== 拖拽系统 ====================
    private isDragging: boolean = false;                                // 是否正在进行拖拽操作
    private dragStartPos: {row: number, col: number, worldPos: Vec3} | null = null;  // 拖拽起始位置信息
    private dragEndPos: {x: number, y: number} | null = null;          // 拖拽结束的屏幕坐标
    private dragGroup: {row: number, col: number}[] = [];              // 参与拖拽的麻将组（推动效果）
    private dragShadows: Node[] = [];                                   // 拖拽时显示的半透明虚影节点
    private dragDirection: 'horizontal' | 'vertical' | null = null;    // 拖拽的主要方向
    
    // ==================== 模块管理器 ====================
    private boardManager: BoardManager = new BoardManager();
    private tileManager: TileManager = new TileManager();
    private shadowPool: ShadowPool = new ShadowPool();
    private logicManager: LogicManager = new LogicManager();
    
    // ==================== 移动历史与智能回退 ====================
    // 移动历史现在完全由LogicManager管理
    
    onLoad() {
        console.log('GameManager onLoad');
        this.init();
    }
    
    start() {
        console.log('GameManager start');
        // 注册触摸事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    
    onDestroy() {
        // 移除触摸事件
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    
    /**
     * 初始化游戏
     * 
     * 功能：
     * - 初始化各个模块管理器
     * - 生成8x8游戏棋盘数据
     * - 创建麻将显示节点并渲染到界面
     * - 重置所有游戏状态
     * - 注册触摸事件监听器
     */
    private init() {
        console.log('开始初始化游戏...');
        
        if (!this.gameBoard) {
            console.error('GameBoard节点未设置！');
            return;
        }
        
        // 初始化模块管理器
        this.initManagers();
        
        // 重置游戏状态
        this.selectedTile = null;
        this.score = 0;
        // highlightedTiles 已迁移到 TileManager
        this.logicManager.clearLastMoveRecord();
        console.log('游戏状态已重置');
        
        this.boardManager.generateSimplePairs(this.tileManager);
        this.boardManager.renderBoard(this.tileManager);
        
        console.log('游戏初始化完成！');
    }
    
    /**
     * 初始化模块管理器
     */
    private initManagers() {
        console.log('初始化模块管理器...');
        
        // 初始化棋盘管理器
        this.boardManager.init(this.gameBoard);
        
        // 初始化麻将管理器
        this.tileManager.init(this.mahjongAtlas);
        
        // 初始化虚影对象池
        this.shadowPool.init(this.mahjongAtlas, this.node.parent || this.node);
        
        // 初始化逻辑管理器
        this.logicManager.init({
            boardManager: this.boardManager,
            tileManager: this.tileManager
        });
        
        console.log('✅ 模块管理器初始化完成');
    }
    
    /**
     * 从对象池获取指定类型的虚影节点
     * 
     * @param tileType 麻将类型索引
     */
    private getShadowFromPool(tileType: number): Node | null {
        return this.shadowPool.getShadowFromPool(tileType);
    }
    
    /**
     * 归还虚影节点到对应类型的对象池
     */
    private returnShadowToPool(shadowNode: Node) {
        this.shadowPool.returnShadowToPool(shadowNode);
    }
    
    /**
     * 触摸开始事件处理
     * 
     * 功能：
     * - 将屏幕坐标转换为棋盘网格坐标
     * - 检查触摸位置是否有有效麻将
     * - 初始化拖拽状态和拖拽组
     * - 为后续的拖拽或点击操作做准备
     */
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        console.log('=== 触摸开始 ===');
        console.log('触摸坐标:', touchPos);
        
        // 获取点击的麻将位置
        const gridPos = this.boardManager.screenToGrid(touchPos);
        console.log('网格位置:', gridPos);
        
        if (gridPos && this.boardManager.getTileData(gridPos.row, gridPos.col)) {
            console.log('开始拖拽准备');
            // 记录拖拽开始位置，但不立即设置isDragging（需要移动一定距离才算拖拽）
            this.dragStartPos = {
                row: gridPos.row,
                col: gridPos.col,
                worldPos: new Vec3(touchPos.x, touchPos.y, 0)
            };
            
            // 初始化拖动组
            this.dragGroup = [{ row: gridPos.row, col: gridPos.col }];
            console.log('初始拖动组:', this.dragGroup);
        }
    }
    
    /**
     * 触摸移动事件处理
     * 
     * 功能：
     * - 计算拖拽距离和方向（水平/垂直）
     * - 根据拖拽方向确定拖拽组（推动效果）
     * - 创建和更新拖拽虚影的位置
     * - 实现轴向约束（水平拖拽时固定Y轴，垂直拖拽时固定X轴）
     */
    private onTouchMove(event: EventTouch) {
        if (!this.dragStartPos) return;
        
        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        
        // 计算移动距离
        const deltaX = worldPos.x - this.dragStartPos.worldPos.x;
        const deltaY = worldPos.y - this.dragStartPos.worldPos.y;
        const threshold = 30; // 拖拽阈值：超过30像素才认为是拖拽
        
        // 只有当移动距离超过阈值时，才认为是真正的拖拽操作
        if (!this.isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
            console.log('=== 开始拖拽 ===');
            console.log('移动距离:', { deltaX, deltaY });
            this.isDragging = true;
            
            // 根据移动方向确定拖拽方向
            this.dragDirection = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
            
            // 确定具体的拖拽方向（左、右、上、下）
            // 注意：在Cocos Creator中，Y轴向上为正，但触摸坐标Y向下为正
            // 所以deltaY > 0 表示向下拖拽，deltaY < 0 表示向上拖拽
            let specificDirection: 'left' | 'right' | 'up' | 'down';
            if (this.dragDirection === 'horizontal') {
                specificDirection = deltaX > 0 ? 'right' : 'left';
                console.log(`水平拖拽判断: deltaX=${deltaX}, ${deltaX > 0 ? 'deltaX > 0 = right' : 'deltaX < 0 = left'}`);
            } else {
                specificDirection = deltaY > 0 ? 'down' : 'up';
                console.log(`垂直拖拽判断: deltaY=${deltaY}, ${deltaY > 0 ? 'deltaY > 0 = down' : 'deltaY < 0 = up'}`);
            }
            
            console.log('方向判断详情:', {
                dragDirection: this.dragDirection,
                deltaX,
                deltaY,
                '水平判断': deltaX > 0 ? 'deltaX > 0 = right' : 'deltaX < 0 = left',
                '垂直判断': deltaY > 0 ? 'deltaY > 0 = down' : 'deltaY < 0 = up',
                specificDirection
            });
            
            console.log('拖拽方向:', this.dragDirection, '具体方向:', specificDirection);
            
            // 根据具体拖拽方向更新拖动组
            this.dragGroup = this.logicManager.findDragGroupForSpecificDirection(this.dragStartPos.row, this.dragStartPos.col, specificDirection);
            console.log('更新后的拖动组:', this.dragGroup);
            
            // 创建拖动组的虚影
            this.createDragGroupShadows(worldPos);
        }
        
        // 如果正在拖拽，更新虚影位置
        if (this.isDragging) {
            this.updateDragGroupShadowsPosition(worldPos);
        }
        
        // 更新拖拽结束位置
        this.dragEndPos = { x: touchPos.x, y: touchPos.y };
    }
    
    /**
     * 触摸结束事件处理
     * 
     * 功能：
     * - 判断是点击还是拖拽操作
     * - 点击：执行麻将选择和消除逻辑
     * - 拖拽：计算目标位置并执行移动
     * - 清理拖拽状态和虚影节点
     */
    private onTouchEnd(event: EventTouch) {
        console.log('=== 拖动结束 ===');
        console.log('当前拖拽状态:', {
            isDragging: this.isDragging,
            dragStartPos: this.dragStartPos,
            dragGroup: this.dragGroup,
            dragDirection: this.dragDirection
        });
        
        // 保存拖拽状态，因为clearDragStates会清除它们
        const wasDragging = this.isDragging;
        const dragStartPos = this.dragStartPos;
        
        this.clearDragStates();
        
        if (wasDragging && dragStartPos) {
            const touchPos = event.getUILocation();
            const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
            
            // 计算移动距离
            const deltaX = worldPos.x - dragStartPos.worldPos.x;
            const deltaY = worldPos.y - dragStartPos.worldPos.y;
            const threshold = 30;
            
            console.log('拖拽结束计算:', {
                startPos: dragStartPos.worldPos,
                endPos: worldPos,
                deltaX,
                deltaY,
                threshold
            });
            
            if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
                // 移动距离小，当作点击处理
                console.log('移动距离小于阈值，当作点击处理');
                this.handleTileClick(dragStartPos.row, dragStartPos.col);
            } else {
                // 处理拖拽移动
                console.log('移动距离超过阈值，处理拖拽移动');
                const targetGridPos = this.boardManager.screenToGrid(new Vec2(touchPos.x, touchPos.y));
                console.log('目标网格位置:', targetGridPos);
                
                if (targetGridPos) {
                    this.handleDragEnd(dragStartPos.row, dragStartPos.col, targetGridPos.row, targetGridPos.col);
                } else {
                    console.log('无法获取有效的目标网格位置');
                }
            }
        } else if (dragStartPos) {
            // 没有拖拽，当作点击处理
            console.log('没有进入拖拽状态，当作点击处理');
            this.handleTileClick(dragStartPos.row, dragStartPos.col);
        } else {
            console.log('没有拖拽起始位置，忽略');
        }
        
        this.resetDragState();
        console.log('=== 拖动结束处理完成 ===');
    }
    
    /**
     * 处理麻将点击事件 - 参考web版本实现
     */
    private handleTileClick(row: number, col: number) {
        console.log(`=== 处理麻将点击: (${row}, ${col}) ===`);
        
        const clickedTileNode = this.boardManager.getTileNode(row, col);
        const clickedTileData = this.boardManager.getTileData(row, col);
        console.log('点击的麻将数据:', clickedTileData);
        console.log('点击的麻将节点:', clickedTileNode ? '存在' : '不存在');
        
        if (!clickedTileNode) {
            console.log('错误：麻将节点不存在');
            return;
        }
        
        console.log('当前选中状态:', this.selectedTile ? `(${this.selectedTile.row}, ${this.selectedTile.col})` : '无');
        console.log('selectedTile对象:', this.selectedTile);
        
        if (this.selectedTile) {
            // 如果点击的是同一个麻将，取消选择
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                console.log('点击相同麻将，取消选择');
                this.clearSelection();
                return;
            }
            
            // 检查是否可以消除
            const canEliminate = this.logicManager.canEliminate(this.selectedTile.row, this.selectedTile.col, row, col);
            console.log('消除检查结果:', canEliminate);
            
            if (canEliminate) {
                console.log('可以消除，执行消除操作');
                this.eliminatePair(this.selectedTile.row, this.selectedTile.col, row, col);
                this.clearSelection();
            } else {
                console.log('不能消除，选择新的麻将');
                this.clearSelection();
                this.selectTileWithSmartElimination(row, col, clickedTileNode);
            }
        } else {
            console.log('第一次选择麻将 - 使用智能消除');
            this.selectTileWithSmartElimination(row, col, clickedTileNode);
        }
        console.log('=== 点击处理结束 ===');
    }
    
    /**
     * 智能消除选择 - 参考web版本实现
     * 当选择一个麻将时，自动检查消除机会并执行相应操作
     */
    private selectTileWithSmartElimination(row: number, col: number, tileNode: Node) {
        console.log(`--- 智能消除选择: (${row}, ${col}) ---`);
        
        // 检查当前麻将可以消除的所有选项
        const eliminableOptions = this.logicManager.getEliminableOptionsForTile(row, col);
        console.log(`找到 ${eliminableOptions.length} 个可消除选项:`, eliminableOptions);
        
        if (eliminableOptions.length === 1) {
            // 只有一个可消除选项，直接自动消除
            console.log('只有一个选项，自动消除');
            const option = eliminableOptions[0];
            this.eliminatePair(option.row1, option.col1, option.row2, option.col2);
        } else if (eliminableOptions.length > 1) {
            // 有多个可消除选项，选择当前麻将并高亮所有可消除的选项
            console.log('有多个选项，显示高亮供用户选择');
            this.selectTile(row, col, tileNode);
        } else {
            // 没有可消除的选项，依然选择这个麻将（让用户知道麻将类型）
            console.log('没有可消除选项，正常选中');
            this.selectTile(row, col, tileNode);
        }
    }
    
    /**
     * 选择麻将
     */
    private selectTile(row: number, col: number, tileNode: Node) {
        console.log(`=== 选择麻将: (${row}, ${col}) ===`);
        console.log('麻将节点名称:', tileNode.name);
        console.log('麻将节点有效性:', tileNode.isValid);
        
        this.selectedTile = { row, col, node: tileNode };
        console.log('设置选中状态完成，当前选中:', this.selectedTile);
        
        console.log('开始高亮选中麻将...');
        this.tileManager.highlightSelectedTile(tileNode);
        console.log('高亮选中麻将完成');
        
        console.log('开始高亮可消除麻将...');
        this.tileManager.highlightEliminable(row, col, this.boardManager, this.boardManager.getBoardSize(), (r1, c1, r2, c2) => this.logicManager.canEliminate(r1, c1, r2, c2));
        console.log('高亮可消除麻将完成');
        
        console.log('=== 选择麻将完成 ===');
    }
    
    /**
     * 清除选择状态
     */
    private clearSelection() {
        console.log('清除选择状态');
        
        if (this.selectedTile) {
            console.log('当前选中的麻将:', this.selectedTile);
            
            // 检查选中麻将节点的有效性
            if (this.selectedTile.node && this.selectedTile.node.isValid) {
                console.log('清除选中麻将高亮');
                this.tileManager.clearTileHighlight(this.selectedTile.node);
            } else {
                console.log('选中的麻将节点无效，跳过清除高亮');
            }
        } else {
            console.log('没有选中的麻将需要清除');
        }
        
        console.log('清除所有高亮');
        this.tileManager.clearAllHighlights();
        
        this.selectedTile = null;

    }
    
    /**
     * 消除一对麻将
     * 
     * 功能：
     * - 播放消除动画（缩放 + 旋转 + 淡出特效）
     * - 两个麻将块分别向不同方向旋转（增加视觉趣味性）
     * - 从游戏数据和显示中移除麻将
     * - 更新游戏得分
     * - 检查游戏胜利条件
     * 
     * @param row1 第一个麻将的行
     * @param col1 第一个麻将的列
     * @param row2 第二个麻将的行
     * @param col2 第二个麻将的列
     */
    private eliminatePair(row1: number, col1: number, row2: number, col2: number) {
        console.log(`消除麻将对: (${row1}, ${col1}) 和 (${row2}, ${col2})`);
        
        const tile1Node = this.boardManager.getTileNode(row1, col1);
        const tile2Node = this.boardManager.getTileNode(row2, col2);
        
        if (tile1Node && tile2Node) {
            // 消除动画 - 包含旋转特效
            const animateElimination = (node: Node, rotationDirection: number = 1) => {
                console.log(`  🌀 开始旋转动画: ${rotationDirection > 0 ? '顺时针' : '逆时针'}`);
                
                // 添加UIOpacity组件用于透明度动画
                const uiOpacity = node.addComponent(UIOpacity);
                uiOpacity.opacity = 255;
                
                // 获取当前旋转角度
                const currentRotation = node.eulerAngles.z;
                
                // 缩放 + 旋转动画
                tween(node)
                    .to(0.15, { 
                        scale: new Vec3(1.5, 1.5, 1),  // 使用固定值替代ANIMATION_SCALE
                        eulerAngles: new Vec3(0, 0, currentRotation + 180 * rotationDirection)
                    })
                    .to(0.25, { 
                        scale: new Vec3(0, 0, 0),
                        eulerAngles: new Vec3(0, 0, currentRotation + 360 * rotationDirection)
                    })
                    .call(() => {
                        node.destroy();
                    })
                    .start();
                    
                // 同时进行透明度动画
                tween(uiOpacity)
                    .to(0.4, { opacity: 0 })
                    .start();
            };
            
            // 让两个麻将块向不同方向旋转，增加视觉趣味性
            console.log('🎭 播放消除动画 - 旋转特效');
            animateElimination(tile1Node, 1);   // 顺时针旋转
            animateElimination(tile2Node, -1);  // 逆时针旋转
        }
        
        // 消除后立即清除所有高亮状态
        this.tileManager.clearAllHighlights();
        this.clearSelection();
        
        // 更新数据
        setTimeout(() => {
            this.boardManager.clearPosition(row1, col1);
            this.boardManager.clearPosition(row2, col2);
            this.score += 10;
            
            console.log(`当前分数: ${this.score}`);
            this.logicManager.checkWinCondition();
        }, 400);
    }
    
    /**
     * 重新开始游戏
     * 
     * 功能：
     * - 清除当前选择状态和拖拽状态
     * - 重置游戏得分
     * - 重新初始化游戏棋盘
     * 
     * 注意：这是一个公共方法，可以从外部调用
     */
    public restart() {
        console.log('重新开始游戏');
        this.clearSelection();
        this.resetDragState();
        this.score = 0;
        this.init();
    }
    
    /**
     * 重置拖拽状态
     */
    private resetDragState() {
        this.isDragging = false;
        this.dragStartPos = null;
        this.dragEndPos = null;
        this.dragGroup = [];
        this.dragDirection = null;
        this.clearDragShadows();
    }
    
    /**
     * 清除拖拽状态
     */
    private clearDragStates() {
        this.clearDragShadows();
        this.isDragging = false;
        this.dragDirection = null;
    }
    
    /**
     * 创建拖拽虚影
     * 
     * 功能：
     * - 为拖拽组中的每个麻将创建半透明虚影
     * - 虚影跟随鼠标移动，但受轴向约束
     * - 水平拖拽时虚影Y坐标固定，垂直拖拽时虚影X坐标固定
     * 
     * @param currentPos 当前鼠标位置
     */
    private createDragGroupShadows(currentPos: Vec3) {
        this.clearDragShadows(); // 清除现有虚影
        if (!this.dragStartPos || this.dragGroup.length === 0) return;
        
        const startTileNode = this.boardManager.getTileNode(this.dragStartPos.row, this.dragStartPos.col);
        if (!startTileNode) return;
        
        const startTileWorldPos = startTileNode.worldPosition;
        
        this.dragGroup.forEach(tileGrid => {
            const originalTileNode = this.boardManager.getTileNode(tileGrid.row, tileGrid.col);
            if (!originalTileNode) return;
            
            const tileData = this.boardManager.getTileData(tileGrid.row, tileGrid.col);
            if (!tileData) return;
            
            // 从对应类型的对象池获取完全配置好的虚影节点
            const shadowNode = this.getShadowFromPool(tileData.type);
            if (!shadowNode) {
                console.warn(`无法获取类型 ${tileData.type} 的虚影节点`);
                return;
            }
            
            console.log(`✅ 获取虚影节点成功: ${shadowNode.name}, active: ${shadowNode.active}`);
            
            // 节点已经完全配置好，无需任何设置
            
            // 计算相对偏移
            const originalTileWorldPos = originalTileNode.worldPosition;
            const relativeOffsetX = originalTileWorldPos.x - startTileWorldPos.x;
            const relativeOffsetY = originalTileWorldPos.y - startTileWorldPos.y;
            
            // 存储相对偏移信息
            (shadowNode as any).relativeOffsetX = relativeOffsetX;
            (shadowNode as any).relativeOffsetY = relativeOffsetY;
            (shadowNode as any).originalWorldX = originalTileWorldPos.x;
            (shadowNode as any).originalWorldY = originalTileWorldPos.y;
            
            this.dragShadows.push(shadowNode);
        });
        
        this.updateDragGroupShadowsPosition(currentPos);
    }
    
    /**
     * 更新拖动组虚影位置
     */
    private updateDragGroupShadowsPosition(currentPos: Vec3) {
        if (!this.dragStartPos || this.dragGroup.length === 0 || this.dragShadows.length === 0) return;
        
        this.dragShadows.forEach(shadow => {
            const relativeOffsetX = (shadow as any).relativeOffsetX || 0;
            const relativeOffsetY = (shadow as any).relativeOffsetY || 0;
            const originalWorldX = (shadow as any).originalWorldX || 0;
            const originalWorldY = (shadow as any).originalWorldY || 0;
            
            let shadowX = currentPos.x + relativeOffsetX;
            let shadowY = currentPos.y + relativeOffsetY;
            
            // 根据拖拽方向约束移动
            if (this.dragDirection === 'horizontal') {
                shadowY = originalWorldY; // 固定Y坐标
            } else if (this.dragDirection === 'vertical') {
                shadowX = originalWorldX; // 固定X坐标
            }
            
            shadow.setWorldPosition(shadowX, shadowY, 0);
            console.log(`🔄 更新虚影位置: ${shadow.name} -> (${shadowX.toFixed(1)}, ${shadowY.toFixed(1)})`);
        });
    }
    
    /**
     * 清除拖拽虚影
     * 
     * 功能：
     * - 将虚影节点归还到对象池
     * - 清空虚影节点数组
     */
    private clearDragShadows() {
        this.dragShadows.forEach(shadow => this.returnShadowToPool(shadow));
        this.dragShadows = [];
    }
    
    /**
     * 处理拖拽结束
     * 
     * 功能：
     * - 计算拖拽组的目标位置
     * - 验证移动的有效性（边界检查、空位检查）
     * - 执行麻将移动或显示移动失败反馈
     * - 移动成功后检查消除机会
     * 
     * @param startRow 拖拽起始行
     * @param startCol 拖拽起始列
     * @param endRow 拖拽结束行
     * @param endCol 拖拽结束列
     */
    private handleDragEnd(startRow: number, startCol: number, endRow: number, endCol: number) {
        console.log('=== 处理拖拽结束 ===');
        console.log(`起始位置: (${startRow}, ${startCol})`);
        console.log(`结束位置: (${endRow}, ${endCol})`);
        console.log('当前拖动组:', this.dragGroup);
        
        // 计算移动方向和距离
        const deltaRow = endRow - startRow;
        const deltaCol = endCol - startCol;
        
        console.log('网格移动距离:', { deltaRow, deltaCol });
        
        let direction = '';
        let steps = 0;
        
        if (Math.abs(deltaCol) > Math.abs(deltaRow)) {
            direction = deltaCol > 0 ? 'right' : 'left';
            steps = Math.abs(deltaCol);
        } else if (Math.abs(deltaRow) > 0) {
            direction = deltaRow > 0 ? 'down' : 'up';
            steps = Math.abs(deltaRow);
        }
        
        console.log(`计算的移动: 方向=${direction}, 步数=${steps}`);
        
        if (steps > 0) {
            console.log('开始执行麻将移动逻辑');
            
            // 检查移动后是否有消除机会
            const canMove = this.logicManager.checkIfCanMove(this.dragGroup, direction, steps);
            console.log('移动可行性检查:', canMove);
            
            if (canMove) {
                // 执行移动
                console.log('执行移动操作');
                this.executeTileMove(startRow, startCol, direction, steps);
                
                // 检查移动后的消除机会
                setTimeout(() => {
                    console.log('检查移动后的消除机会');
                    this.checkEliminationAfterMove();
                }, 60);
            } else {
                console.log('移动不可行，显示失败反馈');
                // this.showMoveFailedFeedback(startRow, startCol);
            }
        } else {
            console.log('移动步数为0，不执行移动');
        }
        
        console.log('=== 拖拽结束处理完成 ===');
    }
    
    /**
     * 检查是否可以移动
     * 
     * 功能：
     * - 检查拖动组中每个麻将的移动路径是否有障碍
     * - 确保移动路径上没有其他麻将阻挡
     * - 检查目标位置是否在棋盘范围内
     * 
     * @param startRow 起始行
     * @param startCol 起始列
     * @param direction 移动方向
     * @param steps 移动步数
     * @returns 是否可以移动
     */
    
    /**
     * 执行麻将移动
     */
    private executeTileMove(startRow: number, startCol: number, direction: string, steps: number) {
        console.log(`执行移动: (${startRow}, ${startCol}) ${direction} ${steps}步`);
        console.log('当前拖动组:', this.dragGroup);
        
        // 使用统一的方法计算新位置
        const newPositions = this.logicManager.calculateNewPositions(this.dragGroup, direction, steps);
        console.log('计算的新位置:', newPositions);
        
        // 检查新位置是否有冲突
        const hasConflict = this.logicManager.checkPositionConflicts(newPositions);
        console.log('位置冲突检查:', hasConflict);
        
        if (!hasConflict) {
            // 执行实际移动
            this.performTileMovement(this.dragGroup, newPositions);
        } else {
            console.log('位置有冲突，移动失败');
        }
    }
    

    
    /**
     * 执行实际的麻将移动
     */
    private performTileMovement(oldPositions: {row: number, col: number}[], newPositions: {row: number, col: number}[]) {
        console.log('执行实际移动');
        console.log('旧位置:', oldPositions);
        console.log('新位置:', newPositions);
        
        // 暂存麻将数据和节点
        const tileData: (TileData | null)[] = [];
        const tileNodes: (Node | null)[] = [];
        
        // 验证输入参数
        if (!oldPositions || !newPositions || oldPositions.length === 0) {
            console.error('移动参数无效，无法保存移动记录');
            return;
        }
        
        // 保存移动记录用于回退
        const moveRecord = {
            oldPositions: [...oldPositions],
            newPositions: [...newPositions],
            tileData: [],
            tileNodes: [],
            originalDragPosition: this.dragStartPos ? {row: this.dragStartPos.row, col: this.dragStartPos.col} : null
        };
        
        // 保存移动记录到LogicManager
        this.logicManager.saveLastMoveRecord(moveRecord);
        
        console.log('保存移动记录，旧位置:', oldPositions);
        console.log('保存移动记录，新位置:', newPositions);
        
        // 清除旧位置（安全检查）
        oldPositions.forEach((pos, index) => {
            // 验证位置有效性
            if (!pos || typeof pos.row !== 'number' || typeof pos.col !== 'number' ||
                pos.row < 0 || pos.row >= this.boardManager.getBoardSize() || 
                pos.col < 0 || pos.col >= this.boardManager.getBoardSize()) {
                console.error(`无效的旧位置 ${index}:`, pos);
                return;
            }
            
            tileData[index] = this.boardManager.getTileData(pos.row, pos.col);
            tileNodes[index] = this.boardManager.getTileNode(pos.row, pos.col);
            
            console.log(`保存位置 ${index}: (${pos.row}, ${pos.col})`);
            console.log(`麻将数据:`, tileData[index]);
            console.log(`麻将节点:`, tileNodes[index] ? '存在' : '不存在');
            
            // 保存到移动记录（深拷贝数据）
            moveRecord.tileData[index] = tileData[index];
            moveRecord.tileNodes[index] = tileNodes[index];
            
            // 验证保存的数据
            if (!tileData[index]) {
                console.warn(`位置 (${pos.row}, ${pos.col}) 的麻将数据为空`);
            }
            if (!tileNodes[index]) {
                console.warn(`位置 (${pos.row}, ${pos.col}) 的麻将节点为空`);
            } else if (!tileNodes[index].isValid) {
                console.warn(`位置 (${pos.row}, ${pos.col}) 的麻将节点已失效`);
            }
            
            // 清除旧位置
            this.boardManager.clearPosition(pos.row, pos.col);
        });
        
        // 验证移动记录完整性
        if (moveRecord.oldPositions.length !== moveRecord.tileData.length ||
            moveRecord.oldPositions.length !== moveRecord.tileNodes.length) {
            console.error('移动记录数据不完整，清除记录');
            this.logicManager.clearLastMoveRecord();
            return;
        }
        
        // 更新LogicManager中的移动记录
        this.logicManager.saveLastMoveRecord(moveRecord);
        
        console.log('移动记录保存完成:', moveRecord);
        
        // 设置新位置
        newPositions.forEach((pos, index) => {
            this.boardManager.setTileData(pos.row, pos.col, tileData[index]);
            this.boardManager.setTileNode(pos.row, pos.col, tileNodes[index]);
            
            // 更新节点位置
            if (tileNodes[index]) {
                const tileSize = this.boardManager.getTileSize();
                const tileGap = this.boardManager.getTileGap();
                const boardWidth = this.boardManager.getBoardSize() * tileSize + (this.boardManager.getBoardSize() - 1) * tileGap;
                const boardHeight = this.boardManager.getBoardSize() * tileSize + (this.boardManager.getBoardSize() - 1) * tileGap;
                const startX = -boardWidth / 2 + tileSize / 2;
                const startY = boardHeight / 2 - tileSize / 2;
                
                const x = startX + pos.col * (tileSize + tileGap);
                const y = startY - pos.row * (tileSize + tileGap);
                
                tileNodes[index]!.setPosition(x, y, 0);
                
                // 更新节点的网格信息
                (tileNodes[index] as any).gridRow = pos.row;
                (tileNodes[index] as any).gridCol = pos.col;
            }
        });
        
        console.log('移动完成，已保存移动记录');
    }
    
    /**
     * 检查移动后的消除机会并执行智能消除
     * 
     * 智能消除逻辑：
     * 1. 优先检查最初拖动的麻将的消除机会
     * 2. 如果有唯一消除选项，自动执行消除
     * 3. 如果有多个消除选项，高亮显示等待用户选择
     * 4. 如果没有消除机会，自动回退移动
     * 5. 如果无法确定原始拖动位置，检查所有移动麻将的消除机会
     */
    private checkEliminationAfterMove() {
        console.log('检查移动后是否有消除机会');
        
        const lastMoveRecord = this.logicManager.getLastMoveRecord();
        if (!lastMoveRecord) {
            console.log('没有移动记录，无法检查消除');
            return;
        }
        
        if (!lastMoveRecord.originalDragPosition) {
            console.log('没有保存原始拖动位置，检查所有移动麻将的消除机会');
            // 如果没有原始拖动位置，回退到检查所有移动麻将的逻辑
            this.checkAllMovedTilesElimination();
            return;
        }
        
        // 找到最初拖动的麻将在移动后的新位置
        const originalDragTileNewPos = this.logicManager.findOriginalDragTileNewPosition();
        if (!originalDragTileNewPos) {
            console.log('无法找到原始拖动麻将的新位置');
            this.revertLastMove();
            return;
        }
        
        console.log(`检查原始拖动麻将在新位置 (${originalDragTileNewPos.row}, ${originalDragTileNewPos.col}) 的消除机会`);
        
        // 收集原始拖动麻将的消除对
        const eliminablePairs = this.logicManager.getEliminationOptionsForPosition(originalDragTileNewPos.row, originalDragTileNewPos.col);
        
        console.log(`原始拖动麻将的消除对数量: ${eliminablePairs.length}`);
        
        if (eliminablePairs.length === 1) {
            // 只有一个消除选项，自动消除
            console.log('只有一个消除选项，自动执行消除');
            const pair = eliminablePairs[0];
            this.eliminatePair(pair.row1, pair.col1, pair.row2, pair.col2);
        } else if (eliminablePairs.length > 1) {
            // 有多个消除选项，移动成功，等待用户选择
            console.log(`有 ${eliminablePairs.length} 个消除选项，移动成功，等待用户选择`);
            // 高亮显示原始拖动麻将及其消除选项
            this.highlightOriginalDragTileEliminablePairs(originalDragTileNewPos, eliminablePairs);
        } else {
            // 没有消除机会，需要回退
            console.log('原始拖动麻将移动后没有消除机会，需要回退');
            this.revertLastMove();
        }
    }
    
    /**
     * 检查所有移动麻将的消除机会（备用方案）
     */
    private checkAllMovedTilesElimination() {
        console.log('检查所有移动麻将的消除机会');
        
        const lastMoveRecord = this.logicManager.getLastMoveRecord();
        if (!lastMoveRecord) {
            console.log('没有移动记录');
            return;
        }
        
        // 收集与移动麻将相关的消除对
        const eliminablePairs = this.logicManager.getAllMovedTilesEliminationOptions();
        
        console.log(`与移动麻将相关的消除对数量: ${eliminablePairs.length}`);
        
        if (eliminablePairs.length === 1) {
            // 只有一个消除选项，自动消除
            console.log('只有一个消除选项，自动执行消除');
            const pair = eliminablePairs[0];
            this.eliminatePair(pair.row1, pair.col1, pair.row2, pair.col2);
        } else if (eliminablePairs.length > 1) {
            // 有多个消除选项，移动成功，等待用户选择
            console.log(`有 ${eliminablePairs.length} 个与移动麻将相关的消除选项，移动成功，等待用户选择`);
            // 高亮显示与移动麻将相关的消除选项
            this.highlightMovedTileEliminablePairs(eliminablePairs);
        } else {
            // 没有消除机会，需要回退
            console.log('移动后没有与移动麻将相关的消除机会，需要回退');
            this.revertLastMove();
        }
    }
    
    /**
     * 高亮显示原始拖动麻将及其消除选项
     */
    private highlightOriginalDragTileEliminablePairs(
        originalTilePos: {row: number, col: number}, 
        pairs: Array<{row1: number, col1: number, row2: number, col2: number}>
    ) {
        console.log('高亮显示原始拖动麻将及其消除选项');
        
        // 清除之前的高亮
        this.tileManager.clearAllHighlights();
        
        // 高亮原始拖动的麻将（蓝色）
        const originalTileNode = this.boardManager.getTileNode(originalTilePos.row, originalTilePos.col);
        if (originalTileNode && originalTileNode.isValid) {
            try {
                this.tileManager.setTileHighlight(originalTileNode, 'selected');
                console.log(`高亮原始拖动麻将 (${originalTilePos.row}, ${originalTilePos.col}) 为蓝色`);
                
                // 注意：不需要手动push，setTileHighlight会自动管理高亮列表
            } catch (error) {
                console.error(`高亮原始拖动麻将时发生错误:`, error);
            }
        }
        
        // 高亮消除伙伴（黄色）
        pairs.forEach(pair => {
            // 找到消除伙伴的位置（不是原始拖动麻将的那个位置）
            let partnerRow, partnerCol;
            if (pair.row1 === originalTilePos.row && pair.col1 === originalTilePos.col) {
                partnerRow = pair.row2;
                partnerCol = pair.col2;
            } else {
                partnerRow = pair.row1;
                partnerCol = pair.col1;
            }
            
            const partnerNode = this.boardManager.getTileNode(partnerRow, partnerCol);
            if (partnerNode && partnerNode.isValid) {
                try {
                    this.tileManager.setTileHighlight(partnerNode, 'eliminable');
                    console.log(`高亮消除伙伴 (${partnerRow}, ${partnerCol}) 为黄色`);
                    
                    // 注意：不需要手动push，setTileHighlight会自动管理高亮列表
                } catch (error) {
                    console.error(`高亮消除伙伴时发生错误:`, error);
                }
            }
        });
        
        console.log(`高亮完成：1个原始拖动麻将（蓝色）和 ${pairs.length} 个消除伙伴（黄色）`);
        }
    
    /**
     * 高亮显示与移动麻将相关的消除选项
     */
    private highlightMovedTileEliminablePairs(pairs: Array<{row1: number, col1: number, row2: number, col2: number}>) {
        console.log('=== 开始高亮显示与移动麻将相关的消除选项 ===');
        console.log('消除对数据:', pairs);
        
        // 清除之前的高亮
        this.tileManager.clearAllHighlights();
        
        const lastMoveRecord = this.logicManager.getLastMoveRecord();
        if (!lastMoveRecord) {
            console.log('没有移动记录，无法高亮');
            return;
        }
        
        console.log('移动记录:', lastMoveRecord);
        
        // 收集移动的麻将位置和它们的消除伙伴位置
        const movedPositions = new Set<string>();
        const partnerPositions = new Set<string>();
        
        // 标记移动的麻将位置
        lastMoveRecord.newPositions.forEach(pos => {
            const posStr = `${pos.row}-${pos.col}`;
            movedPositions.add(posStr);
            console.log(`标记移动位置: ${posStr}`);
        });
        
        pairs.forEach(pair => {
            const pos1 = `${pair.row1}-${pair.col1}`;
            const pos2 = `${pair.row2}-${pair.col2}`;
            
            console.log(`检查消除对: ${pos1} <-> ${pos2}`);
            
            // 如果其中一个是移动的麻将，另一个就是消除伙伴
            if (movedPositions.has(pos1)) {
                partnerPositions.add(pos2);
                console.log(`${pos1} 是移动的麻将，${pos2} 是消除伙伴`);
            } else if (movedPositions.has(pos2)) {
                partnerPositions.add(pos1);
                console.log(`${pos2} 是移动的麻将，${pos1} 是消除伙伴`);
            }
        });
        
        console.log('移动位置集合:', Array.from(movedPositions));
        console.log('伙伴位置集合:', Array.from(partnerPositions));
        
        // 高亮移动的麻将（更明显的蓝色）
        movedPositions.forEach(posStr => {
            const [row, col] = posStr.split('-').map(Number);
            const tileNode = this.boardManager.getTileNode(row, col);
            console.log(`尝试高亮移动麻将 (${row}, ${col}):`, tileNode ? '节点存在' : '节点不存在');
            
            if (tileNode && tileNode.isValid) {
                try {
                    // 高亮移动的麻将（蓝色）
                    this.tileManager.setTileHighlight(tileNode, 'selected');
                } catch (error) {
                    console.error(`高亮移动麻将 (${row}, ${col}) 时发生错误:`, error);
                }
            } else if (tileNode) {
                console.log(`麻将 (${row}, ${col}) 节点已失效`);
            }
        });
        
        // 高亮消除伙伴（更明显的黄色）
        partnerPositions.forEach(posStr => {
            const [row, col] = posStr.split('-').map(Number);
            const tileNode = this.boardManager.getTileNode(row, col);
            console.log(`尝试高亮消除伙伴 (${row}, ${col}):`, tileNode ? '节点存在' : '节点不存在');
            
            if (tileNode && tileNode.isValid) {
                try {
                    // 高亮消除伙伴（黄色）
                    this.tileManager.setTileHighlight(tileNode, 'eliminable');
                } catch (error) {
                    console.error(`高亮消除伙伴 (${row}, ${col}) 时发生错误:`, error);
                }
            } else if (tileNode) {
                console.log(`麻将 (${row}, ${col}) 节点已失效`);
            }
        });
        
        console.log(`=== 高亮完成：${movedPositions.size} 个移动的麻将（蓝色）和 ${partnerPositions.size} 个消除伙伴（黄色）===`);
        console.log(`总共高亮了 ${this.tileManager.getHighlightedTiles().length} 个麻将节点`);
    }
    
    /**
     * 回退上次移动
     * 
     * 功能：
     * - 将所有移动的麻将恢复到移动前的位置
     * - 恢复游戏数据矩阵和节点矩阵
     * - 播放回退闪烁动画提供视觉反馈
     * - 包含完整的安全检查防止空指针异常
     */
    private revertLastMove() {
        console.log('开始回退上次移动');
        
        const record = this.logicManager.getLastMoveRecord();
        if (!record) {
            console.log('没有移动记录，无法回退');
            return;
        }
        console.log('回退移动记录:', record);
        
        // 验证记录完整性
        if (!record.oldPositions || !record.newPositions || !record.tileData || !record.tileNodes) {
            console.error('移动记录数据不完整，无法安全回退');
            this.logicManager.clearLastMoveRecord();
            return;
        }
        
        if (record.oldPositions.length !== record.tileData.length || 
            record.oldPositions.length !== record.tileNodes.length) {
            console.error('移动记录数据长度不一致，无法安全回退');
            this.logicManager.clearLastMoveRecord();
            return;
        }
        
        try {
            // 第一步：清除新位置（安全检查）
            console.log('第一步：清除新位置');
            record.newPositions.forEach((pos, index) => {
                if (pos && typeof pos.row === 'number' && typeof pos.col === 'number' &&
                    pos.row >= 0 && pos.row < this.boardManager.getBoardSize() && 
                    pos.col >= 0 && pos.col < this.boardManager.getBoardSize()) {
                    
                    console.log(`清除新位置 (${pos.row}, ${pos.col})`);
                    this.boardManager.clearPosition(pos.row, pos.col);
                } else {
                    console.error(`无效的新位置 ${index}:`, pos);
                }
            });
            
            // 第二步：恢复旧位置（安全检查）
            console.log('第二步：恢复旧位置');
            record.oldPositions.forEach((pos, index) => {
                if (!pos || typeof pos.row !== 'number' || typeof pos.col !== 'number' ||
                    pos.row < 0 || pos.row >= this.boardManager.getBoardSize() || 
                    pos.col < 0 || pos.col >= this.boardManager.getBoardSize()) {
                    console.error(`无效的旧位置 ${index}:`, pos);
                    return;
                }
                
                const tileData = record.tileData[index];
                const tileNode = record.tileNodes[index];
                
                console.log(`恢复位置 ${index}: (${pos.row}, ${pos.col})`);
                console.log(`麻将数据:`, tileData);
                console.log(`麻将节点:`, tileNode ? '存在' : '不存在');
                
                // 恢复数据
                this.boardManager.setTileData(pos.row, pos.col, tileData);
                this.boardManager.setTileNode(pos.row, pos.col, tileNode);
                
                // 恢复节点位置（如果节点存在）
                if (tileNode && tileNode.isValid) {
                    try {
                        const tileSize = this.boardManager.getTileSize();
                        const tileGap = this.boardManager.getTileGap();
                        const boardWidth = this.boardManager.getBoardSize() * tileSize + (this.boardManager.getBoardSize() - 1) * tileGap;
                        const boardHeight = this.boardManager.getBoardSize() * tileSize + (this.boardManager.getBoardSize() - 1) * tileGap;
                        const startX = -boardWidth / 2 + tileSize / 2;
                        const startY = boardHeight / 2 - tileSize / 2;
                        
                        const x = startX + pos.col * (tileSize + tileGap);
                        const y = startY - pos.row * (tileSize + tileGap);
                        
                        // 检查参数有效性
                        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
                            console.error(`位置参数无效: x=${x}, y=${y}`);
                            return;
                        }
                        
                        tileNode.setPosition(x, y, 0);
                        console.log(`成功设置节点位置: (${x}, ${y})`);
                        
                        // 恢复节点的网格信息
                        (tileNode as any).gridRow = pos.row;
                        (tileNode as any).gridCol = pos.col;
                        
                    } catch (error) {
                        console.error(`设置节点位置失败:`, error);
                        console.error(`节点信息:`, tileNode);
                    }
                } else if (tileNode) {
                    console.warn(`节点 ${index} 已失效，跳过位置设置`);
                }
            });
            
            // 第三步：显示回退动画效果（安全检查）
            // 省略...

            console.log('移动回退成功');
            
        } catch (error) {
            console.error('回退过程中发生错误:', error);
            console.error('尝试清理状态...');
            
            // 发生错误时，尝试清理可能的不一致状态
            this.clearSelection();
            this.tileManager.clearAllHighlights();
        } finally {
            // 无论成功还是失败，都清除移动记录
            this.logicManager.clearLastMoveRecord();
            console.log('移动记录已清除');
        }
    }
}

/**
 * 麻将数据接口
 */
interface TileData {
    type: number;
    symbol: string;
    id: string;
}
