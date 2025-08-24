/**
 * 输入管理器 - 负责所有用户输入处理
 * 
 * 主要职责:
 * - 触摸事件处理 (开始、移动、结束)
 * - 拖拽状态管理
 * - 坐标转换处理
 * - 输入事件分发给GameManager
 * 
 * 所有方法都是从GameManager中完整迁移而来，保持原有逻辑不变
 * 
 * @author Zipxing & Cursor
 * @version 1.0
 */

import { _decorator, input, Input, EventTouch, Vec2, Vec3 } from 'cc';
const { ccclass } = _decorator;

// 回调函数接口
interface InputCallbacks {
    onTileClick: (row: number, col: number) => void;
    onDragEnd: (startRow: number, startCol: number, endRow: number, endCol: number, dragState: any) => void;
    screenToGrid: (screenPos: Vec2) => {row: number, col: number} | null;
    getTileData: (row: number, col: number) => any;
    findDragGroupForSpecificDirection: (startRow: number, startCol: number, direction: 'left' | 'right' | 'up' | 'down') => {row: number, col: number}[];
    createDragGroupShadows: (currentPos: Vec3, dragStartPos: {row: number, col: number, worldPos: Vec3}, dragGroup: {row: number, col: number}[]) => void;
    updateDragGroupShadowsPosition: (currentPos: Vec3, dragDirection: 'horizontal' | 'vertical' | null) => void;
    clearDragStates: () => void;
}

@ccclass('InputManager')
export class InputManager {
    
    // ==================== 拖拽状态 ====================
    private isDragging: boolean = false;
    private dragStartPos: {row: number, col: number, worldPos: Vec3} | null = null;
    private dragEndPos: {x: number, y: number} | null = null;
    private dragGroup: {row: number, col: number}[] = [];
    private dragDirection: 'horizontal' | 'vertical' | null = null;
    
    // ==================== 回调函数 ====================
    private callbacks: InputCallbacks | null = null;
    
    /**
     * 初始化InputManager
     */
    init(callbacks: InputCallbacks): void {
        this.callbacks = callbacks;
        this.resetDragState();
        
        // 注册触摸事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        console.log('✅ InputManager初始化完成');
    }
    
    /**
     * 销毁InputManager
     */
    destroy(): void {
        // 移除触摸事件
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        this.callbacks = null;
        console.log('✅ InputManager已销毁');
    }
    
    /**
     * 获取拖拽状态
     */
    getDragState(): any {
        return {
            isDragging: this.isDragging,
            dragStartPos: this.dragStartPos,
            dragEndPos: this.dragEndPos,
            dragGroup: [...this.dragGroup],
            dragDirection: this.dragDirection
        };
    }
    
    /**
     * 重置拖拽状态
     * （从GameManager.resetDragState()完全迁移）
     */
    resetDragState(): void {
        this.isDragging = false;
        this.dragStartPos = null;
        this.dragEndPos = null;
        this.dragGroup = [];
        this.dragDirection = null;
        if (this.callbacks) {
            this.callbacks.clearDragStates();
        }
    }
    
    // ==================== 触摸事件处理 ====================
    
    /**
     * 触摸开始事件处理
     * （从GameManager.onTouchStart()完全迁移）
     * 
     * 功能：
     * - 获取触摸位置并转换为网格坐标
     * - 检查点击的位置是否有麻将
     * - 初始化拖拽状态和拖拽组
     * - 为后续的拖拽或点击操作做准备
     */
    private onTouchStart(event: EventTouch): void {
        if (!this.callbacks) return;
        
        const touchPos = event.getUILocation();
        console.log('=== 触摸开始 ===');
        console.log('触摸坐标:', touchPos);
        
        // 获取点击的麻将位置
        const gridPos = this.callbacks.screenToGrid(touchPos);
        console.log('网格位置:', gridPos);
        
        if (gridPos && this.callbacks.getTileData(gridPos.row, gridPos.col)) {
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
     * （从GameManager.onTouchMove()完全迁移）
     * 
     * 功能：
     * - 计算拖拽距离和方向（水平/垂直）
     * - 根据拖拽方向确定拖拽组（推动效果）
     * - 创建和更新拖拽虚影的位置
     * - 实现轴向约束（水平拖拽时固定Y轴，垂直拖拽时固定X轴）
     */
    private onTouchMove(event: EventTouch): void {
        if (!this.callbacks || !this.dragStartPos) return;
        
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
            this.dragGroup = this.callbacks.findDragGroupForSpecificDirection(this.dragStartPos.row, this.dragStartPos.col, specificDirection);
            console.log('更新后的拖动组:', this.dragGroup);
            
            // 创建拖动组的虚影
            this.callbacks.createDragGroupShadows(worldPos, this.dragStartPos, this.dragGroup);
        }
        
        // 如果正在拖拽，更新虚影位置
        if (this.isDragging) {
            this.callbacks.updateDragGroupShadowsPosition(worldPos, this.dragDirection);
        }
        
        // 更新拖拽结束位置
        this.dragEndPos = { x: touchPos.x, y: touchPos.y };
    }
    
    /**
     * 触摸结束事件处理
     * （从GameManager.onTouchEnd()完全迁移）
     * 
     * 功能：
     * - 判断是点击还是拖拽操作
     * - 点击：执行麻将选择和消除逻辑
     * - 拖拽：计算目标位置并执行移动
     * - 清理拖拽状态和虚影节点
     */
    private onTouchEnd(event: EventTouch): void {
        if (!this.callbacks) return;
        
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
        
        this.callbacks.clearDragStates();
        
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
                this.callbacks.onTileClick(dragStartPos.row, dragStartPos.col);
            } else {
                // 处理拖拽移动
                console.log('移动距离超过阈值，处理拖拽移动');
                const targetGridPos = this.callbacks.screenToGrid(new Vec2(touchPos.x, touchPos.y));
                console.log('目标网格位置:', targetGridPos);
                
                if (targetGridPos) {
                    const dragState = {
                        dragGroup: [...this.dragGroup],
                        dragDirection: this.dragDirection,
                        dragStartPos: dragStartPos
                    };
                    this.callbacks.onDragEnd(dragStartPos.row, dragStartPos.col, targetGridPos.row, targetGridPos.col, dragState);
                } else {
                    console.log('无法获取有效的目标网格位置');
                }
            }
        } else if (dragStartPos) {
            // 没有拖拽，当作点击处理
            console.log('没有进入拖拽状态，当作点击处理');
            this.callbacks.onTileClick(dragStartPos.row, dragStartPos.col);
        } else {
            console.log('没有拖拽起始位置，忽略');
        }
        
        this.resetDragState();
        console.log('=== 拖动结束处理完成 ===');
    }
}
