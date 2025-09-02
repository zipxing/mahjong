/**
 * 输入管理器
 * 负责处理触摸输入和点击事件
 */

import { Node, Vec3, input, Input, EventTouch, Camera, UITransform, find as ccFind } from 'cc';
import { BlockData } from './BoardManager';

export interface InputInterface {
    getBoardData(): BlockData[][];
    getBlockAt(row: number, col: number): BlockData | null;
    screenToGridPosition(screenPos: Vec3): {row: number, col: number};
    onBlockClick(row: number, col: number): void;
    isGameActive(): boolean;
}

export class InputManager {
    private inputInterface: InputInterface = null!;
    private isInputEnabled: boolean = true;
    
    // 触摸状态
    private isMouseDown: boolean = false;
    private lastClickTime: number = 0;
    private clickDelay: number = 100; // 防止重复点击的延迟（毫秒）
    
    // 高亮状态
    private highlightedBlocks: {row: number, col: number}[] = [];
    private isHighlightActive: boolean = false;
    
    /**
     * 初始化输入管理器
     */
    init(inputInterface: InputInterface) {
        this.inputInterface = inputInterface;
        this.setupInputEvents();
        
        console.log('✅ 输入管理器初始化完成');
    }
    
    /**
     * 设置输入事件监听
     */
    private setupInputEvents() {
        // 监听触摸开始
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        
        // 监听触摸结束
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        
        // 监听触摸移动（用于取消高亮）
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        
        // 监听鼠标点击（用于桌面端）
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        
        console.log('🎮 输入事件监听已设置');
    }
    
    /**
     * 触摸开始事件
     */
    private onTouchStart(event: EventTouch) {
        if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
        }
        
        this.isMouseDown = true;
        
        const touchPos = event.getUILocation();
        console.log(`📱 触摸UI坐标: (${touchPos.x}, ${touchPos.y})`);
        
        // 将UI坐标转换为世界坐标
        const worldPos = this.uiToWorldPosition(touchPos);
        console.log(`🌍 转换后世界坐标: (${worldPos.x}, ${worldPos.y})`);
        
        this.handlePointerDown(worldPos);
    }
    
    /**
     * 触摸结束事件
     */
    private onTouchEnd(event: EventTouch) {
        if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
        }
        
        this.isMouseDown = false;
        
        const touchPos = event.getUILocation();
        console.log(`📱 触摸UI坐标: (${touchPos.x}, ${touchPos.y})`);
        
        // 将UI坐标转换为世界坐标
        const worldPos = this.uiToWorldPosition(touchPos);
        console.log(`🌍 转换后世界坐标: (${worldPos.x}, ${worldPos.y})`);
        
        this.handlePointerUp(worldPos);
    }
    
    /**
     * 触摸移动事件
     */
    private onTouchMove(event: EventTouch) {
        if (!this.isInputEnabled || !this.inputInterface.isGameActive() || !this.isMouseDown) {
            return;
        }
        
        // 如果正在拖拽，清除高亮
        this.clearHighlight();
    }
    
    /**
     * 鼠标按下事件
     */
    private onMouseDown(event: EventTouch) {
        if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
        }
        
        this.isMouseDown = true;
        
        const mousePos = event.getUILocation();
        console.log(`🖱️ 鼠标UI坐标: (${mousePos.x}, ${mousePos.y})`);
        
        // 将UI坐标转换为世界坐标
        const worldPos = this.uiToWorldPosition(mousePos);
        console.log(`🌍 转换后世界坐标: (${worldPos.x}, ${worldPos.y})`);
        
        this.handlePointerDown(worldPos);
    }
    
    /**
     * 鼠标释放事件
     */
    private onMouseUp(event: EventTouch) {
        if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
        }
        
        this.isMouseDown = false;
        
        const mousePos = event.getUILocation();
        console.log(`🖱️ 鼠标UI坐标: (${mousePos.x}, ${mousePos.y})`);
        
        // 将UI坐标转换为世界坐标
        const worldPos = this.uiToWorldPosition(mousePos);
        console.log(`🌍 转换后世界坐标: (${worldPos.x}, ${worldPos.y})`);
        
        this.handlePointerUp(worldPos);
    }
    
    /**
     * 处理指针按下
     */
    private handlePointerDown(worldPos: Vec3) {
        console.log(`\n👆 ===== 指针按下事件 =====`);
        console.log(`📍 世界坐标: (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)})`);
        console.log(`🔍 调用来源跟踪:`);
        console.trace();
        
        const gridPos = this.inputInterface.screenToGridPosition(worldPos);
        console.log(`🎯 网格坐标: (${gridPos.row}, ${gridPos.col})`);
        
        const blockData = this.inputInterface.getBlockAt(gridPos.row, gridPos.col);
        console.log(`📦 方块数据:`, blockData);
        
        if (blockData && blockData.type !== -1) {
            console.log(`👆 按下方块: (${gridPos.row}, ${gridPos.col}), 类型: ${blockData.type}`);
            
            // 高亮连通区域作为预览
            this.highlightConnectedBlocks(gridPos.row, gridPos.col);
        } else {
            console.log(`❌ 按下了空位置或无效位置`);
        }
        console.log(`👆 ===== 指针按下事件结束 =====\n`);
    }
    
    /**
     * 处理指针释放
     */
    private handlePointerUp(worldPos: Vec3) {
        console.log(`\n👆 ===== 指针释放事件 =====`);
        console.log(`📍 世界坐标: (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)})`);
        
        // 防止重复点击
        const currentTime = Date.now();
        console.log(`⏰ 当前时间: ${currentTime}, 上次点击: ${this.lastClickTime}, 间隔: ${currentTime - this.lastClickTime}ms`);
        
        if (currentTime - this.lastClickTime < this.clickDelay) {
            console.log(`❌ 点击间隔太短，忽略此次点击 (< ${this.clickDelay}ms)`);
            return;
        }
        this.lastClickTime = currentTime;
        
        const gridPos = this.inputInterface.screenToGridPosition(worldPos);
        console.log(`🎯 网格坐标: (${gridPos.row}, ${gridPos.col})`);
        
        const blockData = this.inputInterface.getBlockAt(gridPos.row, gridPos.col);
        console.log(`📦 方块数据:`, blockData);
        
        if (blockData && blockData.type !== -1) {
            console.log(`👆 确认点击方块: (${gridPos.row}, ${gridPos.col}), 类型: ${blockData.type}`);
            
            // 清除高亮
            this.clearHighlight();
            
            // 执行点击回调
            console.log(`🔄 调用游戏逻辑处理点击...`);
            this.inputInterface.onBlockClick(gridPos.row, gridPos.col);
        } else {
            console.log(`👆 点击空位: (${gridPos.row}, ${gridPos.col})`);
            this.clearHighlight();
        }
        console.log(`👆 ===== 指针释放事件结束 =====\n`);
    }
    
    /**
     * 高亮连通的方块
     */
    private highlightConnectedBlocks(row: number, col: number) {
        // 清除之前的高亮
        this.clearHighlight();
        
        // 获取连通区域（简化版，实际应该调用EliminationManager）
        const connectedBlocks = this.findConnectedBlocks(row, col);
        
        if (connectedBlocks.length >= 2) {
            this.highlightedBlocks = connectedBlocks;
            this.isHighlightActive = true;
            
            // 实际的高亮逻辑应该通过回调接口实现
            console.log(`✨ 高亮 ${connectedBlocks.length} 个连通方块`);
        }
    }
    
    /**
     * 简化版连通区域查找（实际应该委托给EliminationManager）
     */
    private findConnectedBlocks(startRow: number, startCol: number): {row: number, col: number}[] {
        const boardData = this.inputInterface.getBoardData();
        const boardSize = boardData.length;
        
        if (!this.isValidPosition(startRow, startCol, boardSize) || 
            boardData[startRow][startCol].type === -1) {
            return [];
        }
        
        const targetType = boardData[startRow][startCol].type;
        const visited: boolean[][] = [];
        const connectedBlocks: {row: number, col: number}[] = [];
        
        // 初始化访问标记
        for (let i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
        }
        
        // BFS队列
        const queue: {row: number, col: number}[] = [{row: startRow, col: startCol}];
        visited[startRow][startCol] = true;
        connectedBlocks.push({row: startRow, col: startCol});
        
        // 四个方向
        const directions = [
            {dr: -1, dc: 0},  // 上
            {dr: 1, dc: 0},   // 下
            {dr: 0, dc: -1},  // 左
            {dr: 0, dc: 1}    // 右
        ];
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            
            for (const dir of directions) {
                const newRow = current.row + dir.dr;
                const newCol = current.col + dir.dc;
                
                if (!this.isValidPosition(newRow, newCol, boardSize) ||
                    visited[newRow][newCol] ||
                    boardData[newRow][newCol].type !== targetType) {
                    continue;
                }
                
                visited[newRow][newCol] = true;
                queue.push({row: newRow, col: newCol});
                connectedBlocks.push({row: newRow, col: newCol});
            }
        }
        
        return connectedBlocks;
    }
    
    /**
     * 检查位置是否有效
     */
    private isValidPosition(row: number, col: number, boardSize: number): boolean {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }
    
    /**
     * 清除高亮显示
     */
    private clearHighlight() {
        if (this.isHighlightActive) {
            console.log('🧹 清除方块高亮');
            this.highlightedBlocks = [];
            this.isHighlightActive = false;
        }
    }
    
    /**
     * UI坐标转换为世界坐标
     */
    private uiToWorldPosition(uiPos: {x: number, y: number}): Vec3 {
        // 获取Canvas节点
        const canvas = ccFind('Canvas');
        if (!canvas) {
            console.error('❌ 找不到Canvas节点');
            return new Vec3(uiPos.x, uiPos.y, 0);
        }
        
        // 获取Canvas的UITransform
        let canvasTransform = canvas.getComponent(UITransform);
        if (!canvasTransform) {
            console.warn('⚠️ Canvas没有UITransform组件，尝试添加...');
            canvasTransform = canvas.addComponent(UITransform);
            if (!canvasTransform) {
                console.error('❌ 无法为Canvas添加UITransform组件，使用默认坐标转换');
                // 使用竖屏尺寸作为后备方案
                const worldX = uiPos.x - 360;  // 假设720宽度，中心为360
                const worldY = (1280 - uiPos.y) - 640;  // 假设1280高度，Y轴翻转，中心为640
                console.log(`🔄 默认坐标转换(竖屏): UI(${uiPos.x}, ${uiPos.y}) -> World(${worldX}, ${worldY})`);
                return new Vec3(worldX, worldY, 0);
            }
        }
        
        // 检查Canvas尺寸，但优先使用编辑器设置
        let designSize = canvasTransform.contentSize;
        console.log(`📐 当前Canvas尺寸: ${designSize.width} x ${designSize.height}`);
        
        // 判断屏幕方向
        const isPortrait = designSize.height > designSize.width;
        console.log(`📱 屏幕方向: ${isPortrait ? '竖屏' : '横屏'}`);
        
        if (designSize.width === 100 && designSize.height === 100) {
            // 只有在默认尺寸时才自动设置，推荐在编辑器中手动设置
            console.log('🔧 检测到默认尺寸，建议在编辑器中设置Canvas为720x1280');
            console.log('📝 临时设置为竖屏分辨率...');
            canvasTransform.setContentSize(720, 1280);  // 竖屏：宽720，高1280
            designSize = canvasTransform.contentSize;  // 重新获取更新后的尺寸
            console.log('✅ Canvas尺寸已临时设置为 720 x 1280 (竖屏)');
        }
        
        console.log(`📐 最终Canvas设计尺寸: ${designSize.width} x ${designSize.height}`);
        
        // 将UI坐标转换为世界坐标（相对于Canvas中心）
        // 注意：Cocos Creator的UI坐标原点在左下角，世界坐标中心在Canvas中心
        // 但是鼠标/触摸坐标可能是从左上角开始的，需要Y轴翻转
        const worldX = uiPos.x - designSize.width / 2;
        
        // 检查Y轴方向：如果UI坐标很大（接近屏幕高度），说明是从上到下的坐标系
        let worldY;
        if (uiPos.y > designSize.height * 0.5) {
            // 可能是从左上角开始的坐标系，需要Y轴翻转
            worldY = (designSize.height - uiPos.y) - designSize.height / 2;
            console.log(`🔄 Y轴翻转模式: UI_Y=${uiPos.y} -> Flipped_Y=${designSize.height - uiPos.y} -> World_Y=${worldY.toFixed(1)}`);
        } else {
            // 正常的从左下角开始的坐标系
            worldY = uiPos.y - designSize.height / 2;
            console.log(`🔄 Y轴正常模式: UI_Y=${uiPos.y} -> World_Y=${worldY.toFixed(1)}`);
        }
        
        console.log(`🔄 最终坐标转换: UI(${uiPos.x}, ${uiPos.y}) -> World(${worldX}, ${worldY})`);
        
        return new Vec3(worldX, worldY, 0);
    }
    
    /**
     * 启用输入
     */
    enableInput() {
        this.isInputEnabled = true;
        console.log('✅ 输入已启用');
    }
    
    /**
     * 禁用输入
     */
    disableInput() {
        this.isInputEnabled = false;
        this.clearHighlight();
        console.log('❌ 输入已禁用');
    }
    
    /**
     * 获取当前高亮的方块
     */
    getHighlightedBlocks(): {row: number, col: number}[] {
        return [...this.highlightedBlocks];
    }
    
    /**
     * 检查是否有高亮显示
     */
    hasHighlight(): boolean {
        return this.isHighlightActive;
    }
    
    /**
     * 销毁输入管理器
     */
    destroy() {
        // 移除事件监听
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        
        // 清除状态
        this.clearHighlight();
        
        console.log('🗑️ 输入管理器已销毁');
    }
    
    /**
     * 调试：打印输入状态
     */
    debugPrintInputState() {
        console.log('🎮 输入状态:');
        console.log(`  输入启用: ${this.isInputEnabled}`);
        console.log(`  鼠标按下: ${this.isMouseDown}`);
        console.log(`  高亮激活: ${this.isHighlightActive}`);
        console.log(`  高亮方块数: ${this.highlightedBlocks.length}`);
    }
}
