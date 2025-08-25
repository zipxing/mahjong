/**
 * 棋盘管理器
 * 
 * 职责：
 * - 棋盘数据结构管理
 * - 坐标系统转换（屏幕坐标 ↔ 网格坐标 ↔ 世界坐标）
 * - 棋盘边界检查
 * - 麻将数据的存取
 */

import { _decorator, Node, Vec3, Vec2, UITransform } from 'cc';
const { ccclass } = _decorator;

// 麻将数据接口（从GameManager复制）
interface TileData {
    type: number;
    symbol: string;
    id: string;
}

@ccclass('BoardManager')
export class BoardManager {
    
    // ==================== 棋盘配置 ====================
    private boardSize: number = 8;  // 棋盘大小：8x8网格
    private tileSize: number = 80;  // 麻将大小：80x80像素
    private tileGap: number = 5;    // 麻将间距：5像素
    
    // ==================== 棋盘数据 ====================
    private board: (TileData | null)[][] = [];  // 棋盘数据：二维数组存储麻将信息
    private tileNodes: (Node | null)[][] = [];  // 麻将节点：二维数组存储UI节点引用
    
    // ==================== 组件引用 ====================
    private gameBoardNode: Node = null!;  // 游戏棋盘根节点
    
    /**
     * 初始化棋盘管理器
     */
    init(gameBoardNode: Node) {
        this.gameBoardNode = gameBoardNode;
        this.createEmptyBoard();
    }
    
    /**
     * 创建空白棋盘
     * （从GameManager.createEmptyBoard()直接复制）
     */
    private createEmptyBoard() {
        this.board = [];
        this.tileNodes = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            this.tileNodes[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = null;
                this.tileNodes[row][col] = null;
            }
        }
    }
    
    /**
     * 将屏幕触摸坐标转换为棋盘网格坐标
     * （从GameManager.screenToGrid()直接复制）
     * 
     * 坐标系统说明：
     * - 屏幕坐标：触摸事件提供的像素坐标（原点在屏幕左上角）
     * - 世界坐标：Cocos Creator的世界坐标系（原点在屏幕中心）
     * - 网格坐标：游戏逻辑使用的行列坐标（原点在棋盘左上角）
     * 
     * 转换流程：
     * 1. 屏幕坐标 → 世界坐标（通过UITransform转换）
     * 2. 世界坐标 → 棋盘本地坐标（减去棋盘节点的世界位置）
     * 3. 棋盘本地坐标 → 网格坐标（除以格子大小并取整）
     * 
     * @param screenPos 屏幕触摸坐标
     * @returns 网格坐标 {row, col}，如果超出范围则返回null
     */
    screenToGrid(screenPos: Vec2): { row: number, col: number } | null {
        console.log('--- BoardManager坐标转换开始（以棋盘左上角为原点）---');
        console.log('1. 原始触摸坐标:', screenPos);
        
        if (!this.gameBoardNode) {
            console.error('GameBoard节点未设置');
            return null;
        }
        
        // 将触摸坐标转换为GameBoard节点的本地坐标
        const gameBoardTransform = this.gameBoardNode.getComponent(UITransform);
        if (!gameBoardTransform) {
            console.error('无法获取GameBoard的UITransform');
            return null;
        }
        
        const worldPos = new Vec3(screenPos.x, screenPos.y, 0);
        const localPos = gameBoardTransform.convertToNodeSpaceAR(worldPos);
        console.log('2. GameBoard本地坐标:', localPos);
        
        // 计算棋盘的实际尺寸和左上角位置
        const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        
        // 棋盘左上角在GameBoard本地坐标系中的位置
        const boardLeftTopX = -boardWidth / 2;
        const boardLeftTopY = boardHeight / 2;
        
        console.log('3. 棋盘信息:', { 
            boardWidth, 
            boardHeight, 
            boardLeftTopX, 
            boardLeftTopY,
            tileSize: this.tileSize,
            tileGap: this.tileGap
        });
        
        // 计算相对于棋盘左上角的偏移（以左上角为原点的坐标系）
        const offsetX = localPos.x - boardLeftTopX;  // 从左到右为正
        const offsetY = boardLeftTopY - localPos.y;  // 从上到下为正
        
        console.log('4. 相对于棋盘左上角的偏移:', { offsetX, offsetY });
        
        // 检查是否在棋盘范围内
        if (offsetX < 0 || offsetY < 0 || offsetX > boardWidth || offsetY > boardHeight) {
            console.log('5. 触摸点在棋盘外');
            return null;
        }
        
        // 计算网格位置（每个格子包含麻将+间隙）
        const cellWidth = this.tileSize + this.tileGap;
        const cellHeight = this.tileSize + this.tileGap;
        
        const col = Math.floor(offsetX / cellWidth);
        const row = Math.floor(offsetY / cellHeight);
        
        console.log('5. 网格计算:', { 
            cellWidth, 
            cellHeight, 
            rawCol: offsetX / cellWidth, 
            rawRow: offsetY / cellHeight,
            col, 
            row
        });
        
        // 验证网格位置有效性
        const isValid = row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
        console.log('6. 有效性检查:', { row, col, boardSize: this.boardSize, isValid });
        
        if (isValid) {
            console.log('--- BoardManager坐标转换成功 ---');
            return { row, col };
        }
        
        console.log('--- BoardManager坐标转换失败：网格位置无效 ---');
        return null;
    }
    
    /**
     * 将网格坐标转换为GameBoard的本地坐标
     * （从GameManager中提取相关逻辑）
     */
    gridToWorld(row: number, col: number): Vec3 {
        if (!this.gameBoardNode) {
            console.error('GameBoard节点未设置');
            return Vec3.ZERO;
        }
        
        // 计算相对于棋盘中心的偏移
        const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        
        // 网格单元大小
        const gridUnit = this.tileSize + this.tileGap;
        
        // 计算相对于棋盘左上角的位置
        const localX = col * gridUnit + this.tileSize / 2;
        const localY = row * gridUnit + this.tileSize / 2;
        
        // 转换为相对于棋盘中心的坐标（本地坐标）
        const offsetX = localX - boardWidth / 2;
        const offsetY = boardHeight / 2 - localY;  // Y轴翻转
        
        // 返回本地坐标（相对于GameBoard节点）
        return new Vec3(offsetX, offsetY, 0);
    }
    
    // ==================== 数据访问方法 ====================
    
    /**
     * 检查位置是否有效
     */
    isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    /**
     * 获取指定位置的麻将数据
     */
    getTileData(row: number, col: number): TileData | null {
        if (!this.isValidPosition(row, col)) return null;
        return this.board[row][col];
    }
    
    /**
     * 设置指定位置的麻将数据
     */
    setTileData(row: number, col: number, data: TileData | null): void {
        if (!this.isValidPosition(row, col)) return;
        this.board[row][col] = data;
    }
    
    /**
     * 获取指定位置的麻将节点
     */
    getTileNode(row: number, col: number): Node | null {
        if (!this.isValidPosition(row, col)) return null;
        return this.tileNodes[row][col];
    }
    
    /**
     * 设置指定位置的麻将节点
     */
    setTileNode(row: number, col: number, node: Node | null): void {
        if (!this.isValidPosition(row, col)) return;
        this.tileNodes[row][col] = node;
    }
    
    /**
     * 清除指定位置的数据和节点
     */
    clearPosition(row: number, col: number): void {
        if (!this.isValidPosition(row, col)) return;
        this.board[row][col] = null;
        this.tileNodes[row][col] = null;
    }
    
    /**
     * 移动麻将（数据和节点）
     */
    moveTile(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
        if (!this.isValidPosition(fromRow, fromCol) || !this.isValidPosition(toRow, toCol)) return;
        
        // 移动数据
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // 移动节点引用
        this.tileNodes[toRow][toCol] = this.tileNodes[fromRow][fromCol];
        this.tileNodes[fromRow][fromCol] = null;
    }
    
    // ==================== Getter方法 ====================
    
    getBoardSize(): number {
        return this.boardSize;
    }
    
    getTileSize(): number {
        return this.tileSize;
    }
    
    getTileGap(): number {
        return this.tileGap;
    }
    
    /**
     * 检查棋盘上是否还有剩余的麻将
     */
    hasRemainingTiles(): boolean {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== null) {
                    return true;
                }
            }
        }
        return false;
    }
    
    getBoard(): (TileData | null)[][] {
        return this.board;
    }
    
    getTileNodes(): (Node | null)[][] {
        return this.tileNodes;
    }

    /**
     * 清空棋盘 - 归还所有节点到ShadowPool
     */
    private clearBoard(shadowPool?: any) {
        let returnedNodes = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const node = this.tileNodes[row][col];
                if (node && shadowPool) {
                    // 归还清晰麻将到对象池
                    shadowPool.returnClearTileToPool(node);
                    returnedNodes++;
                }
                
                this.board[row][col] = null;
                this.tileNodes[row][col] = null;
            }
        }
        
        if (returnedNodes > 0) {
            console.log(`🧹 清空棋盘：归还了 ${returnedNodes} 个节点到ShadowPool`);
        }
    }

    /**
     * 生成配对麻将 - 从ShadowPool获取清晰麻将节点
     * （从GameManager.generateSimplePairs()迁移并优化）
     * 
     * @param tileManager TileManager实例，用于获取麻将类型
     * @param shadowPool ShadowPool实例，用于获取清晰麻将节点
     */
    generateSimplePairs(tileManager: any, shadowPool?: any): void {
        // 清空现有棋盘数据和节点
        if (shadowPool) {
            this.clearBoard(shadowPool);
        }
        const tiles: TileData[] = [];
        const totalTiles = this.boardSize * this.boardSize; // 64个位置
        
        // 计算每种类型的数量，确保总数为偶数且能被类型数整除
        const tilesPerType = Math.floor(totalTiles / tileManager.getTileTypes().length);
        const adjustedTilesPerType = tilesPerType % 2 === 0 ? tilesPerType : tilesPerType - 1;
        
        console.log(`🎲 ${this.boardSize}x${this.boardSize}棋盘，每种类型生成 ${adjustedTilesPerType} 个麻将`);
        
        // 为每种类型生成偶数个麻将数据
        const tileTypes = tileManager.getTileTypes();
        for (let i = 0; i < tileTypes.length; i++) {
            for (let j = 0; j < adjustedTilesPerType; j++) {
                tiles.push({
                    type: i,
                    symbol: tileTypes[i],
                    id: `${i}-${j}`
                });
            }
        }
        
        // 洗牌算法
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // 如果麻将数量不足，补充到总数
        while (tiles.length < totalTiles) {
            const randomType = Math.floor(Math.random() * tileTypes.length);
            tiles.push({
                type: randomType,
                symbol: tileTypes[randomType],
                id: `extra-${tiles.length}`
            });
        }
        
        // 再次洗牌确保随机性
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // 🆕 从ShadowPool获取清晰麻将节点并填充到棋盘（如果有ShadowPool）
        if (shadowPool) {
            this.fillBoardFromShadowPool(tiles, shadowPool);
        } else {
            // 传统方式：仅填充数据到棋盘
            this.fillBoardDataOnly(tiles);
        }
        
        console.log(`✅ 棋盘生成完成: ${tiles.length} 个数据`);
    }

    /**
     * 从ShadowPool获取清晰麻将节点并填充到棋盘
     */
    private fillBoardFromShadowPool(tiles: TileData[], shadowPool: any): void {
        let tileIndex = 0;
        let nodesCreated = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    const tileData = tiles[tileIndex++];
                    
                    // 🎯 从ShadowPool获取清晰麻将节点
                    const tileNode = shadowPool.getClearTileFromPool(tileData.type);
                    
                    if (tileNode) {
                        // 设置棋盘数据
                        this.board[row][col] = tileData;
                        this.tileNodes[row][col] = tileNode;
                        
                        // 设置节点的额外信息
                        (tileNode as any).tileData = tileData;
                        (tileNode as any).gridRow = row;
                        (tileNode as any).gridCol = col;
                        
                        // 先设置正确的父节点
                        if (tileNode.parent !== this.gameBoardNode) {
                            tileNode.setParent(this.gameBoardNode);
                        }
                        
                        // 然后设置节点位置（基于GameBoard坐标系）
                        const localPos = this.gridToWorld(row, col);
                        tileNode.setPosition(localPos);
                        
                        if (nodesCreated < 3) { // 只显示前3个节点的详细信息
                            console.log(`📍 ShadowPool节点 [${row},${col}] 位置设置为: ${localPos.x.toFixed(1)}, ${localPos.y.toFixed(1)}`);
                        }
                        nodesCreated++;
                    } else {
                        console.warn(`⚠️ 无法从ShadowPool获取类型 ${tileData.type} 的节点`);
                        // 退回到仅设置数据
                        this.board[row][col] = tileData;
                        this.tileNodes[row][col] = null;
                    }
                }
            }
        }
        
        console.log(`📦 从ShadowPool创建了 ${nodesCreated} 个清晰麻将节点`);
        
        // 🔍 调试：输出池状态
        if (shadowPool && shadowPool.getPoolStatus) {
            console.log(shadowPool.getPoolStatus());
        }
    }

    /**
     * 传统方式：仅填充数据到棋盘（不创建节点）
     */
    private fillBoardDataOnly(tiles: TileData[]): void {
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    // 直接设置到棋盘数据
                    this.board[row][col] = tiles[tileIndex++];
                    this.tileNodes[row][col] = null; // 节点由其他地方创建
                }
            }
        }
        
        console.log(`📋 填充了 ${tiles.length} 个麻将数据（无节点创建）`);
    }

    /**
     * 渲染棋盘
     * （从GameManager.renderBoard()迁移）
     * 
     * @param tileManager TileManager实例，用于创建麻将节点（仅在传统模式下使用）
     */
    renderBoard(tileManager: any): void {
        console.log('开始渲染棋盘...');
        
        if (!this.gameBoardNode) {
            console.error('GameBoard节点未设置，无法渲染');
            return;
        }
        
        // 🔍 检查是否已经有节点存在（来自ShadowPool）
        let existingNodes = 0;
        let missingNodes = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                const node = this.tileNodes[row][col];
                
                if (tile && node) {
                    existingNodes++;
                } else if (tile && !node) {
                    missingNodes++;
                }
            }
        }
        
        if (existingNodes > 0) {
            console.log(`✅ 发现 ${existingNodes} 个已存在的节点（来自ShadowPool），跳过重复创建`);
            
            if (missingNodes > 0) {
                console.warn(`⚠️ 发现 ${missingNodes} 个缺失节点，将使用传统方式创建`);
                this.renderMissingNodes(tileManager);
            }
            
            // 确保所有节点都添加到GameBoard
            this.ensureNodesInGameBoard();
            return;
        }
        
        // 传统模式：清空并重新创建所有节点
        console.log('🔄 使用传统模式渲染棋盘');
        this.gameBoardNode.removeAllChildren();
        this.renderAllNodesTraditionally(tileManager);
    }

    /**
     * 渲染缺失的节点（混合模式）
     */
    private renderMissingNodes(tileManager: any): void {
        let tilesCreated = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                const node = this.tileNodes[row][col];
                
                if (tile && !node) {
                    // 使用TileManager创建缺失的节点
                    const tileNode = tileManager.createTileNode(tile, this.gameBoardNode);
                    
                    // 设置位置
                    const worldPos = this.gridToWorld(row, col);
                    tileNode.setPosition(worldPos);
                    
                    // 存储网格坐标到节点
                    (tileNode as any).gridRow = row;
                    (tileNode as any).gridCol = col;
                    (tileNode as any).tileData = tile;
                    
                    // 设置到tileNodes数组
                    this.tileNodes[row][col] = tileNode;
                    tilesCreated++;
                }
            }
        }
        
        console.log(`🔧 补充创建了 ${tilesCreated} 个缺失节点`);
    }

    /**
     * 传统方式渲染所有节点
     */
    private renderAllNodesTraditionally(tileManager: any): void {
        let tilesCreated = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile) {
                    // 使用TileManager创建麻将节点
                    const tileNode = tileManager.createTileNode(tile, this.gameBoardNode);
                    
                    // 设置位置
                    const worldPos = this.gridToWorld(row, col);
                    tileNode.setPosition(worldPos);
                    
                    // 存储网格坐标到节点
                    (tileNode as any).gridRow = row;
                    (tileNode as any).gridCol = col;
                    (tileNode as any).tileData = tile;
                    
                    // 设置到tileNodes数组
                    this.tileNodes[row][col] = tileNode;
                    tilesCreated++;
                }
            }
        }
        
        console.log(`🔄 传统模式创建了 ${tilesCreated} 个麻将节点`);
    }

    /**
     * 确保所有节点都添加到GameBoard中，并重新设置正确位置
     */
    private ensureNodesInGameBoard(): void {
        let addedNodes = 0;
        let repositionedNodes = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const node = this.tileNodes[row][col];
                if (node) {
                    // 检查是否需要改变父节点
                    if (node.parent !== this.gameBoardNode) {
                        node.setParent(this.gameBoardNode);
                        addedNodes++;
                    }
                    
                    // 重新设置位置（使用GameBoard的坐标系）
                    const worldPos = this.gridToWorld(row, col);
                    const currentPos = node.getPosition();
                    
                    // 只有位置不对时才重新设置
                    if (Math.abs(currentPos.x - worldPos.x) > 1 || 
                        Math.abs(currentPos.y - worldPos.y) > 1) {
                        node.setPosition(worldPos);
                        repositionedNodes++;
                        console.log(`📍 重新定位节点 [${row},${col}]: ${currentPos.x.toFixed(1)},${currentPos.y.toFixed(1)} → ${worldPos.x.toFixed(1)},${worldPos.y.toFixed(1)}`);
                    }
                }
            }
        }
        
        if (addedNodes > 0) {
            console.log(`🔗 将 ${addedNodes} 个节点添加到GameBoard`);
        }
        if (repositionedNodes > 0) {
            console.log(`📍 重新定位了 ${repositionedNodes} 个节点`);
        }
    }
    
    // ==================== Setter方法 ====================
    
    setBoard(board: (TileData | null)[][]): void {
        this.board = board;
    }
    
    setTileNodes(tileNodes: (Node | null)[][]): void {
        this.tileNodes = tileNodes;
    }
}
