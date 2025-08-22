/**
 * 麻将连连看游戏主类
 * 
 * 游戏规则：
 * 1. 通过点击或拖动来选择和移动麻将棋子
 * 2. 相同类型的麻将棋子可以消除，消除条件：
 *    - 相邻的相同棋子可以直接消除
 *    - 同行或同列且中间无阻挡的相同棋子可以消除
 * 3. 拖动棋子移动后，必须有消除机会，否则会自动回退
 * 4. 目标是消除所有棋子
 */
class MahjongGame {
    constructor() {
        // 游戏配置
        this.boardSize = 8;                    // 棋盘大小：8x8
        this.tileTypes = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋']; // 8种不同的麻将棋子类型
        
        // 游戏状态
        this.board = [];                       // 棋盘数组，存储所有棋子
        this.score = 0;                        // 当前得分
        this.selectedTile = null;              // 当前选中的棋子位置 {row, col}
        
        // 拖拽相关状态
        this.isDragging = false;               // 是否正在拖拽
        this.dragStartPos = null;              // 拖拽开始位置 {row, col, x, y}
        this.dragEndPos = null;                // 拖拽结束位置 {x, y}
        this.dragTiles = [];                   // 拖拽过程中涉及的棋子列表
        
        // 历史记录（用于撤销功能）
        this.moveHistory = [];                 // 移动历史记录
        this.eliminationHistory = [];          // 消除历史记录
        
        // UI状态
        this.hintHighlighted = false;          // 是否正在显示提示高亮
        
        // 初始化游戏
        this.init();
    }

    /**
     * 初始化游戏
     * 按顺序执行所有初始化步骤
     */
    init() {
        this.createBoard();           // 创建空白棋盘
        this.generatePairs();         // 生成配对的麻将棋子
        this.shuffleBoard();          // 随机打乱棋盘
        this.renderBoard();           // 渲染棋盘到DOM
        this.attachEventListeners();  // 绑定事件监听器
        this.updateUI();              // 更新UI显示
    }

    /**
     * 创建空白棋盘
     * 初始化一个8x8的二维数组，所有位置都设为null
     */
    createBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }

    /**
     * 生成配对的麻将棋子
     * 确保每种类型的棋子都有偶数个，这样才能完全消除
     */
    generatePairs() {
        const totalTiles = this.boardSize * this.boardSize;           // 总格子数：64
        const tilesNeeded = totalTiles / 2;                           // 需要的棋子对数：32对
        const tilesPerType = Math.floor(tilesNeeded / this.tileTypes.length) * 2;  // 每种类型的基础棋子数
        const extraTiles = (tilesNeeded % this.tileTypes.length) * 2; // 额外需要分配的棋子数
        
        const tiles = [];
            
        // 为每种类型生成偶数个麻将子，确保可以完全配对
        for (let i = 0; i < this.tileTypes.length; i++) {
            // 计算当前类型需要生成的棋子数量
            const count = tilesPerType + (i < extraTiles / 2 ? 2 : 0);
            for (let j = 0; j < count; j++) {
                tiles.push({
                    type: i,                      // 棋子类型索引
                    symbol: this.tileTypes[i],    // 棋子显示符号
                    id: `${i}-${j}`              // 唯一标识符
                });
            }
        }

        // 按顺序填充棋盘
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    this.board[row][col] = tiles[tileIndex++];
                }
            }
        }
    }

    /**
     * 随机打乱棋盘
     * 使用Fisher-Yates洗牌算法重新排列所有棋子的位置
     */
    shuffleBoard() {
        // 收集所有非空棋子
        const tiles = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    tiles.push(this.board[row][col]);
                }
            }
        }

        // Fisher-Yates 洗牌算法：从后往前遍历，每个元素与前面的随机元素交换
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        // 将打乱后的棋子重新填充到棋盘中
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = tiles[tileIndex++] || null;
            }
        }
    }

    /**
     * 渲染棋盘到DOM
     * 清空游戏板并重新创建所有棋子元素
     */
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';  // 清空现有内容

        // 遍历棋盘的每个位置
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                const tileElement = document.createElement('div');
                
                // 设置基础样式和位置属性
                tileElement.className = 'tile';
                tileElement.setAttribute('data-row', row);
                tileElement.setAttribute('data-col', col);

                // 如果当前位置有棋子，设置棋子相关属性
                if (tile) {
                    tileElement.textContent = tile.symbol;                    // 显示棋子符号
                    tileElement.classList.add(`tile-type-${tile.type}`);     // 添加类型样式类
                    tileElement.setAttribute('data-type', tile.type);        // 设置类型属性
                    tileElement.setAttribute('data-id', tile.id);            // 设置唯一ID
                }

                gameBoard.appendChild(tileElement);
            }
        }
    }

    /**
     * 绑定事件监听器
     * 为游戏板和控制按钮添加各种交互事件
     */
    attachEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const restartBtn = document.getElementById('restart-btn');
        const hintBtn = document.getElementById('hint-btn');
        const undoBtn = document.getElementById('undo-btn');

        // 鼠标事件（桌面端交互）
        gameBoard.addEventListener('mousedown', (e) => this.handleMouseDown(e));   // 鼠标按下：开始拖拽
        gameBoard.addEventListener('mousemove', (e) => this.handleMouseMove(e));   // 鼠标移动：拖拽过程
        gameBoard.addEventListener('mouseup', (e) => this.handleMouseUp(e));       // 鼠标松开：结束拖拽
        gameBoard.addEventListener('click', (e) => this.handleClick(e));           // 点击：选择棋子

        // 触摸事件（移动端支持）
        gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });  // 触摸开始
        gameBoard.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });    // 触摸移动
        gameBoard.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });      // 触摸结束

        // 控制按钮事件
        restartBtn.addEventListener('click', () => this.restart());        // 重新开始游戏
        hintBtn.addEventListener('click', () => this.showHint());          // 显示提示
        undoBtn.addEventListener('click', () => this.undoLastMove());      // 撤销上一步

        // 防止拖拽时选中文本，避免干扰游戏体验
        gameBoard.addEventListener('selectstart', (e) => e.preventDefault());
    }

    /* ==================== 事件处理方法 ==================== */

    /**
     * 处理鼠标按下事件
     * @param {MouseEvent} e - 鼠标事件对象
     */
    handleMouseDown(e) {
        this.startDrag(e.target, e.clientX, e.clientY);
    }

    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} e - 鼠标事件对象
     */
    handleMouseMove(e) {
        this.handleDragMove(e.clientX, e.clientY);
    }

    /**
     * 处理鼠标松开事件
     * @param {MouseEvent} e - 鼠标事件对象
     */
    handleMouseUp(e) {
        this.endDrag(e.clientX, e.clientY);
    }

    /**
     * 处理触摸开始事件（移动端）
     * @param {TouchEvent} e - 触摸事件对象
     */
    handleTouchStart(e) {
        e.preventDefault();  // 阻止默认行为，避免页面滚动等
        const touch = e.touches[0];
        
        // 添加触摸反馈效果，提升移动端体验
        const target = e.target;
        if (target.classList.contains('tile') && target.getAttribute('data-type')) {
            target.classList.add('touch-active');
        }
        
        this.startDrag(e.target, touch.clientX, touch.clientY);
    }

    /**
     * 处理触摸移动事件（移动端）
     * @param {TouchEvent} e - 触摸事件对象
     */
    handleTouchMove(e) {
        e.preventDefault();  // 阻止页面滚动
        const touch = e.touches[0];
        this.handleDragMove(touch.clientX, touch.clientY);
    }

    /**
     * 处理触摸结束事件（移动端）
     * @param {TouchEvent} e - 触摸事件对象
     */
    handleTouchEnd(e) {
        e.preventDefault();
        
        // 移除所有触摸反馈效果
        document.querySelectorAll('.tile.touch-active').forEach(tile => {
            tile.classList.remove('touch-active');
        });
        
        // 获取触摸结束位置并处理拖拽结束
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            this.endDrag(touch.clientX, touch.clientY);
        } else {
            this.endDrag();  // 没有触摸位置信息时的fallback
        }
    }

    /* ==================== 拖拽核心方法 ==================== */

    /**
     * 开始拖拽操作
     * @param {HTMLElement} target - 被点击的目标元素
     * @param {number} clientX - 点击的X坐标
     * @param {number} clientY - 点击的Y坐标
     */
    startDrag(target, clientX, clientY) {
        // 只有棋子元素才能被拖拽
        if (!target.classList.contains('tile') || !target.getAttribute('data-type')) return;

        // 获取棋子在棋盘中的位置
        const row = parseInt(target.getAttribute('data-row'));
        const col = parseInt(target.getAttribute('data-col'));

        // 记录拖拽开始的位置信息，但不立即设置isDragging
        // 这样可以区分点击和拖拽操作
        this.dragStartPos = { row: row, col: col, x: clientX, y: clientY };
    }

    /**
     * 处理拖拽移动过程
     * @param {number} clientX - 当前X坐标
     * @param {number} clientY - 当前Y坐标
     */
    handleDragMove(clientX, clientY) {
        if (!this.dragStartPos) return;

        // 计算移动距离
        const deltaX = clientX - this.dragStartPos.x;
        const deltaY = clientY - this.dragStartPos.y;
        const threshold = 30; // 拖拽阈值：超过30像素才认为是拖拽

        // 只有当移动距离超过阈值时，才认为是真正的拖拽操作
        if (!this.isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
            this.isDragging = true;
            // 给被拖拽的棋子添加拖拽样式
            const target = document.querySelector(`[data-row="${this.dragStartPos.row}"][data-col="${this.dragStartPos.col}"]`);
            if (target) {
                target.classList.add('dragging');
            }
        }
        
        // 持续更新拖拽结束位置，用于计算移动方向
        this.dragEndPos = { x: clientX, y: clientY };
    }

    /**
     * 结束拖拽操作
     * @param {number} endX - 拖拽结束的X坐标
     * @param {number} endY - 拖拽结束的Y坐标
     */
    endDrag(endX, endY) {
        console.log('=== 拖动结束 ===');
        console.log('结束坐标:', { endX, endY });
        console.log('开始位置:', this.dragStartPos);
        
        // 清除拖拽状态
        document.querySelectorAll('.tile.dragging').forEach(tile => {
            tile.classList.remove('dragging');
        });
        this.clearDragIndicators();

        if (this.isDragging && this.dragStartPos && (endX !== undefined && endY !== undefined)) {
            // 计算松手时的移动方向和距离
            const deltaX = endX - this.dragStartPos.x;
            const deltaY = endY - this.dragStartPos.y;
            const threshold = 30;
            
            console.log('屏幕坐标差值:', { deltaX, deltaY });
            
            if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                // 基于网格位置计算移动
                const targetGridPos = this.getGridPositionFromScreenCoords(endX, endY);
                const startGridPos = { row: this.dragStartPos.row, col: this.dragStartPos.col };
                
                console.log('目标网格位置:', targetGridPos);
                console.log('起始网格位置:', startGridPos);
                
                // 计算实际的网格移动距离和方向
                const gridDeltaX = targetGridPos.col - startGridPos.col;
                const gridDeltaY = targetGridPos.row - startGridPos.row;
                
                console.log('网格差值:', { gridDeltaX, gridDeltaY });
                
                let direction = '';
                let steps = 0;
                
                // 确定主要移动方向
                if (Math.abs(gridDeltaX) > Math.abs(gridDeltaY)) {
                    direction = gridDeltaX > 0 ? 'right' : 'left';
                    steps = Math.abs(gridDeltaX);
                } else if (Math.abs(gridDeltaY) > 0) {
                    direction = gridDeltaY > 0 ? 'down' : 'up';
                    steps = Math.abs(gridDeltaY);
                }
                
                console.log('计算的移动:', { direction, steps });
                
                // 记录原始步数用于调试
                const originalSteps = steps;
                
                // 移除移动步数限制，允许移动到目标位置
                // steps = Math.min(steps, 4); // 移除这个限制
                
                console.log('移动步数:', { originalSteps, finalSteps: steps });
                
                if (steps > 0) {
                    // 执行移动
                    const actualMoved = this.moveTiles(this.dragStartPos.row, this.dragStartPos.col, direction, steps);
                    console.log('实际移动步数:', actualMoved);
                    
                    // 移动后检查是否有消除机会，如果没有则回退
                    if (actualMoved > 0) {
                        this.checkEliminationAfterDrag();
                    } else {
                        console.log('移动失败，显示反馈');
                        // 如果没有移动成功，给出视觉反馈
                        this.showMoveFailedFeedback(this.dragStartPos.row, this.dragStartPos.col);
                    }
                } else {
                    console.log('移动步数为0，不执行移动');
                }
            } else {
                console.log('移动距离未达到阈值，不执行移动');
            }
        }

        this.isDragging = false;
        this.dragStartPos = null;
        this.dragEndPos = null;
        this.dragTiles = [];
    }

    /**
     * 将屏幕坐标转换为棋盘网格坐标
     * @param {number} screenX - 屏幕X坐标
     * @param {number} screenY - 屏幕Y坐标
     * @returns {object} 网格坐标 {row, col}
     */
    getGridPositionFromScreenCoords(screenX, screenY) {
        // 获取游戏板的位置和尺寸
        const gameBoard = document.getElementById('game-board');
        const rect = gameBoard.getBoundingClientRect();
        
        console.log('游戏板边界:', rect);
        
        // 计算相对于游戏板的坐标
        const relativeX = screenX - rect.left;
        const relativeY = screenY - rect.top;
        
        console.log('相对坐标:', { relativeX, relativeY });
        
        // 计算每个格子的大小（考虑内边距和间隙）
        const padding = 15; // 与CSS中的padding值一致
        const gap = 4; // 与CSS中的gap值一致
        const boardWidth = rect.width - padding * 2;
        const boardHeight = rect.height - padding * 2;
        
        // 考虑gap的影响：总gap数量 = (格子数 - 1) * gap
        const totalGapX = (this.boardSize - 1) * gap;
        const totalGapY = (this.boardSize - 1) * gap;
        
        const cellWidth = (boardWidth - totalGapX) / this.boardSize;
        const cellHeight = (boardHeight - totalGapY) / this.boardSize;
        
        console.log('棋盘尺寸:', { boardWidth, boardHeight, cellWidth, cellHeight, padding });
        
        // 计算网格坐标，考虑内边距和gap
        // 每个格子的实际位置需要考虑前面所有gap的累积影响
        const adjustedX = relativeX - padding;
        const adjustedY = relativeY - padding;
        
        // 使用更准确的计算方式，考虑gap的累积效应
        let col = 0;
        let accumulatedWidth = 0;
        for (let i = 0; i < this.boardSize; i++) {
            if (adjustedX < accumulatedWidth + cellWidth) {
                col = i;
                break;
            }
            accumulatedWidth += cellWidth + gap;
            col = i + 1;
        }
        
        let row = 0;
        let accumulatedHeight = 0;
        for (let i = 0; i < this.boardSize; i++) {
            if (adjustedY < accumulatedHeight + cellHeight) {
                row = i;
                break;
            }
            accumulatedHeight += cellHeight + gap;
            row = i + 1;
        }
        
        console.log('计算的原始网格坐标:', { row, col });
        
        // 确保坐标在有效范围内
        const originalCol = col;
        const originalRow = row;
        col = Math.max(0, Math.min(col, this.boardSize - 1));
        row = Math.max(0, Math.min(row, this.boardSize - 1));
        
        if (originalCol !== col || originalRow !== row) {
            console.log('坐标被限制:', { 
                original: { row: originalRow, col: originalCol }, 
                limited: { row, col } 
            });
        }
        
        console.log('最终网格坐标:', { row, col });
        
        return { row: row, col: col };
    }

    clearDragIndicators() {
        // 清除所有拖拽指示器
        document.querySelectorAll('.tile.move-preview').forEach(tile => {
            tile.classList.remove('move-preview');
        });
    }

    showMoveFailedFeedback(row, col) {
        // 显示移动失败的视觉反馈
        const tileElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (tileElement) {
            tileElement.classList.add('move-failed');
            setTimeout(() => {
                tileElement.classList.remove('move-failed');
            }, 500);
        }
    }

    /**
     * 移动棋子
     * @param {number} startRow - 起始行
     * @param {number} startCol - 起始列
     * @param {string} direction - 移动方向 ('up', 'down', 'left', 'right')
     * @param {number} moveDistance - 移动距离（格子数）
     * @returns {number} 实际移动的距离
     */
    moveTiles(startRow, startCol, direction, moveDistance = 1) {
        console.log('=== 执行移动 ===');
        console.log('移动参数:', { startRow, startCol, direction, moveDistance });
        
        // 验证起始位置是否有效
        if (!this.board[startRow] || !this.board[startRow][startCol]) {
            console.log('起始位置无效，返回0');
            return 0;
        }
        
        // 保存移动前的状态
        const previousBoard = this.deepCopyBoard();
        
        const directions = {
            'up': [-1, 0],
            'down': [1, 0],
            'left': [0, -1],
            'right': [0, 1]
        };

        const [deltaRow, deltaCol] = directions[direction];
        const tilesToMove = [];

        // 找到需要移动的所有麻将子
        if (direction === 'up') {
            for (let row = startRow; row >= 0; row--) {
                if (this.board[row][startCol]) {
                    tilesToMove.push({ row, col: startCol });
                } else {
                    break;
                }
            }
        } else if (direction === 'down') {
            for (let row = startRow; row < this.boardSize; row++) {
                if (this.board[row][startCol]) {
                    tilesToMove.push({ row, col: startCol });
                } else {
                    break;
                }
            }
        } else if (direction === 'left') {
            for (let col = startCol; col >= 0; col--) {
                if (this.board[startRow][col]) {
                    tilesToMove.push({ row: startRow, col });
                } else {
                    break;
                }
            }
        } else if (direction === 'right') {
            for (let col = startCol; col < this.boardSize; col++) {
                if (this.board[startRow][col]) {
                    tilesToMove.push({ row: startRow, col });
                } else {
                    break;
                }
            }
        }

        // 计算可以移动的距离
        let maxDistance = 0;
        for (const tile of tilesToMove) {
            let distance = 0;
            let newRow = tile.row + deltaRow;
            let newCol = tile.col + deltaCol;

            while (newRow >= 0 && newRow < this.boardSize && 
                   newCol >= 0 && newCol < this.boardSize) {
                if (this.board[newRow][newCol] && 
                    !tilesToMove.some(t => t.row === newRow && t.col === newCol)) {
                    break;
                }
                distance++;
                newRow += deltaRow;
                newCol += deltaCol;
            }

            if (maxDistance === 0 || distance < maxDistance) {
                maxDistance = distance;
            }
        }

        // 实际移动距离是请求距离和最大可能距离的较小值
        const actualMoveDistance = Math.min(moveDistance, maxDistance);
        
        console.log('移动计算结果:', { 
            tilesToMove: tilesToMove.length, 
            maxDistance, 
            requestedDistance: moveDistance, 
            actualMoveDistance 
        });

        // 移动麻将子
        if (actualMoveDistance > 0) {
            // 保存移动记录
            this.moveHistory.push({
                type: 'move',
                previousBoard: previousBoard,
                currentBoard: null, // 将在移动后设置
                score: this.score,
                startRow: startRow,
                startCol: startCol,
                direction: direction,
                distance: actualMoveDistance
            });

            // 根据移动方向确定移动顺序，避免覆盖问题
            if (direction === 'up' || direction === 'left') {
                tilesToMove.reverse();
            }

            // 先将所有要移动的麻将子暂存，然后清空原位置
            const tilesToMoveData = [];
            for (const tile of tilesToMove) {
                tilesToMoveData.push({
                    data: this.board[tile.row][tile.col],
                    oldRow: tile.row,
                    oldCol: tile.col,
                    newRow: tile.row + deltaRow * actualMoveDistance,
                    newCol: tile.col + deltaCol * actualMoveDistance
                });
            }

            // 清空原位置
            for (const moveData of tilesToMoveData) {
                this.board[moveData.oldRow][moveData.oldCol] = null;
            }

            // 放置到新位置
            for (const moveData of tilesToMoveData) {
                this.board[moveData.newRow][moveData.newCol] = moveData.data;
            }
            
            console.log('移动完成，麻将子新位置:', tilesToMoveData.map(data => ({
                tile: data.data.symbol,
                from: `(${data.oldRow},${data.oldCol})`,
                to: `(${data.newRow},${data.newCol})`
            })));

            // 更新移动记录中的当前状态
            this.moveHistory[this.moveHistory.length - 1].currentBoard = this.deepCopyBoard();

            this.renderBoard();
            this.updateUndoButton();
            return actualMoveDistance;
        }
        
        return 0;
    }

    deepCopyBoard() {
        const copy = [];
        for (let row = 0; row < this.boardSize; row++) {
            copy[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                copy[row][col] = tile ? { ...tile } : null;
            }
        }
        return copy;
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = this.moveHistory.length === 0;
        }
    }

    checkEliminationAfterDrag() {
        console.log('=== 检查拖动后的消除机会 ===');
        
        // 检查被拖拽的麻将子移动后的消除选项
        if (!this.dragStartPos) {
            console.log('没有拖动起始位置，退出检查');
            return;
        }
        
        // 找到移动后被拖拽麻将子的新位置
        const draggedTileNewPos = this.findDraggedTileNewPosition();
        if (!draggedTileNewPos) {
            console.log('找不到拖拽棋子的新位置，清除选择');
            this.clearSelection();
            return;
        }
        
        console.log('拖拽棋子新位置:', draggedTileNewPos);
        
        // 获取与被拖拽麻将子相关的消除选项
        const eliminableOptions = this.getEliminableOptionsForTile(draggedTileNewPos.row, draggedTileNewPos.col);
        
        console.log('可消除选项数量:', eliminableOptions.length);
        
        if (eliminableOptions.length === 0) {
            // 没有可消除的选项，回退移动
            console.log('没有可消除的选项，回退移动');
            this.rollbackLastMove();
        } else if (eliminableOptions.length === 1) {
            // 只有一个可消除选项，自动消除
            console.log('只有一个可消除选项，自动消除');
            const option = eliminableOptions[0];
            this.eliminatePair(option.row1, option.col1, option.row2, option.col2);
            this.clearSelection();
        } else {
            // 有多个可消除选项，选中被拖拽的麻将子并高亮其可消除选项
            console.log('有多个可消除选项，高亮显示');
            this.selectedTile = { row: draggedTileNewPos.row, col: draggedTileNewPos.col };
            const tileElement = document.querySelector(`[data-row="${draggedTileNewPos.row}"][data-col="${draggedTileNewPos.col}"]`);
            if (tileElement) {
                tileElement.classList.add('selected');
            }
            this.highlightEliminable(draggedTileNewPos.row, draggedTileNewPos.col);
        }
    }

    findDraggedTileNewPosition() {
        // 根据移动历史找到被拖拽麻将子的新位置
        if (this.moveHistory.length === 0) {
            return null;
        }
        
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        
        // 根据移动方向和距离计算新位置
        const directions = {
            'up': [-1, 0],
            'down': [1, 0],
            'left': [0, -1],
            'right': [0, 1]
        };
        
        const delta = directions[lastMove.direction];
        if (!delta) {
            return null;
        }
        
        // 使用移动记录中的起始位置来计算新位置
        const newRow = lastMove.startRow + delta[0] * lastMove.distance;
        const newCol = lastMove.startCol + delta[1] * lastMove.distance;
        
        // 检查新位置是否有效且有麻将子
        if (newRow >= 0 && newRow < this.boardSize && 
            newCol >= 0 && newCol < this.boardSize && 
            this.board[newRow][newCol]) {
            return { row: newRow, col: newCol };
        }
        
        return null;
    }

    getEliminableOptionsForTile(row, col) {
        const options = [];
        const currentTile = this.board[row][col];
        
        if (!currentTile) {
            return options;
        }
        
        // 检查与当前麻将子可消除的所有配对
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (r === row && c === col) continue;
                
                const targetTile = this.board[r][c];
                if (!targetTile) continue;
                
                // 只检查相同类型的麻将子
                if (targetTile.type === currentTile.type) {
                    if (this.canEliminate(row, col, r, c)) {
                        // 判断是相邻还是同行/同列
                        const isAdjacent = Math.abs(row - r) + Math.abs(col - c) === 1;
                        options.push({
                            row1: row, col1: col,
                            row2: r, col2: c,
                            type: isAdjacent ? 'adjacent' : 'line'
                        });
                    }
                }
            }
        }
        
        return options;
    }

    rollbackLastMove() {
        console.log('=== 回退最后一次移动 ===');
        
        // 回退最后一次移动
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory.pop();
            
            console.log('回退的移动:', {
                startPos: `(${lastMove.startRow},${lastMove.startCol})`,
                direction: lastMove.direction,
                distance: lastMove.distance
            });
            
            // 恢复棋盘状态
            this.board = lastMove.previousBoard;
            this.score = lastMove.score;
            
            // 更新UI
            this.updateUndoButton();
            this.renderBoard();
            this.updateUI();
            
            // 显示回退反馈
            this.showRollbackFeedback();
            
            console.log('移动已回退，显示回退反馈');
        } else {
            console.log('没有可回退的移动');
        }
    }

    showRollbackFeedback() {
        // 显示回退的视觉反馈
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.classList.add('rollback-feedback');
            setTimeout(() => {
                gameBoard.classList.remove('rollback-feedback');
            }, 1000);
        }
    }

    /* ==================== 点击事件处理 ==================== */

    /**
     * 处理棋子点击事件
     * 实现棋子选择、自动消除等逻辑
     * @param {MouseEvent} e - 点击事件对象
     */
    handleClick(e) {
        // 如果正在拖拽，忽略点击事件
        if (this.isDragging) return;

        const target = e.target;
        // 只处理棋子的点击
        if (!target.classList.contains('tile') || !target.dataset.type) return;

        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);

        if (this.selectedTile) {
            // 如果点击的是同一个麻将子，取消选择
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                this.clearSelection();
                return;
            }
            
            // 检查是否可以消除
            if (this.canEliminate(this.selectedTile.row, this.selectedTile.col, row, col)) {
                this.eliminatePair(this.selectedTile.row, this.selectedTile.col, row, col);
                this.clearSelection();
            } else {
                // 如果不能消除，选择新的麻将子
                this.clearSelection();
                this.selectTileWithSmartElimination(row, col, target);
            }
        } else {
            // 第一次选择麻将子，检查智能消除
            this.selectTileWithSmartElimination(row, col, target);
        }
    }

    /**
     * 智能消除选择
     * 当选择一个棋子时，自动检查消除机会并执行相应操作
     * @param {number} row - 棋子行位置
     * @param {number} col - 棋子列位置
     * @param {HTMLElement} target - 棋子DOM元素
     */
    selectTileWithSmartElimination(row, col, target) {
        // 检查当前棋子可以消除的所有相同类型棋子
        const eliminableOptions = this.getEliminableOptionsForTile(row, col);
        
        if (eliminableOptions.length === 1) {
            // 只有一个可消除选项，直接自动消除
            const option = eliminableOptions[0];
            this.eliminatePair(option.row1, option.col1, option.row2, option.col2);
        } else if (eliminableOptions.length > 1) {
            // 有多个可消除选项，选择当前棋子并高亮所有可消除的选项
            this.selectedTile = { row, col };
            target.classList.add('selected');
            this.highlightEliminable(row, col);
        } else {
            // 没有可消除的选项，依然选择这个棋子（让用户知道棋子类型）
            this.selectedTile = { row, col };
            target.classList.add('selected');
        }
    }

    getAdjacentSameTiles(row, col) {
        const currentTile = this.board[row][col];
        if (!currentTile) return [];

        const adjacentPositions = [
            { row: row - 1, col: col }, // 上
            { row: row + 1, col: col }, // 下
            { row: row, col: col - 1 }, // 左
            { row: row, col: col + 1 }  // 右
        ];

        const adjacentSameTiles = [];
        
        for (const pos of adjacentPositions) {
            if (pos.row >= 0 && pos.row < this.boardSize && 
                pos.col >= 0 && pos.col < this.boardSize) {
                const adjacentTile = this.board[pos.row][pos.col];
                if (adjacentTile && adjacentTile.type === currentTile.type) {
                    adjacentSameTiles.push(pos);
                }
            }
        }

        return adjacentSameTiles;
    }

    /* ==================== 消除逻辑 ==================== */

    /**
     * 判断两个棋子是否可以消除
     * @param {number} row1 - 第一个棋子的行位置
     * @param {number} col1 - 第一个棋子的列位置
     * @param {number} row2 - 第二个棋子的行位置
     * @param {number} col2 - 第二个棋子的列位置
     * @returns {boolean} 是否可以消除
     */
    canEliminate(row1, col1, row2, col2) {
        const tile1 = this.board[row1][col1];
        const tile2 = this.board[row2][col2];

        // 基础条件：两个棋子都存在且类型相同
        if (!tile1 || !tile2 || tile1.type !== tile2.type) {
            return false;
        }

        // 情况1：相邻的棋子可以直接消除
        if (this.isAdjacent(row1, col1, row2, col2)) {
            return true;
        }

        // 情况2：同一行且中间无障碍物
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            // 检查两个棋子之间是否有其他棋子阻挡
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[row1][col]) {
                    return false;  // 有阻挡，不能消除
                }
            }
            return true;  // 路径畅通，可以消除
        }

        // 情况3：同一列且中间无障碍物
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            // 检查两个棋子之间是否有其他棋子阻挡
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][col1]) {
                    return false;  // 有阻挡，不能消除
                }
            }
            return true;  // 路径畅通，可以消除
        }

        return false;  // 不满足任何消除条件
    }

    /**
     * 判断两个棋子是否相邻
     * @param {number} row1 - 第一个棋子的行位置
     * @param {number} col1 - 第一个棋子的列位置
     * @param {number} row2 - 第二个棋子的行位置
     * @param {number} col2 - 第二个棋子的列位置
     * @returns {boolean} 是否相邻
     */
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        // 相邻定义：行差1列差0，或行差0列差1
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * 执行棋子消除
     * @param {number} row1 - 第一个棋子的行位置
     * @param {number} col1 - 第一个棋子的列位置
     * @param {number} row2 - 第二个棋子的行位置
     * @param {number} col2 - 第二个棋子的列位置
     */
    eliminatePair(row1, col1, row2, col2) {
        // 找到对应的DOM元素并添加消除动画
        const tile1Element = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const tile2Element = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        tile1Element.classList.add('eliminating');
        tile2Element.classList.add('eliminating');

        // 延迟执行消除，让动画播放完成
        setTimeout(() => {
            this.board[row1][col1] = null;    // 清除第一个棋子
            this.board[row2][col2] = null;    // 清除第二个棋子
            this.score += 10;                 // 增加分数
            this.renderBoard();               // 重新渲染棋盘
            this.updateUI();                  // 更新UI显示
            this.checkWin();                  // 检查是否胜利
        }, 500);
    }

    highlightEliminable(row, col) {
        const currentTile = this.board[row][col];
        if (!currentTile) return;

        // 清除之前的高亮
        document.querySelectorAll('.tile.highlight, .tile.adjacent-highlight').forEach(tile => {
            tile.classList.remove('highlight', 'adjacent-highlight');
        });

        // 获取相邻的相同麻将子
        const adjacentSameTiles = this.getAdjacentSameTiles(row, col);

        // 高亮所有可消除的麻将子
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (r === row && c === col) continue;
                if (this.canEliminate(row, col, r, c)) {
                    const tileElement = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (tileElement) {
                        // 如果是相邻的相同麻将子，使用特殊高亮
                        const isAdjacent = adjacentSameTiles.some(pos => pos.row === r && pos.col === c);
                        if (isAdjacent) {
                            tileElement.classList.add('adjacent-highlight');
                        } else {
                            tileElement.classList.add('highlight');
                        }
                    }
                }
            }
        }
    }

    clearSelection() {
        document.querySelectorAll('.tile.selected, .tile.highlight, .tile.adjacent-highlight').forEach(tile => {
            tile.classList.remove('selected', 'highlight', 'adjacent-highlight');
        });
        this.selectedTile = null;
    }

    // 提示功能
    showHint() {
        if (this.hintHighlighted) {
            // 如果已经显示了提示，清除它
            this.clearHint();
            return;
        }

        // 寻找可消除的配对
        const eliminableOptions = this.getAllEliminableOptions();
        
        if (eliminableOptions.length > 0) {
            // 随机选择一个可消除的配对
            const randomOption = eliminableOptions[Math.floor(Math.random() * eliminableOptions.length)];
            
            // 高亮显示这个配对
            const tile1Element = document.querySelector(`[data-row="${randomOption.row1}"][data-col="${randomOption.col1}"]`);
            const tile2Element = document.querySelector(`[data-row="${randomOption.row2}"][data-col="${randomOption.col2}"]`);
            
            if (tile1Element && tile2Element) {
                tile1Element.classList.add('hint-highlight');
                tile2Element.classList.add('hint-highlight');
                this.hintHighlighted = true;
                
                // 3秒后自动清除提示
                setTimeout(() => {
                    this.clearHint();
                }, 3000);
            }
        } else {
            // 没有可消除的配对
            alert('当前没有可消除的配对！尝试移动麻将子创造消除机会。');
        }
    }

    clearHint() {
        document.querySelectorAll('.tile.hint-highlight').forEach(tile => {
            tile.classList.remove('hint-highlight');
        });
        this.hintHighlighted = false;
    }

    getAllEliminableOptions() {
        const options = [];
        
        // 遍历所有位置，找出所有可消除的配对
        for (let row1 = 0; row1 < this.boardSize; row1++) {
            for (let col1 = 0; col1 < this.boardSize; col1++) {
                const tile1 = this.board[row1][col1];
                if (!tile1) continue;
                
                // 检查所有其他位置的可消除配对
                for (let row2 = 0; row2 < this.boardSize; row2++) {
                    for (let col2 = 0; col2 < this.boardSize; col2++) {
                        if (row1 === row2 && col1 === col2) continue;
                        // 避免重复添加同一对麻将（只保留一个方向）
                        if (row1 > row2 || (row1 === row2 && col1 >= col2)) continue;
                        
                        const tile2 = this.board[row2][col2];
                        if (!tile2) continue;
                        
                        if (this.canEliminate(row1, col1, row2, col2)) {
                            // 判断是相邻还是同行/同列
                            const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
                            options.push({
                                row1: row1, col1: col1,
                                row2: row2, col2: col2,
                                type: isAdjacent ? 'adjacent' : 'line'
                            });
                        }
                    }
                }
            }
        }
        
        return options;
    }

    // 撤销功能
    undoLastMove() {
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory.pop();
            
            // 恢复棋盘状态
            this.board = lastMove.previousBoard;
            this.score = lastMove.score;
            
            // 更新UI
            this.updateUndoButton();
            this.renderBoard();
            this.updateUI();
            this.clearSelection();
        }
    }

    // UI更新
    updateUI() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
            
        // 计算剩余对数
        const remainingTiles = {};
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile) {
                    remainingTiles[tile.type] = (remainingTiles[tile.type] || 0) + 1;
                }
            }
        }
        
        let totalPairs = 0;
        for (const type in remainingTiles) {
            totalPairs += Math.floor(remainingTiles[type] / 2);
        }
        
        const pairsElement = document.getElementById('pairs-left');
        if (pairsElement) {
            pairsElement.textContent = totalPairs;
        }
    }

    checkWin() {
        const hasRemainingTiles = this.board.some(row => row.some(tile => tile !== null));
        
        if (!hasRemainingTiles) {
            setTimeout(() => {
                this.showWinMessage();
            }, 600);
        }
    }

    showWinMessage() {
        alert('🎉 恭喜您获得胜利！所有麻将子都已消除！');
    }

    restart() {
        this.score = 0;
        this.selectedTile = null;
        this.isDragging = false;
        this.dragStartPos = null;
        this.dragEndPos = null;
        this.dragTiles = [];
        this.moveHistory = [];
        this.eliminationHistory = [];
        this.hintHighlighted = false;
        this.clearSelection();
        this.clearHint();
        this.init();
    }
}

/* ==================== 游戏初始化 ==================== */

/**
 * 当DOM加载完成后初始化游戏
 * 创建游戏实例并暴露到全局作用域以便调试
 */
document.addEventListener('DOMContentLoaded', () => {
    const game = new MahjongGame();
    // 将游戏实例暴露到全局，便于调试和测试
    window.mahjongGame = game;
});
