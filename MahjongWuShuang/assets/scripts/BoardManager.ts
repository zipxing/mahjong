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
     * 将网格坐标转换为世界坐标
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
        
        // 转换为相对于棋盘中心的坐标
        const offsetX = localX - boardWidth / 2;
        const offsetY = boardHeight / 2 - localY;  // Y轴翻转
        
        // 获取棋盘的世界位置
        const gameBoardWorldPos = this.gameBoardNode.getWorldPosition();
        
        // 计算最终的世界坐标
        return new Vec3(
            gameBoardWorldPos.x + offsetX,
            gameBoardWorldPos.y + offsetY,
            gameBoardWorldPos.z
        );
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
    
    // ==================== Setter方法 ====================
    
    setBoard(board: (TileData | null)[][]): void {
        this.board = board;
    }
    
    setTileNodes(tileNodes: (Node | null)[][]): void {
        this.tileNodes = tileNodes;
    }
}
