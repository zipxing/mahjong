/**
 * 消除管理器
 * 负责处理方块的连通区域检测和消除逻辑
 */

import { BlockData } from './BoardManager';

export class EliminationManager {
    
    /**
     * 初始化消除管理器
     */
    init() {
        console.log('✅ 消除管理器初始化完成');
    }
    
    /**
     * 查找从指定位置开始的连通同色方块
     * 使用广度优先搜索(BFS)算法
     */
    findConnectedBlocks(boardData: BlockData[][], startRow: number, startCol: number): {row: number, col: number}[] {
        console.log(`\n🔍 ===== BFS连通搜索开始 =====`);
        console.log(`🎯 起始位置: (${startRow}, ${startCol})`);
        
        const boardSize = boardData.length;
        console.log(`📏 棋盘大小: ${boardSize}x${boardSize}`);
        
        // 检查起始位置
        if (!this.isValidPosition(startRow, startCol, boardSize)) {
            console.log(`❌ 起始位置无效，超出棋盘范围`);
            return [];
        }
        
        if (boardData[startRow][startCol].type === -1) {
            console.log(`❌ 起始位置是空位，类型为 -1`);
            return [];
        }
        
        const targetType = boardData[startRow][startCol].type;
        console.log(`🎨 目标方块类型: ${targetType}`);
        
        const visited: boolean[][] = [];
        const connectedBlocks: {row: number, col: number}[] = [];
        
        // 初始化访问标记
        for (let i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
        }
        console.log(`✅ 访问标记数组初始化完成`);
        
        // BFS队列
        const queue: {row: number, col: number}[] = [{row: startRow, col: startCol}];
        visited[startRow][startCol] = true;
        connectedBlocks.push({row: startRow, col: startCol});
        console.log(`🚀 BFS队列初始化，起始方块已加入`);
        
        // 四个方向：上、下、左、右
        const directions = [
            {dr: -1, dc: 0},  // 上
            {dr: 1, dc: 0},   // 下
            {dr: 0, dc: -1},  // 左
            {dr: 0, dc: 1}    // 右
        ];
        
        let step = 0;
        while (queue.length > 0) {
            step++;
            const current = queue.shift()!;
            console.log(`🔄 步骤 ${step}: 处理方块 (${current.row}, ${current.col}), 队列剩余: ${queue.length}`);
            
            // 检查四个方向的邻接方块
            for (let i = 0; i < directions.length; i++) {
                const dir = directions[i];
                const dirName = ['上', '下', '左', '右'][i];
                const newRow = current.row + dir.dr;
                const newCol = current.col + dir.dc;
                
                console.log(`  👀 检查${dirName}方向: (${newRow}, ${newCol})`);
                
                // 检查位置有效性
                if (!this.isValidPosition(newRow, newCol, boardSize)) {
                    console.log(`    ❌ 位置无效，超出边界`);
                    continue;
                }
                
                // 检查是否已访问
                if (visited[newRow][newCol]) {
                    console.log(`    ❌ 已访问过`);
                    continue;
                }
                
                const neighborType = boardData[newRow][newCol].type;
                console.log(`    🎨 邻居方块类型: ${neighborType} (目标: ${targetType})`);
                
                // 检查是否为相同类型的方块
                if (neighborType === targetType) {
                    visited[newRow][newCol] = true;
                    queue.push({row: newRow, col: newCol});
                    connectedBlocks.push({row: newRow, col: newCol});
                    console.log(`    ✅ 匹配！加入连通区域，当前总数: ${connectedBlocks.length}`);
                } else {
                    console.log(`    ❌ 类型不匹配`);
                }
            }
        }
        
        console.log(`🔍 BFS搜索完成！找到 ${connectedBlocks.length} 个连通的类型 ${targetType} 方块:`);
        connectedBlocks.forEach((block, index) => {
            console.log(`  ${index + 1}. (${block.row}, ${block.col})`);
        });
        console.log(`🔍 ===== BFS连通搜索结束 =====\n`);
        
        return connectedBlocks;
    }
    
    /**
     * 检查位置是否有效
     */
    private isValidPosition(row: number, col: number, boardSize: number): boolean {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }
    
    /**
     * 检查是否还有可消除的连通区域（2个或以上相连的同色方块）
     */
    hasValidMoves(boardData: BlockData[][]): boolean {
        const boardSize = boardData.length;
        const visited: boolean[][] = [];
        
        // 初始化访问标记
        for (let i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
        }
        
        // 遍历整个棋盘
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // 跳过空位和已访问的位置
                if (boardData[row][col].type === -1 || visited[row][col]) {
                    continue;
                }
                
                // 查找连通区域
                const connectedBlocks = this.findConnectedBlocksWithVisited(
                    boardData, row, col, visited
                );
                
                // 如果找到2个或以上的连通方块，说明还有有效移动
                if (connectedBlocks.length >= 2) {
                    console.log(`✅ 找到有效移动: ${connectedBlocks.length} 个连通方块`);
                    return true;
                }
            }
        }
        
        console.log('❌ 没有找到有效移动');
        return false;
    }
    
    /**
     * 查找连通方块（带访问标记的版本，用于hasValidMoves）
     */
    private findConnectedBlocksWithVisited(
        boardData: BlockData[][], 
        startRow: number, 
        startCol: number,
        globalVisited: boolean[][]
    ): {row: number, col: number}[] {
        const boardSize = boardData.length;
        
        if (!this.isValidPosition(startRow, startCol, boardSize) || 
            boardData[startRow][startCol].type === -1 ||
            globalVisited[startRow][startCol]) {
            return [];
        }
        
        const targetType = boardData[startRow][startCol].type;
        const connectedBlocks: {row: number, col: number}[] = [];
        const queue: {row: number, col: number}[] = [{row: startRow, col: startCol}];
        
        globalVisited[startRow][startCol] = true;
        connectedBlocks.push({row: startRow, col: startCol});
        
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
                    globalVisited[newRow][newCol] ||
                    boardData[newRow][newCol].type !== targetType) {
                    continue;
                }
                
                globalVisited[newRow][newCol] = true;
                queue.push({row: newRow, col: newCol});
                connectedBlocks.push({row: newRow, col: newCol});
            }
        }
        
        return connectedBlocks;
    }
    
    /**
     * 高亮显示连通区域（用于预览）
     */
    highlightConnectedBlocks(
        boardData: BlockData[][], 
        startRow: number, 
        startCol: number,
        highlightCallback: (row: number, col: number, highlight: boolean) => void
    ): {row: number, col: number}[] {
        const connectedBlocks = this.findConnectedBlocks(boardData, startRow, startCol);
        
        // 只有2个或以上的方块才进行高亮
        if (connectedBlocks.length >= 2) {
            connectedBlocks.forEach(({row, col}) => {
                highlightCallback(row, col, true);
            });
        }
        
        return connectedBlocks;
    }
    
    /**
     * 清除高亮显示
     */
    clearHighlight(
        blocks: {row: number, col: number}[],
        highlightCallback: (row: number, col: number, highlight: boolean) => void
    ) {
        blocks.forEach(({row, col}) => {
            highlightCallback(row, col, false);
        });
    }
    
    /**
     * 获取棋盘上所有连通区域的统计信息
     */
    getConnectedRegionsStats(boardData: BlockData[][]): {
        totalRegions: number,
        validRegions: number,
        largestRegionSize: number,
        blockTypeDistribution: {[type: number]: number}
    } {
        const boardSize = boardData.length;
        const visited: boolean[][] = [];
        
        // 初始化访问标记
        for (let i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
        }
        
        let totalRegions = 0;
        let validRegions = 0;
        let largestRegionSize = 0;
        const blockTypeDistribution: {[type: number]: number} = {};
        
        // 遍历整个棋盘
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // 跳过空位和已访问的位置
                if (boardData[row][col].type === -1 || visited[row][col]) {
                    continue;
                }
                
                const blockType = boardData[row][col].type;
                
                // 查找连通区域
                const connectedBlocks = this.findConnectedBlocksWithVisited(
                    boardData, row, col, visited
                );
                
                if (connectedBlocks.length > 0) {
                    totalRegions++;
                    
                    if (connectedBlocks.length >= 2) {
                        validRegions++;
                    }
                    
                    largestRegionSize = Math.max(largestRegionSize, connectedBlocks.length);
                    
                    // 统计方块类型分布
                    if (!blockTypeDistribution[blockType]) {
                        blockTypeDistribution[blockType] = 0;
                    }
                    blockTypeDistribution[blockType] += connectedBlocks.length;
                }
            }
        }
        
        return {
            totalRegions,
            validRegions,
            largestRegionSize,
            blockTypeDistribution
        };
    }
    
    /**
     * 调试：打印连通区域信息
     */
    debugPrintConnectedRegions(boardData: BlockData[][]) {
        const stats = this.getConnectedRegionsStats(boardData);
        
        console.log('📊 连通区域统计:');
        console.log(`  总区域数: ${stats.totalRegions}`);
        console.log(`  可消除区域数: ${stats.validRegions}`);
        console.log(`  最大区域大小: ${stats.largestRegionSize}`);
        console.log(`  方块类型分布:`, stats.blockTypeDistribution);
    }
}
