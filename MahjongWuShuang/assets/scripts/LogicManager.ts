/**
 * 游戏逻辑管理器 - 负责所有核心游戏逻辑和移动管理
 * 
 * 主要职责:
 * - 消除判断和执行
 * - 移动验证和执行
 * - 拖拽组管理
 * - 移动历史和回退
 * - 胜利条件检查
 * 
 * @author Zipxing & Cursor
 * @version 1.0
 */

import { _decorator, Node, Vec3 } from 'cc';
const { ccclass } = _decorator;

// 麻将数据接口
interface TileData {
    type: number;
    symbol: string;
    id: string;
}

// 移动记录接口
interface MoveRecord {
    oldPositions: {row: number, col: number}[];
    newPositions: {row: number, col: number}[];
    tileData: (TileData | null)[];
    tileNodes: (Node | null)[];
    originalDragPosition: {row: number, col: number} | null;
}

// 拖拽状态由InputManager管理

// 外部依赖接口
interface LogicDependencies {
    boardManager: any; // BoardManager实例
    tileManager: any;  // TileManager实例
}

@ccclass('LogicManager')
export class LogicManager {
    
    // ==================== 依赖注入 ====================
    private deps: LogicDependencies | null = null;
    
    // ==================== 拖拽状态由InputManager管理 ====================
    
    // ==================== 移动历史 ====================
    private lastMoveRecord: MoveRecord | null = null;
    
    /**
     * 初始化逻辑管理器
     */
    init(dependencies: LogicDependencies): void {
        this.deps = dependencies;
        this.resetState();
    }
    
    /**
     * 重置所有状态
     */
    resetState(): void {
        this.lastMoveRecord = null;
    }
    
    // ==================== 消除逻辑 ====================
    
    /**
     * 检查两个麻将是否可以消除
     * （从GameManager.canEliminate()完全迁移）
     */
    canEliminate(r1: number, c1: number, r2: number, c2: number): boolean {
        if (!this.deps) return false;
        
        console.log(`--- 消除检查: (${r1},${c1}) vs (${r2},${c2}) ---`);
        
        const tile1 = this.deps.boardManager.getTileData(r1, c1);
        const tile2 = this.deps.boardManager.getTileData(r2, c2);
        
        console.log('麻将1:', tile1);
        console.log('麻将2:', tile2);
        
        if (!tile1 || !tile2 || (r1 === r2 && c1 === c2)) {
            console.log('基础检查失败：麻将不存在或位置相同');
            return false;
        }
        
        // 检查麻将类型是否相同
        if (tile1.type !== tile2.type) {
            console.log('麻将类型不同：', tile1.type, '!=', tile2.type);
            return false;
        }
        
        // 检查是否相邻或在同一直线上
        const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
        const isSameRowOrCol = r1 === r2 || c1 === c2;
        
        if (isAdjacent) {
            console.log('✅ 相邻消除成功');
            return true;
        }
        
        if (isSameRowOrCol) {
            const isPathClear = this.isPathClear(r1, c1, r2, c2);
            console.log(`直线路径检查: ${isPathClear ? '✅ 路径畅通' : '❌ 路径阻挡'}`);
            return isPathClear;
        }
        
        console.log('❌ 既不相邻也不在同一直线：消除失败');
        return false;
    }
    
    /**
     * 检查两点间的直线路径是否畅通
     * （从GameManager.isPathClear()完全迁移）
     */
    private isPathClear(r1: number, c1: number, r2: number, c2: number): boolean {
        if (!this.deps) return false;
        
        if (r1 === r2) {
            // 同一行：检查水平路径
            const startCol = Math.min(c1, c2) + 1;
            const endCol = Math.max(c1, c2) - 1;
            console.log(`检查水平路径: 行${r1}, 列${startCol}到${endCol}`);
            
            for (let col = startCol; col <= endCol; col++) {
                const tileAtPos = this.deps.boardManager.getTileData(r1, col);
                if (tileAtPos !== null) {
                    console.log(`❌ 水平路径阻挡在 (${r1}, ${col}):`, tileAtPos?.symbol);
                    return false;
                }
            }
            console.log('✅ 水平路径畅通');
            return true;
        } else if (c1 === c2) {
            // 同一列：检查垂直路径
            const startRow = Math.min(r1, r2) + 1;
            const endRow = Math.max(r1, r2) - 1;
            console.log(`检查垂直路径: 列${c1}, 行${startRow}到${endRow}`);
            
            for (let row = startRow; row <= endRow; row++) {
                const tileAtPos = this.deps.boardManager.getTileData(row, c1);
                if (tileAtPos !== null) {
                    console.log(`❌ 垂直路径阻挡在 (${row}, ${c1}):`, tileAtPos?.symbol);
                    return false;
                }
            }
            console.log('✅ 垂直路径畅通');
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取指定麻将的所有可消除选项
     * （从GameManager.getEliminableOptionsForTile()完全迁移）
     */
    getEliminableOptionsForTile(row: number, col: number): Array<{row1: number, col1: number, row2: number, col2: number}> {
        if (!this.deps) return [];
        
        const options: Array<{row1: number, col1: number, row2: number, col2: number}> = [];
        const boardSize = this.deps.boardManager.getBoardSize();
        
        // 遍历整个棋盘，找出所有可以与当前麻将消除的位置
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (r === row && c === col) continue; // 跳过自己
                
                if (this.canEliminate(row, col, r, c)) {
                    options.push({
                        row1: row,
                        col1: col,
                        row2: r,
                        col2: c
                    });
                }
            }
        }
        
        return options;
    }
    
    /**
     * 检查胜利条件
     * （从GameManager.checkWinCondition()完全迁移）
     */
    checkWinCondition(): boolean {
        if (!this.deps) return false;
        
        const hasRemainingTiles = this.deps.boardManager.hasRemainingTiles();
        if (!hasRemainingTiles) {
            setTimeout(() => {
                console.log('🎉 恭喜您获得胜利！所有麻将都已消除！');
            }, 500);
            return true;
        }
        return false;
    }
    
    // ==================== 拖拽管理由InputManager负责 ====================
    
    // ==================== 移动历史管理 ====================
    
    /**
     * 保存移动记录
     */
    saveLastMoveRecord(record: MoveRecord): void {
        this.lastMoveRecord = record;
    }
    
    /**
     * 获取最后的移动记录
     */
    getLastMoveRecord(): MoveRecord | null {
        return this.lastMoveRecord;
    }
    
    /**
     * 清除移动记录
     */
    clearLastMoveRecord(): void {
        this.lastMoveRecord = null;
    }
    
    // ==================== 移动逻辑 ====================
    
    /**
     * 根据具体拖拽方向查找拖动组
     * （从GameManager.findDragGroupForSpecificDirection()完全迁移）
     */
    findDragGroupForSpecificDirection(startRow: number, startCol: number, direction: 'left' | 'right' | 'up' | 'down'): {row: number, col: number}[] {
        if (!this.deps) return [];
        
        const group: {row: number, col: number}[] = [{ row: startRow, col: startCol }];
        const boardSize = this.deps.boardManager.getBoardSize();
        
        console.log(`查找拖动组: 起点(${startRow}, ${startCol}), 方向: ${direction}`);
        
        switch (direction) {
            case 'left':
                // 往左拖拽：带动左边的连续麻将（推动效果）
                for (let c = startCol - 1; c >= 0; c--) {
                    if (this.deps.boardManager.getTileData(startRow, c) !== null) {
                        group.unshift({ row: startRow, col: c }); // 添加到前面
                        console.log(`往左拖拽，添加左边麻将: (${startRow}, ${c})`);
                    } else {
                        break;
                    }
                }
                break;
                
            case 'right':
                // 往右拖拽：带动右边的连续麻将（推动效果）
                for (let c = startCol + 1; c < boardSize; c++) {
                    if (this.deps.boardManager.getTileData(startRow, c) !== null) {
                        group.push({ row: startRow, col: c });
                        console.log(`往右拖拽，添加右边麻将: (${startRow}, ${c})`);
                    } else {
                        break;
                    }
                }
                break;
                
            case 'up':
                // 往上拖拽：推动下边的连续麻将向上移动（推动效果）
                for (let r = startRow + 1; r < boardSize; r++) {
                    if (this.deps.boardManager.getTileData(r, startCol) !== null) {
                        group.push({ row: r, col: startCol });
                        console.log(`往上拖拽，添加下边麻将: (${r}, ${startCol})`);
                    } else {
                        break;
                    }
                }
                break;
                
            case 'down':
                // 往下拖拽：推动上边的连续麻将向下移动（推动效果）
                for (let r = startRow - 1; r >= 0; r--) {
                    if (this.deps.boardManager.getTileData(r, startCol) !== null) {
                        group.unshift({ row: r, col: startCol }); // 添加到前面
                        console.log(`往下拖拽，添加上边麻将: (${r}, ${startCol})`);
                    } else {
                        break;
                    }
                }
                break;
        }
        
        console.log(`拖动组确定: ${group.length}个麻将 =>`, group);
        return group;
    }
    
    /**
     * 检查单个麻将的移动路径
     * （从GameManager.checkSingleTileMovePath()完全迁移）
     */
    checkSingleTileMovePath(row: number, col: number, direction: string, steps: number, dragGroup: {row: number, col: number}[]): boolean {
        if (!this.deps) return false;
        
        const boardSize = this.deps.boardManager.getBoardSize();
        
        console.log(`检查单个麻将移动路径: (${row}, ${col}) ${direction} ${steps}步`);
        
        // 根据方向计算路径上的所有位置
        for (let step = 1; step <= steps; step++) {
            let checkRow = row;
            let checkCol = col;
            
            switch (direction) {
                case 'left':
                    checkCol = col - step;
                    break;
                case 'right':
                    checkCol = col + step;
                    break;
                case 'up':
                    checkRow = row - step;
                    break;
                case 'down':
                    checkRow = row + step;
                    break;
                default:
                    console.log(`未知移动方向: ${direction}`);
                    return false;
            }
            
            // 检查是否超出棋盘边界
            if (checkRow < 0 || checkRow >= boardSize || checkCol < 0 || checkCol >= boardSize) {
                console.log(`  ❌ 路径超出边界: (${checkRow}, ${checkCol})`);
                return false;
            }
            
            // 检查路径上是否有障碍物
            const obstacleTile = this.deps.boardManager.getTileData(checkRow, checkCol);
            if (obstacleTile !== null) {
                // 检查这个位置的麻将是否属于当前拖动组
                const isInDragGroup = dragGroup.some(tile => tile.row === checkRow && tile.col === checkCol);
                
                if (!isInDragGroup) {
                    console.log(`  ❌ 路径被阻挡: (${checkRow}, ${checkCol}) 有其他麻将 ${obstacleTile?.symbol}`);
                    return false;
                }
            }
        }
        
        console.log(`  ✅ 路径畅通: (${row}, ${col}) ${direction} ${steps}步`);
        return true;
    }
    
    /**
     * 计算新位置
     * （从GameManager.calculateNewPositions()完全迁移）
     */
    calculateNewPositions(dragGroup: {row: number, col: number}[], direction: string, steps: number): {row: number, col: number}[] {
        const newPositions: {row: number, col: number}[] = [];
        const boardSize = this.deps?.boardManager.getBoardSize() || 8;
        
        dragGroup.forEach(tile => {
            let newRow = tile.row;
            let newCol = tile.col;
            
            switch (direction) {
                case 'left':
                    newCol = Math.max(0, tile.col - steps);
                    break;
                case 'right':
                    newCol = Math.min(boardSize - 1, tile.col + steps);
                    break;
                case 'up':
                    newRow = Math.max(0, tile.row - steps);
                    break;
                case 'down':
                    newRow = Math.min(boardSize - 1, tile.row + steps);
                    break;
            }
            
            newPositions.push({ row: newRow, col: newCol });
        });
        
        return newPositions;
    }
    
    /**
     * 检查位置冲突
     * （从GameManager.checkPositionConflicts()完全迁移）
     */
    checkPositionConflicts(newPositions: {row: number, col: number}[]): boolean {
        if (!this.deps) return true;
        
        for (const pos of newPositions) {
            const boardSize = this.deps.boardManager.getBoardSize();
            
            // 检查是否超出边界
            if (pos.row < 0 || pos.row >= boardSize || pos.col < 0 || pos.col >= boardSize) {
                console.log(`位置超出边界: (${pos.row}, ${pos.col})`);
                return true;
            }
            
            // 检查目标位置是否被非拖动组的麻将占据
            const existingTile = this.deps.boardManager.getTileData(pos.row, pos.col);
            if (existingTile !== null) {
                // 检查这个位置是否在当前拖动组的新位置中（允许组内交换）
                const isInNewPositions = newPositions.some(newPos => 
                    newPos.row === pos.row && newPos.col === pos.col
                );
                
                if (!isInNewPositions) {
                    console.log(`位置冲突: (${pos.row}, ${pos.col}) 已被占据`);
                    return true;
                }
            }
        }
        
        return false;
    }
}
