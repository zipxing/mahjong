import { _decorator, Component, Node, Vec3, Color, Label, Sprite, UITransform, input, Input, EventTouch, Vec2, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 麻将连连看游戏管理器
 * 简化版本，专注核心功能
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    @property(Node)
    gameBoard: Node = null!;
    
    // 游戏配置
    private boardSize: number = 8;  // 8x8棋盘，完整版本
    private tileTypes: string[] = [
        '🀄', '🀅', '🀆', '🀇',  // 中、发、白、一万
        '🀈', '🀉', '🀊', '🀋'   // 二万、三万、四万、五万
    ];  // 8种麻将类型
    private tileSize: number = 70;  // 适当缩小以适应8x8
    private tileGap: number = 8;    // 调整间距
    
    // 游戏状态
    private board: (TileData | null)[][] = [];
    private tileNodes: (Node | null)[][] = [];
    private selectedTile: {row: number, col: number, node: Node} | null = null;
    private score: number = 0;
    
    // 高亮状态
    private highlightedTiles: Node[] = [];
    
    // 拖拽相关状态
    private isDragging: boolean = false;
    private dragStartPos: {row: number, col: number, worldPos: Vec3} | null = null;
    private dragEndPos: {x: number, y: number} | null = null;
    private dragGroup: {row: number, col: number}[] = [];
    private dragShadows: Node[] = [];
    private dragDirection: 'horizontal' | 'vertical' | null = null;
    
    // 移动历史记录（用于回退）
    private lastMoveRecord: {
        oldPositions: {row: number, col: number}[],
        newPositions: {row: number, col: number}[],
        tileData: (TileData | null)[],
        tileNodes: (Node | null)[]
    } | null = null;
    
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
     */
    private init() {
        console.log('开始初始化游戏...');
        
        if (!this.gameBoard) {
            console.error('GameBoard节点未设置！');
            return;
        }
        
        // 重置游戏状态
        this.selectedTile = null;
        this.score = 0;
        this.highlightedTiles = [];
        this.lastMoveRecord = null;
        console.log('游戏状态已重置');
        
        this.createBoard();
        this.generateSimplePairs();
        this.renderBoard();
        
        console.log('游戏初始化完成！');
    }
    
    /**
     * 创建空白棋盘
     */
    private createBoard() {
        this.board = [];
        this.tileNodes = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            this.tileNodes[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
                this.tileNodes[i][j] = null;
            }
        }
        console.log(`创建了 ${this.boardSize}x${this.boardSize} 的棋盘`);
    }
    
    /**
     * 生成配对麻将 - 确保每种类型都有偶数个
     */
    private generateSimplePairs() {
        const tiles: TileData[] = [];
        const totalTiles = this.boardSize * this.boardSize; // 64个位置
        
        // 计算每种类型的数量，确保总数为偶数且能被类型数整除
        const tilesPerType = Math.floor(totalTiles / this.tileTypes.length);
        const adjustedTilesPerType = tilesPerType % 2 === 0 ? tilesPerType : tilesPerType - 1;
        
        console.log(`8x8棋盘，每种类型生成 ${adjustedTilesPerType} 个麻将`);
        
        // 为每种类型生成偶数个麻将
        for (let i = 0; i < this.tileTypes.length; i++) {
            for (let j = 0; j < adjustedTilesPerType; j++) {
                tiles.push({
                    type: i,
                    symbol: this.tileTypes[i],
                    id: `${i}-${j}`
                });
            }
        }
        
        // 简单洗牌
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // 如果麻将数量不足64个，补充到64个
        while (tiles.length < totalTiles) {
            const randomType = Math.floor(Math.random() * this.tileTypes.length);
            tiles.push({
                type: randomType,
                symbol: this.tileTypes[randomType],
                id: `extra-${tiles.length}`
            });
        }
        
        // 再次洗牌确保随机性
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // 填充到棋盘
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = tiles[tileIndex++];
            }
        }
        
        console.log(`生成了 ${tiles.length} 个麻将，填满 ${this.boardSize}x${this.boardSize} 棋盘`);
        
        // 打印棋盘布局用于调试
        console.log('=== 棋盘布局 ===');
        for (let row = 0; row < this.boardSize; row++) {
            let rowStr = `第${row}行: `;
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                rowStr += tile ? `${tile.symbol}(${tile.type}) ` : 'null ';
            }
            console.log(rowStr);
        }
        console.log('=== 棋盘布局结束 ===');
    }
    
    /**
     * 渲染棋盘
     */
    private renderBoard() {
        console.log('开始渲染棋盘...');
        
        // 清空现有节点
        this.gameBoard.removeAllChildren();
        
        // 计算起始位置
        const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const startX = -boardWidth / 2 + this.tileSize / 2;
        const startY = boardHeight / 2 - this.tileSize / 2;
        
        let tilesCreated = 0;
        
        // 创建麻将节点
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile) {
                    const tileNode = this.createTileNode(tile, row, col);
                    
                    // 设置位置
                    const x = startX + col * (this.tileSize + this.tileGap);
                    const y = startY - row * (this.tileSize + this.tileGap);
                    tileNode.setPosition(x, y, 0);
                    
                    // 添加到场景
                    this.gameBoard.addChild(tileNode);
                    this.tileNodes[row][col] = tileNode;
                    tilesCreated++;
                }
            }
        }
        
        console.log(`渲染完成，创建了 ${tilesCreated} 个麻将节点`);
    }
    
    /**
     * 创建麻将节点
     */
    private createTileNode(tileData: TileData, row: number, col: number): Node {
        const tileNode = new Node(`Tile_${row}_${col}`);
        
        // 添加UITransform
        const transform = tileNode.addComponent(UITransform);
        transform.setContentSize(this.tileSize, this.tileSize);
        
        // 添加背景Sprite
        const sprite = tileNode.addComponent(Sprite);
        sprite.color = new Color(240, 240, 240, 255); // 浅灰色背景
        
        // 创建文字标签
        const labelNode = new Node('Label');
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(this.tileSize, this.tileSize);
        
        const label = labelNode.addComponent(Label);
        label.string = tileData.symbol;
        label.fontSize = 36;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 设置颜色 - 8种麻将对应8种颜色
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
        
        // 存储数据
        (tileNode as any).tileData = tileData;
        (tileNode as any).gridRow = row;
        (tileNode as any).gridCol = col;
        
        return tileNode;
    }
    
    /**
     * 触摸开始事件处理 - 支持点击和拖拽
     */
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        console.log('=== 触摸开始 ===');
        console.log('触摸坐标:', touchPos);
        
        // 获取点击的麻将位置
        const gridPos = this.getGridPositionFromTouch(touchPos);
        console.log('网格位置:', gridPos);
        
        if (gridPos && this.board[gridPos.row] && this.board[gridPos.row][gridPos.col]) {
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
     * 触摸移动事件处理 - 拖拽过程
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
            this.dragGroup = this.findDragGroupForSpecificDirection(this.dragStartPos.row, this.dragStartPos.col, specificDirection);
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
     * 触摸结束事件处理 - 拖拽结束
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
                const targetGridPos = this.getGridPositionFromTouch(new Vec2(touchPos.x, touchPos.y));
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
     * 坐标转换 - 考虑Web和Cocos Creator坐标系差异
     * Web: 原点左上角，Y向下为正
     * Cocos: 原点中心，Y向上为正
     */
    private getGridPositionFromTouch(touchPos: Vec2): {row: number, col: number} | null {
        console.log('--- 坐标转换开始（以棋盘左上角为原点）---');
        console.log('1. 原始触摸坐标:', touchPos);
        
        // 将触摸坐标转换为GameBoard节点的本地坐标
        const gameBoardTransform = this.gameBoard.getComponent(UITransform);
        if (!gameBoardTransform) {
            console.error('无法获取GameBoard的UITransform');
            return null;
        }
        
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
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
            console.log('--- 坐标转换成功 ---');
            return { row, col };
        }
        
        console.log('--- 坐标转换失败：网格位置无效 ---');
        return null;
    }
    
    /**
     * 处理麻将点击事件 - 参考web版本实现
     */
    private handleTileClick(row: number, col: number) {
        console.log(`=== 处理麻将点击: (${row}, ${col}) ===`);
        
        const clickedTileNode = this.tileNodes[row][col];
        const clickedTileData = this.board[row][col];
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
            const canEliminate = this.canEliminate(this.selectedTile.row, this.selectedTile.col, row, col);
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
        const eliminableOptions = this.getEliminableOptionsForTile(row, col);
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
        console.log(`--- 选择麻将: (${row}, ${col}) ---`);
        this.selectedTile = { row, col, node: tileNode };
        console.log('设置选中状态完成');
        
        this.highlightSelectedTile(tileNode);
        console.log('高亮选中麻将完成');
        
        this.highlightEliminable(row, col);
        console.log('高亮可消除麻将完成');
    }
    
    /**
     * 获取指定麻将的所有可消除选项
     */
    private getEliminableOptionsForTile(row: number, col: number): Array<{row1: number, col1: number, row2: number, col2: number}> {
        const options: Array<{row1: number, col1: number, row2: number, col2: number}> = [];
        
        // 遍历整个棋盘，找出所有可以与当前麻将消除的位置
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
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
     * 清除选择状态
     */
    private clearSelection() {
        if (this.selectedTile) {
            this.clearTileHighlight(this.selectedTile.node);
        }
        this.clearAllHighlights();
        this.selectedTile = null;
        console.log('清除选择状态');
    }
    
    /**
     * 高亮选中的麻将
     */
    private highlightSelectedTile(tileNode: Node) {
        const sprite = tileNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(144, 205, 244, 255); // 蓝色高亮
        }
        
        // 添加选中动画
        tween(tileNode)
            .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }
    
    /**
     * 清除麻将高亮
     */
    private clearTileHighlight(tileNode: Node) {
        const sprite = tileNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(240, 240, 240, 255); // 恢复原色
        }
    }
    
    /**
     * 高亮可消除的麻将 - 参考web版本实现
     */
    private highlightEliminable(row: number, col: number) {
        this.clearAllHighlights();
        
        const currentTile = this.board[row][col];
        if (!currentTile) return;
        
        // 遍历所有麻将，找出可消除的
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (r === row && c === col) continue;
                
                if (this.canEliminate(row, col, r, c)) {
                    const tileNode = this.tileNodes[r][c];
                    if (tileNode && tileNode.isValid) {
                        const sprite = tileNode.getComponent(Sprite);
                        if (sprite) {
                            sprite.color = new Color(255, 255, 144, 255); // 黄色高亮
                        }
                        this.highlightedTiles.push(tileNode);
                    }
                }
            }
        }
        
        console.log(`高亮了 ${this.highlightedTiles.length} 个可消除的麻将`);
    }
    
    /**
     * 清除所有高亮
     */
    private clearAllHighlights() {
        console.log(`清除 ${this.highlightedTiles.length} 个高亮麻将`);
        
        this.highlightedTiles.forEach((tileNode, index) => {
            // 检查节点是否存在且有效
            if (!tileNode) {
                console.log(`高亮麻将 ${index} 为 null，跳过`);
                return;
            }
            
            if (!tileNode.isValid) {
                console.log(`高亮麻将 ${index} 已失效，跳过`);
                return;
            }
            
            try {
                const sprite = tileNode.getComponent(Sprite);
                if (sprite) {
                    const oldColor = sprite.color.clone();
                    sprite.color = new Color(240, 240, 240, 255); // 恢复原色
                    console.log(`清除高亮 ${index}: 颜色从 ${oldColor} 恢复为 ${sprite.color}`);
                } else {
                    console.log(`高亮麻将 ${index} 没有 Sprite 组件`);
                }
            } catch (error) {
                console.error(`清除高亮 ${index} 时发生错误:`, error);
            }
        });
        
        // 清理数组，移除无效节点
        this.highlightedTiles = this.highlightedTiles.filter(node => node && node.isValid);
        console.log(`所有高亮已清除，剩余有效节点: ${this.highlightedTiles.length}`);
        
        // 最终清空数组
        this.highlightedTiles = [];
    }
    
    /**
     * 检查两个麻将是否可以消除 - 简化版本
     */
    private canEliminate(r1: number, c1: number, r2: number, c2: number): boolean {
        console.log(`--- 消除检查: (${r1},${c1}) vs (${r2},${c2}) ---`);
        
        const tile1 = this.board[r1][c1];
        const tile2 = this.board[r2][c2];
        
        console.log('麻将1:', tile1);
        console.log('麻将2:', tile2);
        
        if (!tile1 || !tile2 || (r1 === r2 && c1 === c2)) {
            console.log('基础检查失败：麻将不存在或位置相同');
            return false;
        }
        
        // 检查类型是否相同
        if (tile1.type !== tile2.type) {
            console.log(`类型不匹配: ${tile1.type} vs ${tile2.type}`);
            return false;
        }
        
        console.log('类型匹配，继续检查路径');
        
        // 检查是否相邻
        const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
        if (isAdjacent) {
            console.log('相邻麻将，可以消除');
            return true;
        }
        
        // 检查直线路径 - 简化版本
        if (r1 === r2) { // 同行
            console.log('同行检查');
            const startCol = Math.min(c1, c2) + 1;
            const endCol = Math.max(c1, c2);
            console.log(`检查列范围: ${startCol} 到 ${endCol}`);
            
            for (let col = startCol; col < endCol; col++) {
                console.log(`检查位置 (${r1}, ${col}):`, this.board[r1][col]);
                if (this.board[r1][col] !== null) {
                    console.log('路径被阻挡');
                    return false;
                }
            }
            console.log('同行路径畅通，可以消除');
            return true;
        }
        
        if (c1 === c2) { // 同列
            console.log('同列检查');
            const startRow = Math.min(r1, r2) + 1;
            const endRow = Math.max(r1, r2);
            console.log(`检查行范围: ${startRow} 到 ${endRow}`);
            
            for (let row = startRow; row < endRow; row++) {
                console.log(`检查位置 (${row}, ${c1}):`, this.board[row][c1]);
                if (this.board[row][c1] !== null) {
                    console.log('路径被阻挡');
                    return false;
                }
            }
            console.log('同列路径畅通，可以消除');
            return true;
        }
        
        console.log('不满足消除条件');
        return false;
    }
    
    /**
     * 消除一对麻将
     */
    private eliminatePair(row1: number, col1: number, row2: number, col2: number) {
        console.log(`消除麻将对: (${row1}, ${col1}) 和 (${row2}, ${col2})`);
        
        const tile1Node = this.tileNodes[row1][col1];
        const tile2Node = this.tileNodes[row2][col2];
        
        if (tile1Node && tile2Node) {
            // 消除动画
            const animateElimination = (node: Node) => {
                // 添加UIOpacity组件用于透明度动画
                const uiOpacity = node.addComponent(UIOpacity);
                uiOpacity.opacity = 255;
                
                tween(node)
                    .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.2, { scale: new Vec3(0, 0, 0) })
                    .call(() => {
                        node.destroy();
                    })
                    .start();
                    
                // 同时进行透明度动画
                tween(uiOpacity)
                    .to(0.4, { opacity: 0 })
                    .start();
            };
            
            animateElimination(tile1Node);
            animateElimination(tile2Node);
        }
        
        // 更新数据
        setTimeout(() => {
            this.board[row1][col1] = null;
            this.board[row2][col2] = null;
            this.tileNodes[row1][col1] = null;
            this.tileNodes[row2][col2] = null;
            this.score += 10;
            
            console.log(`当前分数: ${this.score}`);
            this.checkWinCondition();
        }, 400);
    }
    
    /**
     * 检查胜利条件
     */
    private checkWinCondition() {
        const hasRemainingTiles = this.board.some(row => row.some(tile => tile !== null));
        if (!hasRemainingTiles) {
            setTimeout(() => {
                console.log('🎉 恭喜您获得胜利！所有麻将都已消除！');
                console.log(`最终分数: ${this.score}`);
            }, 500);
        }
    }
    
    /**
     * 重新开始游戏
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
     * 根据具体拖拽方向找到拖动组
     * 推动逻辑（统一的推动效果）：
     * - 往左拖：选中麻将推动其左边的连续麻将一起向左移动
     * - 往右拖：选中麻将推动其右边的连续麻将一起向右移动  
     * - 往上拖：选中麻将推动其下边的连续麻将一起向上移动
     * - 往下拖：选中麻将推动其上边的连续麻将一起向下移动
     */
    private findDragGroupForSpecificDirection(startRow: number, startCol: number, direction: 'left' | 'right' | 'up' | 'down'): {row: number, col: number}[] {
        console.log(`寻找拖动组，具体方向: ${direction}, 起始位置: (${startRow}, ${startCol})`);
        
        const group: {row: number, col: number}[] = [{ row: startRow, col: startCol }];
        
        switch (direction) {
            case 'left':
                // 往左拖拽：推动左边的连续麻将（推动效果）
                for (let c = startCol - 1; c >= 0; c--) {
                    if (this.board[startRow][c] !== null) {
                        group.unshift({ row: startRow, col: c });
                        console.log(`往左拖拽，添加左边麻将: (${startRow}, ${c})`);
                    } else {
                        break;
                    }
                }
                break;
                
            case 'right':
                // 往右拖拽：带动右边的连续麻将（推动效果）
                for (let c = startCol + 1; c < this.boardSize; c++) {
                    if (this.board[startRow][c] !== null) {
                        group.push({ row: startRow, col: c });
                        console.log(`往右拖拽，添加右边麻将: (${startRow}, ${c})`);
                    } else {
                        break;
                    }
                }
                break;
                
            case 'up':
                // 往上拖拽：推动下边的连续麻将向上移动（推动效果）
                for (let r = startRow + 1; r < this.boardSize; r++) {
                    if (this.board[r][startCol] !== null) {
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
                    if (this.board[r][startCol] !== null) {
                        group.unshift({ row: r, col: startCol });
                        console.log(`往下拖拽，添加上边麻将: (${r}, ${startCol})`);
                    } else {
                        break;
                    }
                }
                break;
        }
        
        console.log('找到的拖动组:', group);
        return group;
    }
    
    /**
     * 创建拖动组的虚影
     */
    private createDragGroupShadows(currentPos: Vec3) {
        this.clearDragShadows(); // 清除现有虚影
        if (!this.dragStartPos || this.dragGroup.length === 0) return;
        
        const startTileNode = this.tileNodes[this.dragStartPos.row][this.dragStartPos.col];
        if (!startTileNode) return;
        
        const startTileWorldPos = startTileNode.worldPosition;
        
        this.dragGroup.forEach(tileGrid => {
            const originalTileNode = this.tileNodes[tileGrid.row][tileGrid.col];
            if (!originalTileNode) return;
            
            // 创建虚影节点
            const shadowNode = new Node('DragShadow');
            const shadowTransform = shadowNode.addComponent(UITransform);
            shadowTransform.setContentSize(this.tileSize, this.tileSize);
            
            const shadowSprite = shadowNode.addComponent(Sprite);
            shadowSprite.color = new Color(255, 255, 255, 150); // 半透明白色
            
            // 添加文字
            const labelNode = new Node('Label');
            const labelTransform = labelNode.addComponent(UITransform);
            labelTransform.setContentSize(this.tileSize, this.tileSize);
            const label = labelNode.addComponent(Label);
            
            const tileData = this.board[tileGrid.row][tileGrid.col];
            if (tileData) {
                label.string = tileData.symbol;
                label.fontSize = 32;
                label.horizontalAlign = Label.HorizontalAlign.CENTER;
                label.verticalAlign = Label.VerticalAlign.CENTER;
                
                // 设置颜色
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
            
            shadowNode.addChild(labelNode);
            
            // 计算相对偏移
            const originalTileWorldPos = originalTileNode.worldPosition;
            const relativeOffsetX = originalTileWorldPos.x - startTileWorldPos.x;
            const relativeOffsetY = originalTileWorldPos.y - startTileWorldPos.y;
            
            // 存储相对偏移信息
            (shadowNode as any).relativeOffsetX = relativeOffsetX;
            (shadowNode as any).relativeOffsetY = relativeOffsetY;
            (shadowNode as any).originalWorldX = originalTileWorldPos.x;
            (shadowNode as any).originalWorldY = originalTileWorldPos.y;
            
            // 添加到场景
            shadowNode.setParent(this.node.parent); // 添加到Canvas
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
        });
    }
    
    /**
     * 清除拖拽虚影
     */
    private clearDragShadows() {
        this.dragShadows.forEach(shadow => shadow.destroy());
        this.dragShadows = [];
    }
    
    /**
     * 处理拖拽结束 - 详细调试版本
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
            const canMove = this.checkIfCanMove(startRow, startCol, direction, steps);
            console.log('移动可行性检查:', canMove);
            
            if (canMove) {
                // 执行移动
                console.log('执行移动操作');
                this.executeTileMove(startRow, startCol, direction, steps);
                
                // 检查移动后的消除机会
                setTimeout(() => {
                    console.log('检查移动后的消除机会');
                    this.checkEliminationAfterMove();
                }, 100);
            } else {
                console.log('移动不可行，显示失败反馈');
                this.showMoveFailedFeedback(startRow, startCol);
            }
        } else {
            console.log('移动步数为0，不执行移动');
        }
        
        console.log('=== 拖拽结束处理完成 ===');
    }
    
    /**
     * 检查是否可以移动
     */
    private checkIfCanMove(startRow: number, startCol: number, direction: string, steps: number): boolean {
        console.log(`检查移动可行性: (${startRow}, ${startCol}) ${direction} ${steps}步`);
        
        // 简化版本：暂时返回true，允许所有移动
        // 后续可以添加更复杂的移动规则检查
        return true;
    }
    
    /**
     * 执行麻将移动
     */
    private executeTileMove(startRow: number, startCol: number, direction: string, steps: number) {
        console.log(`执行移动: (${startRow}, ${startCol}) ${direction} ${steps}步`);
        console.log('当前拖动组:', this.dragGroup);
        
        // 计算新位置
        let newPositions: {row: number, col: number}[] = [];
        
        this.dragGroup.forEach(tile => {
            let newRow = tile.row;
            let newCol = tile.col;
            
            switch (direction) {
                case 'left':
                    newCol = Math.max(0, tile.col - steps);
                    break;
                case 'right':
                    newCol = Math.min(this.boardSize - 1, tile.col + steps);
                    break;
                case 'up':
                    newRow = Math.max(0, tile.row - steps);
                    break;
                case 'down':
                    newRow = Math.min(this.boardSize - 1, tile.row + steps);
                    break;
            }
            
            newPositions.push({ row: newRow, col: newCol });
        });
        
        console.log('计算的新位置:', newPositions);
        
        // 检查新位置是否有冲突
        const hasConflict = this.checkPositionConflicts(newPositions);
        console.log('位置冲突检查:', hasConflict);
        
        if (!hasConflict) {
            // 执行实际移动
            this.performTileMovement(this.dragGroup, newPositions);
        } else {
            console.log('位置有冲突，移动失败');
        }
    }
    
    /**
     * 检查位置冲突
     */
    private checkPositionConflicts(newPositions: {row: number, col: number}[]): boolean {
        for (const pos of newPositions) {
            // 检查是否超出边界
            if (pos.row < 0 || pos.row >= this.boardSize || pos.col < 0 || pos.col >= this.boardSize) {
                console.log(`位置超出边界: (${pos.row}, ${pos.col})`);
                return true;
            }
            
            // 检查目标位置是否被其他麻将占用（不在拖动组中的麻将）
            const existingTile = this.board[pos.row][pos.col];
            if (existingTile) {
                const isInDragGroup = this.dragGroup.some(tile => tile.row === pos.row && tile.col === pos.col);
                if (!isInDragGroup) {
                    console.log(`位置被占用: (${pos.row}, ${pos.col})`);
                    return true;
                }
            }
        }
        
        return false;
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
        this.lastMoveRecord = {
            oldPositions: [...oldPositions],
            newPositions: [...newPositions],
            tileData: [],
            tileNodes: []
        };
        
        console.log('保存移动记录，旧位置:', oldPositions);
        console.log('保存移动记录，新位置:', newPositions);
        
        // 清除旧位置（安全检查）
        oldPositions.forEach((pos, index) => {
            // 验证位置有效性
            if (!pos || typeof pos.row !== 'number' || typeof pos.col !== 'number' ||
                pos.row < 0 || pos.row >= this.boardSize || 
                pos.col < 0 || pos.col >= this.boardSize) {
                console.error(`无效的旧位置 ${index}:`, pos);
                return;
            }
            
            tileData[index] = this.board[pos.row][pos.col];
            tileNodes[index] = this.tileNodes[pos.row][pos.col];
            
            console.log(`保存位置 ${index}: (${pos.row}, ${pos.col})`);
            console.log(`麻将数据:`, tileData[index]);
            console.log(`麻将节点:`, tileNodes[index] ? '存在' : '不存在');
            
            // 保存到移动记录（深拷贝数据）
            this.lastMoveRecord!.tileData[index] = tileData[index];
            this.lastMoveRecord!.tileNodes[index] = tileNodes[index];
            
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
            this.board[pos.row][pos.col] = null;
            this.tileNodes[pos.row][pos.col] = null;
        });
        
        // 验证移动记录完整性
        if (this.lastMoveRecord.oldPositions.length !== this.lastMoveRecord.tileData.length ||
            this.lastMoveRecord.oldPositions.length !== this.lastMoveRecord.tileNodes.length) {
            console.error('移动记录数据不完整，清除记录');
            this.lastMoveRecord = null;
            return;
        }
        
        console.log('移动记录保存完成:', this.lastMoveRecord);
        
        // 设置新位置
        newPositions.forEach((pos, index) => {
            this.board[pos.row][pos.col] = tileData[index];
            this.tileNodes[pos.row][pos.col] = tileNodes[index];
            
            // 更新节点位置
            if (tileNodes[index]) {
                const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
                const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
                const startX = -boardWidth / 2 + this.tileSize / 2;
                const startY = boardHeight / 2 - this.tileSize / 2;
                
                const x = startX + pos.col * (this.tileSize + this.tileGap);
                const y = startY - pos.row * (this.tileSize + this.tileGap);
                
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
     * 只检查与移动的麻将相关的消除机会
     */
    private checkEliminationAfterMove() {
        console.log('检查移动后是否有消除机会');
        
        if (!this.lastMoveRecord) {
            console.log('没有移动记录，无法检查消除');
            return;
        }
        
        // 收集与移动麻将相关的消除对
        const eliminablePairs: Array<{row1: number, col1: number, row2: number, col2: number}> = [];
        
        // 只检查移动后的新位置的麻将
        this.lastMoveRecord.newPositions.forEach(newPos => {
            if (!this.board[newPos.row][newPos.col]) return;
            
            console.log(`检查移动到 (${newPos.row}, ${newPos.col}) 的麻将的消除机会`);
            
            // 遍历整个棋盘，寻找能与这个移动麻将消除的其他麻将
            for (let r = 0; r < this.boardSize; r++) {
                for (let c = 0; c < this.boardSize; c++) {
                    // 跳过空位置和自己
                    if (!this.board[r][c] || (r === newPos.row && c === newPos.col)) continue;
                    
                    if (this.canEliminate(newPos.row, newPos.col, r, c)) {
                        // 检查这个消除对是否已经存在（避免重复）
                        const exists = eliminablePairs.some(pair => 
                            (pair.row1 === newPos.row && pair.col1 === newPos.col && pair.row2 === r && pair.col2 === c) ||
                            (pair.row1 === r && pair.col1 === c && pair.row2 === newPos.row && pair.col2 === newPos.col)
                        );
                        
                        if (!exists) {
                            eliminablePairs.push({
                                row1: newPos.row,
                                col1: newPos.col,
                                row2: r,
                                col2: c
                            });
                            console.log(`发现可消除的麻将对: (${newPos.row}, ${newPos.col}) 和 (${r}, ${c})`);
                        }
                    }
                }
            }
        });
        
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
     * 高亮显示所有可消除的麻将对
     */
    private highlightAllEliminablePairs(pairs: Array<{row1: number, col1: number, row2: number, col2: number}>) {
        console.log('高亮显示所有可消除的麻将对');
        
        // 清除之前的高亮
        this.clearAllHighlights();
        
        // 收集所有参与消除的麻将位置
        const highlightPositions = new Set<string>();
        
        pairs.forEach(pair => {
            highlightPositions.add(`${pair.row1}-${pair.col1}`);
            highlightPositions.add(`${pair.row2}-${pair.col2}`);
        });
        
        // 高亮这些位置的麻将
        highlightPositions.forEach(posStr => {
            const [row, col] = posStr.split('-').map(Number);
            const tileNode = this.tileNodes[row][col];
            if (tileNode && tileNode.isValid) {
                const sprite = tileNode.getComponent(Sprite);
                if (sprite) {
                    sprite.color = new Color(255, 255, 144, 255); // 黄色高亮
                }
                this.highlightedTiles.push(tileNode);
            }
        });
        
        console.log(`高亮了 ${highlightPositions.size} 个可消除的麻将`);
    }
    
    /**
     * 高亮显示与移动麻将相关的消除选项
     */
    private highlightMovedTileEliminablePairs(pairs: Array<{row1: number, col1: number, row2: number, col2: number}>) {
        console.log('=== 开始高亮显示与移动麻将相关的消除选项 ===');
        console.log('消除对数据:', pairs);
        
        // 清除之前的高亮
        this.clearAllHighlights();
        
        if (!this.lastMoveRecord) {
            console.log('没有移动记录，无法高亮');
            return;
        }
        
        console.log('移动记录:', this.lastMoveRecord);
        
        // 收集移动的麻将位置和它们的消除伙伴位置
        const movedPositions = new Set<string>();
        const partnerPositions = new Set<string>();
        
        // 标记移动的麻将位置
        this.lastMoveRecord.newPositions.forEach(pos => {
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
            const tileNode = this.tileNodes[row][col];
            console.log(`尝试高亮移动麻将 (${row}, ${col}):`, tileNode ? '节点存在' : '节点不存在');
            
            if (tileNode && tileNode.isValid) {
                try {
                    const sprite = tileNode.getComponent(Sprite);
                    if (sprite) {
                        const oldColor = sprite.color.clone();
                        sprite.color = new Color(100, 100, 255, 255); // 更明显的蓝色高亮
                        console.log(`麻将 (${row}, ${col}) 颜色从 ${oldColor} 改为 ${sprite.color}`);
                    } else {
                        console.log(`麻将 (${row}, ${col}) 没有 Sprite 组件`);
                    }
                    this.highlightedTiles.push(tileNode);
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
            const tileNode = this.tileNodes[row][col];
            console.log(`尝试高亮消除伙伴 (${row}, ${col}):`, tileNode ? '节点存在' : '节点不存在');
            
            if (tileNode && tileNode.isValid) {
                try {
                    const sprite = tileNode.getComponent(Sprite);
                    if (sprite) {
                        const oldColor = sprite.color.clone();
                        sprite.color = new Color(255, 255, 100, 255); // 更明显的黄色高亮
                        console.log(`麻将 (${row}, ${col}) 颜色从 ${oldColor} 改为 ${sprite.color}`);
                    } else {
                        console.log(`麻将 (${row}, ${col}) 没有 Sprite 组件`);
                    }
                    this.highlightedTiles.push(tileNode);
                } catch (error) {
                    console.error(`高亮消除伙伴 (${row}, ${col}) 时发生错误:`, error);
                }
            } else if (tileNode) {
                console.log(`麻将 (${row}, ${col}) 节点已失效`);
            }
        });
        
        console.log(`=== 高亮完成：${movedPositions.size} 个移动的麻将（蓝色）和 ${partnerPositions.size} 个消除伙伴（黄色）===`);
        console.log(`总共高亮了 ${this.highlightedTiles.length} 个麻将节点`);
    }
    
    /**
     * 回退上次移动
     */
    private revertLastMove() {
        console.log('=== 开始回退上次移动 ===');
        
        if (!this.lastMoveRecord) {
            console.log('没有移动记录，无法回退');
            return;
        }
        
        const record = this.lastMoveRecord;
        console.log('回退移动记录:', record);
        
        // 验证记录完整性
        if (!record.oldPositions || !record.newPositions || !record.tileData || !record.tileNodes) {
            console.error('移动记录数据不完整，无法安全回退');
            this.lastMoveRecord = null;
            return;
        }
        
        if (record.oldPositions.length !== record.tileData.length || 
            record.oldPositions.length !== record.tileNodes.length) {
            console.error('移动记录数据长度不一致，无法安全回退');
            this.lastMoveRecord = null;
            return;
        }
        
        try {
            // 第一步：清除新位置（安全检查）
            console.log('第一步：清除新位置');
            record.newPositions.forEach((pos, index) => {
                if (pos && typeof pos.row === 'number' && typeof pos.col === 'number' &&
                    pos.row >= 0 && pos.row < this.boardSize && 
                    pos.col >= 0 && pos.col < this.boardSize) {
                    
                    console.log(`清除新位置 (${pos.row}, ${pos.col})`);
                    this.board[pos.row][pos.col] = null;
                    this.tileNodes[pos.row][pos.col] = null;
                } else {
                    console.error(`无效的新位置 ${index}:`, pos);
                }
            });
            
            // 第二步：恢复旧位置（安全检查）
            console.log('第二步：恢复旧位置');
            record.oldPositions.forEach((pos, index) => {
                if (!pos || typeof pos.row !== 'number' || typeof pos.col !== 'number' ||
                    pos.row < 0 || pos.row >= this.boardSize || 
                    pos.col < 0 || pos.col >= this.boardSize) {
                    console.error(`无效的旧位置 ${index}:`, pos);
                    return;
                }
                
                const tileData = record.tileData[index];
                const tileNode = record.tileNodes[index];
                
                console.log(`恢复位置 ${index}: (${pos.row}, ${pos.col})`);
                console.log(`麻将数据:`, tileData);
                console.log(`麻将节点:`, tileNode ? '存在' : '不存在');
                
                // 恢复数据
                this.board[pos.row][pos.col] = tileData;
                this.tileNodes[pos.row][pos.col] = tileNode;
                
                // 恢复节点位置（如果节点存在）
                if (tileNode && tileNode.isValid) {
                    try {
                        const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
                        const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
                        const startX = -boardWidth / 2 + this.tileSize / 2;
                        const startY = boardHeight / 2 - this.tileSize / 2;
                        
                        const x = startX + pos.col * (this.tileSize + this.tileGap);
                        const y = startY - pos.row * (this.tileSize + this.tileGap);
                        
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
            console.log('第三步：显示回退动画');
            record.oldPositions.forEach((pos, index) => {
                if (pos && pos.row >= 0 && pos.row < this.boardSize && 
                    pos.col >= 0 && pos.col < this.boardSize) {
                    
                    const tileNode = this.tileNodes[pos.row][pos.col];
                    if (tileNode && tileNode.isValid) {
                        const sprite = tileNode.getComponent(Sprite);
                        if (sprite) {
                            const originalColor = sprite.color.clone();
                            tween(sprite)
                                .to(0.2, { color: new Color(255, 200, 200, 255) })
                                .to(0.2, { color: originalColor })
                                .start();
                        }
                    }
                }
            });
            
            console.log('=== 移动回退成功 ===');
            
        } catch (error) {
            console.error('回退过程中发生错误:', error);
            console.error('尝试清理状态...');
            
            // 发生错误时，尝试清理可能的不一致状态
            this.clearSelection();
            this.clearAllHighlights();
        } finally {
            // 无论成功还是失败，都清除移动记录
            this.lastMoveRecord = null;
            console.log('移动记录已清除');
        }
    }
    
    /**
     * 显示移动失败反馈
     */
    private showMoveFailedFeedback(row: number, col: number) {
        console.log(`显示移动失败反馈: (${row}, ${col})`);
        
        const tileNode = this.tileNodes[row][col];
        if (tileNode) {
            // 简单的震动效果
            const originalPos = tileNode.position.clone();
            tween(tileNode)
                .to(0.1, { position: originalPos.add(new Vec3(5, 0, 0)) })
                .to(0.1, { position: originalPos.add(new Vec3(-5, 0, 0)) })
                .to(0.1, { position: originalPos })
                .start();
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