class MahjongGame {
    constructor() {
        this.boardSize = 8;
        this.tileTypes = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋']; // 8种麻将子
        this.board = [];
        this.score = 0;
        this.selectedTile = null;
        this.isDragging = false;
        this.dragStartPos = null;
        this.dragEndPos = null;
        this.dragTiles = [];
        this.moveHistory = []; // 移动历史记录
        this.eliminationHistory = []; // 消除历史记录
        this.hintHighlighted = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.generatePairs();
        this.shuffleBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updateUI();
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }

    generatePairs() {
        const totalTiles = this.boardSize * this.boardSize;
        const tilesNeeded = totalTiles / 2; // 每种麻将子需要的对数
        const tilesPerType = Math.floor(tilesNeeded / this.tileTypes.length) * 2;
        const extraTiles = (tilesNeeded % this.tileTypes.length) * 2;
        
        const tiles = [];
            
        // 为每种类型生成偶数个麻将子
        for (let i = 0; i < this.tileTypes.length; i++) {
            const count = tilesPerType + (i < extraTiles / 2 ? 2 : 0);
            for (let j = 0; j < count; j++) {
                tiles.push({
                    type: i,
                    symbol: this.tileTypes[i],
                    id: `${i}-${j}`
                });
            }
        }

        // 填充棋盘
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    this.board[row][col] = tiles[tileIndex++];
                }
            }
        }
    }

    shuffleBoard() {
        // Fisher-Yates 洗牌算法
        const tiles = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    tiles.push(this.board[row][col]);
                }
            }
        }

        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        // 重新填充棋盘
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = tiles[tileIndex++] || null;
            }
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                const tileElement = document.createElement('div');
                tileElement.className = 'tile';
                tileElement.setAttribute('data-row', row);
                tileElement.setAttribute('data-col', col);

                if (tile) {
                    tileElement.textContent = tile.symbol;
                    tileElement.classList.add(`tile-type-${tile.type}`);
                    tileElement.setAttribute('data-type', tile.type);
                    tileElement.setAttribute('data-id', tile.id);
                }

                gameBoard.appendChild(tileElement);
            }
        }
    }

    attachEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const restartBtn = document.getElementById('restart-btn');
        const hintBtn = document.getElementById('hint-btn');
        const undoBtn = document.getElementById('undo-btn');

        // 鼠标事件
        gameBoard.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gameBoard.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        gameBoard.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        gameBoard.addEventListener('click', (e) => this.handleClick(e));

        // 触摸事件（移动端支持）
        gameBoard.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        gameBoard.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        gameBoard.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // 按钮事件
        restartBtn.addEventListener('click', () => this.restart());
        hintBtn.addEventListener('click', () => this.showHint());
        undoBtn.addEventListener('click', () => this.undoLastMove());

        // 防止拖拽时选中文本
        gameBoard.addEventListener('selectstart', (e) => e.preventDefault());
    }

    // 事件处理方法
    handleMouseDown(e) {
        this.startDrag(e.target, e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        this.handleDragMove(e.clientX, e.clientY);
    }

    handleMouseUp(e) {
        this.endDrag(e.clientX, e.clientY);
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        
        // 添加触摸反馈
        const target = e.target;
        if (target.classList.contains('tile') && target.getAttribute('data-type')) {
            target.classList.add('touch-active');
        }
        
        this.startDrag(e.target, touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleDragMove(touch.clientX, touch.clientY);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        // 移除触摸反馈
        document.querySelectorAll('.tile.touch-active').forEach(tile => {
            tile.classList.remove('touch-active');
        });
        
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            this.endDrag(touch.clientX, touch.clientY);
        } else {
            this.endDrag();
        }
    }

    startDrag(target, clientX, clientY) {
        if (!target.classList.contains('tile') || !target.getAttribute('data-type')) return;

        const row = parseInt(target.getAttribute('data-row'));
        const col = parseInt(target.getAttribute('data-col'));

        // 不立即设置 isDragging，等到真正开始拖动时再设置
        this.dragStartPos = { row: row, col: col, x: clientX, y: clientY };
    }

    handleDragMove(clientX, clientY) {
        if (!this.dragStartPos) return;

        const deltaX = clientX - this.dragStartPos.x;
        const deltaY = clientY - this.dragStartPos.y;
        const threshold = 30; // 拖拽阈值

        // 只有当移动距离超过阈值时，才认为是真正的拖拽
        if (!this.isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
            this.isDragging = true;
            const target = document.querySelector(`[data-row="${this.dragStartPos.row}"][data-col="${this.dragStartPos.col}"]`);
            if (target) {
                target.classList.add('dragging');
            }
        }
        
        // 持续更新结束位置
        this.dragEndPos = { x: clientX, y: clientY };
    }

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

    // 点击事件处理
    handleClick(e) {
        if (this.isDragging) return;

        const target = e.target;
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

    selectTileWithSmartElimination(row, col, target) {
        // 检查所有可以消除的相同麻将子
        const eliminableOptions = this.getEliminableOptionsForTile(row, col);
        
        if (eliminableOptions.length === 1) {
            // 只有一个可消除的相同麻将子，直接消除
            const option = eliminableOptions[0];
            this.eliminatePair(option.row1, option.col1, option.row2, option.col2);
        } else if (eliminableOptions.length > 1) {
            // 有多个可消除选项，选择当前麻将子并高亮所有可消除的选项
            this.selectedTile = { row, col };
            target.classList.add('selected');
            this.highlightEliminable(row, col);
        } else {
            // 没有可消除的选项，依然选择这个麻将子（用户可能想看看它的类型）
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

    canEliminate(row1, col1, row2, col2) {
        const tile1 = this.board[row1][col1];
        const tile2 = this.board[row2][col2];

        if (!tile1 || !tile2 || tile1.type !== tile2.type) {
            return false;
        }

        // 相邻的麻将子
        if (this.isAdjacent(row1, col1, row2, col2)) {
            return true;
        }

        // 同一行且中间无障碍
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[row1][col]) {
                    return false;
                }
            }
            return true;
        }

        // 同一列且中间无障碍
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][col1]) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    eliminatePair(row1, col1, row2, col2) {
        // 添加消除动画
        const tile1Element = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const tile2Element = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        tile1Element.classList.add('eliminating');
        tile2Element.classList.add('eliminating');

        setTimeout(() => {
            this.board[row1][col1] = null;
            this.board[row2][col2] = null;
            this.score += 10;
            this.renderBoard();
            this.updateUI();
            this.checkWin();
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

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    const game = new MahjongGame();
    // 将游戏实例暴露到全局，便于调试
    window.mahjongGame = game;
});
