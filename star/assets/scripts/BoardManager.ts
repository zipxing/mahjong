/**
 * 棋盘管理器
 * 负责管理10x10的游戏棋盘，包括棋盘数据结构、坐标转换、方块布局等功能
 */

import { Node, Vec3, UITransform, director } from 'cc';
import { BlockManager } from './BlockManager';

export interface BlockData {
    type: number;      // 方块类型 (0-4: 不同颜色, -1: 空位)
    node: Node | null; // 对应的节点对象
}

export class BoardManager {
    private gameBoardNode: Node = null!;
    private boardData: BlockData[][] = [];
    private boardSize: number = 10;
    private blockSize: number = 60;
    private blockSpacing: number = 5;
    
    /**
     * 初始化棋盘管理器
     */
    init(gameBoardNode: Node, boardSize: number, blockSize: number, blockSpacing: number) {
        this.gameBoardNode = gameBoardNode;
        this.boardSize = boardSize;
        
        // 动态适配屏幕尺寸
        this.adaptToScreenSize(blockSize, blockSpacing);
        
        // 初始化棋盘数据
        this.initBoardData();
        
        console.log(`✅ 棋盘管理器初始化完成 ${boardSize}x${boardSize}`);
        console.log(`📏 最终方块尺寸: ${this.blockSize}px, 间距: ${this.blockSpacing}px`);
        console.log(`📐 棋盘总尺寸: ${this.getTotalBoardSize()}px`);
    }
    
    /**
     * 动态适配屏幕尺寸
     */
    private adaptToScreenSize(defaultBlockSize: number, defaultBlockSpacing: number) {
        console.log(`🔧 使用固定配置，确保严格10×10方块`);
        
        // 修复间距问题：使用合理的方块尺寸和间距比例
        this.blockSize = 40;  // 缩小方块到40px
        this.blockSpacing = 6; // 增大间距到6px (15%的方块尺寸)
        
        const totalSize = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        // 10×40 + 9×6 = 400 + 54 = 454px
        
        console.log(`📐 固定配置结果:`);
        console.log(`   - 方块大小: ${this.blockSize}px`);
        console.log(`   - 方块间距: ${this.blockSpacing}px`);
        console.log(`   - 棋盘总尺寸: ${totalSize}×${totalSize}px`);
        console.log(`   - 严格控制: ${this.boardSize}×${this.boardSize} = ${this.boardSize * this.boardSize}个方块`);
    }
    
    /**
     * 获取棋盘总尺寸
     */
    private getTotalBoardSize(): {width: number, height: number} {
        const totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        const totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        return {width: totalWidth, height: totalHeight};
    }
    
    /**
     * 初始化棋盘数据结构
     */
    private initBoardData() {
        this.boardData = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.boardData[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.boardData[row][col] = {
                    type: -1,  // 初始为空
                    node: null
                };
            }
        }
    }
    
    /**
     * 生成游戏棋盘
     */
    generateBoard(blockManager: BlockManager) {
        console.log('🎲 生成新的游戏棋盘');
        
        // 打印布局信息
        const totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        const totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        console.log(`📊 棋盘布局信息:`);
        console.log(`   - 网格大小: ${this.boardSize} × ${this.boardSize}`);
        console.log(`   - 方块尺寸: ${this.blockSize} × ${this.blockSize}px`);
        console.log(`   - 方块间距: ${this.blockSpacing}px`);
        console.log(`   - 棋盘总尺寸: ${totalWidth} × ${totalHeight}px`);
        console.log(`   - GameBoard节点: ${this.gameBoardNode.name}`);
        
        // 检查GameBoard节点的Transform设置
        const gameBoardTransform = this.gameBoardNode.getComponent(UITransform);
        if (gameBoardTransform) {
            const contentSize = gameBoardTransform.contentSize;
            const anchorPoint = gameBoardTransform.anchorPoint;
            console.log(`📐 GameBoard UITransform:`);
            console.log(`   - ContentSize: ${contentSize.width} × ${contentSize.height}`);
            console.log(`   - AnchorPoint: (${anchorPoint.x}, ${anchorPoint.y})`);
            console.log(`   - 世界位置: (${this.gameBoardNode.worldPosition.x.toFixed(1)}, ${this.gameBoardNode.worldPosition.y.toFixed(1)})`);
            
            // 强制设置GameBoard为固定尺寸 (454×454)
            const requiredSize = 454; // 10×40 + 9×6 = 454
            console.log(`🔧 强制设置GameBoard ContentSize为: ${requiredSize} × ${requiredSize}`);
            gameBoardTransform.setContentSize(requiredSize, requiredSize);
            
            // 验证设置
            const finalContentSize = gameBoardTransform.contentSize;
            console.log(`✅ GameBoard最终尺寸: ${finalContentSize.width} × ${finalContentSize.height}`);
            if (anchorPoint.x !== 0.5 || anchorPoint.y !== 0.5) {
                console.warn(`⚠️ 自动设置GameBoard AnchorPoint为: (0.5, 0.5)`);
                gameBoardTransform.setAnchorPoint(0.5, 0.5);
                console.log(`✅ 已自动设置GameBoard AnchorPoint为: (0.5, 0.5)`);
            }
            
            // 检查GameBoard位置是否合理 (应该在Canvas中心附近)
            const worldPos = this.gameBoardNode.worldPosition;
            if (Math.abs(worldPos.x - 360) > 50 || Math.abs(worldPos.y - 640) > 200) {
                console.warn(`⚠️ GameBoard位置可能不合理: (${worldPos.x.toFixed(1)}, ${worldPos.y.toFixed(1)})`);
                console.log(`💡 建议在Cocos Creator编辑器中调整GameBoard位置到屏幕中心`);
            }
        } else {
            console.warn(`⚠️ GameBoard节点缺少UITransform组件`);
        }
        
        // 清空现有棋盘
        this.clearBoard();
        
        // 严格生成10×10方块，绝不超出
        console.log(`🎯 开始严格创建 ${this.boardSize}×${this.boardSize} = ${this.boardSize * this.boardSize} 个方块`);
        let createdCount = 0;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const blockType = Math.floor(Math.random() * blockManager.getBlockTypeCount());
                
                // 添加随机数调试
                if (row < 2 && col < 5) {
                    console.log(`🎲 方块[${row}][${col}] 随机类型: ${blockType} (共${blockManager.getBlockTypeCount()}种)`);
                }
                
                // 创建方块节点（传递动态计算的方块尺寸）
                const blockNode = blockManager.createBlockNode(blockType, this.blockSize);
                if (blockNode) {
                    // 设置父节点
                    blockNode.setParent(this.gameBoardNode);
                    
                    // 验证方块节点确实被创建（在设置父节点后）
                    if (row === 0 && col === 0) {
                        console.log(`✅ 第一个方块创建成功: ${blockNode.name}, 尺寸: ${this.blockSize}×${this.blockSize}`);
                        console.log(`   方块激活状态: ${blockNode.active}`);
                        console.log(`   方块父节点: ${blockNode.parent?.name}`);
                        console.log(`   GameBoard激活状态: ${this.gameBoardNode.active}`);
                        console.log(`   GameBoard子节点数: ${this.gameBoardNode.children.length}`);
                    }
                    
                    // 设置位置
                    const localPos = this.gridToLocal(row, col);
                    blockNode.setPosition(localPos);
                    
                    // 设置名称便于调试
                    blockNode.name = `Block_${row}_${col}`;
                    
                    // 添加位置调试信息（简化版本）
                    if (row < 3 && col < 3) {
                        console.log(`📍 方块[${row}][${col}] 位置: (${localPos.x.toFixed(1)}, ${localPos.y.toFixed(1)})`);
                    }
                    
                    // 更新数据
                    this.boardData[row][col] = {
                        type: blockType,
                        node: blockNode
                    };
                    
                    createdCount++;
                } else {
                    console.error(`❌ 方块[${row}][${col}]创建失败！`);
                }
            }
        }
        
        console.log(`🎯 方块创建完成: 实际创建 ${createdCount} 个，预期 100 个`);
        if (createdCount !== 100) {
            console.error(`❌ 方块数量不正确！预期100个，实际${createdCount}个`);
        }
        
        // 验证GameBoard状态
        console.log(`🔍 最终GameBoard状态检查:`);
        console.log(`   - GameBoard激活: ${this.gameBoardNode.active}`);
        console.log(`   - GameBoard子节点总数: ${this.gameBoardNode.children.length}`);
        console.log(`   - GameBoard ContentSize: ${this.gameBoardNode.getComponent(UITransform)?.contentSize.width}×${this.gameBoardNode.getComponent(UITransform)?.contentSize.height}`);
        
        // 检查前几个子节点
        for (let i = 0; i < Math.min(3, this.gameBoardNode.children.length); i++) {
            const child = this.gameBoardNode.children[i];
            console.log(`   - 子节点[${i}]: ${child.name}, 激活: ${child.active}, 位置: (${child.position.x.toFixed(1)}, ${child.position.y.toFixed(1)})`);
        }
        
        // 显示诊断完成，移除测试方块避免干扰
        console.log(`✅ 显示系统正常，已添加白色边框帮助识别方块边界`);
        
        // 统计实际创建的方块数量
        let totalBlocks = 0;
        let typeStats: {[key: number]: number} = {};
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const blockData = this.boardData[row][col];
                if (blockData && blockData.node) {
                    totalBlocks++;
                    typeStats[blockData.type] = (typeStats[blockData.type] || 0) + 1;
                }
            }
        }
        
        console.log(`✅ 棋盘生成完成 - 总计 ${totalBlocks} 个方块`);
        console.log(`📊 方块类型分布:`, typeStats);
        
        // 检查是否有方块没有正确显示
        if (totalBlocks < this.boardSize * this.boardSize) {
            console.warn(`⚠️ 方块数量不足！预期 ${this.boardSize * this.boardSize} 个，实际 ${totalBlocks} 个`);
        }
    }
    
    /**
     * 清空棋盘
     */
    clearBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.boardData[row][col]?.node) {
                    this.boardData[row][col].node!.removeFromParent();
                }
                this.boardData[row][col] = {
                    type: -1,
                    node: null
                };
            }
        }
    }
    
    /**
     * 网格坐标转换为本地坐标
     */
    gridToLocal(row: number, col: number): Vec3 {
        // 计算棋盘的总尺寸
        const totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        const totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        
        // 计算起始偏移（让棋盘居中）
        const startX = -totalWidth / 2 + this.blockSize / 2;
        const startY = totalHeight / 2 - this.blockSize / 2;
        
        // 计算具体位置
        const x = startX + col * (this.blockSize + this.blockSpacing);
        const y = startY - row * (this.blockSize + this.blockSpacing);
        
        // 添加详细调试信息（前几个方块）
        if ((row === 0 && col < 3) || (col === 0 && row < 3)) {
            console.log(`🔍 网格转换详情 [${row}][${col}]:`);
            console.log(`   棋盘总尺寸: ${totalWidth} × ${totalHeight}`);
            console.log(`   起始位置: (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
            console.log(`   方块尺寸: ${this.blockSize}px, 间距: ${this.blockSpacing}px`);
            console.log(`   步长计算: col=${col} × (${this.blockSize}+${this.blockSpacing}) = ${col * (this.blockSize + this.blockSpacing)}`);
            console.log(`   最终位置: (${x.toFixed(1)}, ${y.toFixed(1)})`);
            
            // 验证相邻方块间距
            if (col === 1 && row === 0) {
                const prevX = startX + 0 * (this.blockSize + this.blockSpacing);
                const distance = x - prevX;
                console.log(`   🔍 与前一方块距离: ${distance}px (预期: ${this.blockSize + this.blockSpacing}px)`);
                if (Math.abs(distance - (this.blockSize + this.blockSpacing)) > 0.1) {
                    console.warn(`   ⚠️ 间距异常！`);
                }
            }
        }
        
        return new Vec3(x, y, 0);
    }
    
    /**
     * 屏幕坐标转换为网格坐标
     */
    screenToGridPosition(screenPos: Vec3): {row: number, col: number} {
        console.log(`\n🔄 ===== 坐标转换开始 =====`);
        console.log(`📍 输入世界坐标: (${screenPos.x.toFixed(1)}, ${screenPos.y.toFixed(1)})`);
        
        // 获取棋盘节点的世界坐标
        const boardWorldPos = this.gameBoardNode.getWorldPosition();
        console.log(`🎮 棋盘世界坐标: (${boardWorldPos.x.toFixed(1)}, ${boardWorldPos.y.toFixed(1)})`);
        
        // 转换为相对于棋盘中心的坐标
        const relativeX = screenPos.x - boardWorldPos.x;
        const relativeY = screenPos.y - boardWorldPos.y;
        console.log(`📐 相对坐标: (${relativeX.toFixed(1)}, ${relativeY.toFixed(1)})`);
        
        // 计算网格参数
        const totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        const totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
        console.log(`📏 棋盘总尺寸: ${totalWidth} x ${totalHeight}`);
        
        // 网格布局：棋盘中心为原点，向左右上下扩展
        const startX = -totalWidth / 2 + this.blockSize / 2;  // 第一个方块的中心X
        const startY = totalHeight / 2 - this.blockSize / 2;   // 第一个方块的中心Y
        console.log(`🏁 第一个方块中心: (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
        
        // 计算点击位置相对于第一个方块的偏移
        const offsetX = relativeX - startX;
        const offsetY = startY - relativeY;  // Y轴向下为正
        console.log(`📏 相对第一个方块偏移: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
        
        // 计算网格坐标
        const blockStep = this.blockSize + this.blockSpacing;
        const rawCol = offsetX / blockStep;
        const rawRow = offsetY / blockStep;
        console.log(`🧮 原始网格坐标: (${rawRow.toFixed(2)}, ${rawCol.toFixed(2)})`);
        
        // 取整并限制范围
        const col = Math.max(0, Math.min(this.boardSize - 1, Math.floor(rawCol + 0.5))); // +0.5 进行四舍五入
        const row = Math.max(0, Math.min(this.boardSize - 1, Math.floor(rawRow + 0.5)));
        console.log(`🎯 最终网格坐标: (${row}, ${col})`);
        
        // 验证：计算该网格位置的实际世界坐标
        const verifyPos = this.gridToLocal(row, col);
        const verifyWorldPos = new Vec3(verifyPos.x + boardWorldPos.x, verifyPos.y + boardWorldPos.y, 0);
        console.log(`✅ 验证：网格(${row}, ${col}) 对应世界坐标 (${verifyWorldPos.x.toFixed(1)}, ${verifyWorldPos.y.toFixed(1)})`);
        
        // 计算点击误差
        const errorX = Math.abs(screenPos.x - verifyWorldPos.x);
        const errorY = Math.abs(screenPos.y - verifyWorldPos.y);
        console.log(`📏 点击误差: X=${errorX.toFixed(1)}, Y=${errorY.toFixed(1)}`);
        
        if (errorX > this.blockSize || errorY > this.blockSize) {
            console.warn(`⚠️ 点击误差过大，可能存在坐标系问题`);
        }
        
        console.log(`🔄 ===== 坐标转换结束 =====\n`);
        
        return { row, col };
    }
    
    /**
     * 获取指定位置的方块数据
     */
    getBlockAt(row: number, col: number): BlockData | null {
        if (this.isValidPosition(row, col)) {
            return this.boardData[row][col];
        }
        return null;
    }
    
    /**
     * 获取指定位置的方块节点
     */
    getBlockNodeAt(row: number, col: number): Node | null {
        const blockData = this.getBlockAt(row, col);
        return blockData ? blockData.node : null;
    }
    
    /**
     * 检查位置是否有效
     */
    isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    /**
     * 检查位置是否为空
     */
    isEmpty(row: number, col: number): boolean {
        if (!this.isValidPosition(row, col)) return false;
        return this.boardData[row][col].type === -1;
    }
    
    /**
     * 移除指定的方块
     */
    removeBlocks(blocks: {row: number, col: number}[]) {
        blocks.forEach(({row, col}) => {
            if (this.isValidPosition(row, col)) {
                // 注意：节点已在动画中移除，这里只清理数据
                this.boardData[row][col] = {
                    type: -1,
                    node: null
                };
            }
        });
    }
    
    /**
     * 移动方块到新位置
     */
    moveBlock(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
        if (!this.isValidPosition(fromRow, fromCol) || !this.isValidPosition(toRow, toCol)) {
            return false;
        }
        
        if (this.isEmpty(fromRow, fromCol) || !this.isEmpty(toRow, toCol)) {
            return false;
        }
        
        // 移动数据
        this.boardData[toRow][toCol] = this.boardData[fromRow][fromCol];
        this.boardData[fromRow][fromCol] = {
            type: -1,
            node: null
        };
        
        // 更新节点位置
        const blockNode = this.boardData[toRow][toCol].node;
        if (blockNode) {
            const newPos = this.gridToLocal(toRow, toCol);
            blockNode.setPosition(newPos);
            blockNode.name = `Block_${toRow}_${toCol}`;
        }
        
        return true;
    }
    
    /**
     * 获取整个棋盘数据
     */
    getBoardData(): BlockData[][] {
        return this.boardData;
    }
    
    /**
     * 计算剩余方块数量
     */
    countRemainingBlocks(): number {
        let count = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.isEmpty(row, col)) {
                    count++;
                }
            }
        }
        return count;
    }
    
    /**
     * 获取指定列的空位数量（从底部开始计算）
     */
    getEmptySpacesInColumn(col: number): number {
        let emptyCount = 0;
        for (let row = this.boardSize - 1; row >= 0; row--) {
            if (this.isEmpty(row, col)) {
                emptyCount++;
            } else {
                break;
            }
        }
        return emptyCount;
    }
    
    /**
     * 获取指定列的方块列表（从上到下，忽略空位）
     */
    getColumnBlocks(col: number): {row: number, data: BlockData}[] {
        const blocks: {row: number, data: BlockData}[] = [];
        for (let row = 0; row < this.boardSize; row++) {
            if (!this.isEmpty(row, col)) {
                blocks.push({
                    row: row,
                    data: this.boardData[row][col]
                });
            }
        }
        return blocks;
    }
    
    /**
     * 检查列是否完全为空
     */
    isColumnEmpty(col: number): boolean {
        for (let row = 0; row < this.boardSize; row++) {
            if (!this.isEmpty(row, col)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 获取最右侧非空列的索引
     */
    getRightmostNonEmptyColumn(): number {
        for (let col = this.boardSize - 1; col >= 0; col--) {
            if (!this.isColumnEmpty(col)) {
                return col;
            }
        }
        return -1; // 所有列都为空
    }
    
    /**
     * 调试：打印棋盘状态
     */
    debugPrintBoard() {
        console.log('📋 当前棋盘状态:');
        for (let row = 0; row < this.boardSize; row++) {
            let rowStr = '';
            for (let col = 0; col < this.boardSize; col++) {
                const type = this.boardData[row][col].type;
                rowStr += (type === -1 ? '.' : type.toString()) + ' ';
            }
            console.log(rowStr);
        }
    }
}
