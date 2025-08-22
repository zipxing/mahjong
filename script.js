

function MahjongGame() {
    
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

MahjongGame.prototype.init = function() {
        this.createBoard();
        this.generatePairs();
        this.shuffleBoard();
        this.renderBoard();
        this.attachEventListeners();
        this.updateUI();
};

MahjongGame.prototype.createBoard = function() {
    this.board = [];
    for (var i = 0; i < this.boardSize; i++) {
        this.board[i] = [];
        for (var j = 0; j < this.boardSize; j++) {
            this.board[i][j] = null;
        }
    }
};

MahjongGame.prototype.generatePairs = function() {
    var totalTiles = this.boardSize * this.boardSize;
    var tilesNeeded = totalTiles / 2; // 每种麻将子需要的对数
    var tilesPerType = Math.floor(tilesNeeded / this.tileTypes.length) * 2;
    var extraTiles = (tilesNeeded % this.tileTypes.length) * 2;
    
    var tiles = [];
        
        // 为每种类型生成偶数个麻将子
    for (var i = 0; i < this.tileTypes.length; i++) {
        var count = tilesPerType + (i < extraTiles / 2 ? 2 : 0);
        for (var j = 0; j < count; j++) {
                tiles.push({
                    type: i,
                    symbol: this.tileTypes[i],
                id: i + '-' + j
                });
            }
        }

        // 填充棋盘
    var tileIndex = 0;
    for (var row = 0; row < this.boardSize; row++) {
        for (var col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    this.board[row][col] = tiles[tileIndex++];
            }
        }
    }
};

MahjongGame.prototype.shuffleBoard = function() {
        // Fisher-Yates 洗牌算法
    var tiles = [];
    for (var row = 0; row < this.boardSize; row++) {
        for (var col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    tiles.push(this.board[row][col]);
                }
            }
        }

    for (var i = tiles.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = temp;
        }

        // 重新填充棋盘
    var tileIndex = 0;
    for (var row = 0; row < this.boardSize; row++) {
        for (var col = 0; col < this.boardSize; col++) {
                this.board[row][col] = tiles[tileIndex++] || null;
        }
    }
};

MahjongGame.prototype.renderBoard = function() {
    var gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

    for (var row = 0; row < this.boardSize; row++) {
        for (var col = 0; col < this.boardSize; col++) {
            var tile = this.board[row][col];
            var tileElement = document.createElement('div');
                tileElement.className = 'tile';
            tileElement.setAttribute('data-row', row);
            tileElement.setAttribute('data-col', col);

                if (tile) {
                    tileElement.textContent = tile.symbol;
                tileElement.classList.add('tile-type-' + tile.type);
                tileElement.setAttribute('data-type', tile.type);
                tileElement.setAttribute('data-id', tile.id);
                }

                gameBoard.appendChild(tileElement);
            }
        }
};

MahjongGame.prototype.attachEventListeners = function() {
    var gameBoard = document.getElementById('game-board');
    var restartBtn = document.getElementById('restart-btn');
    var hintBtn = document.getElementById('hint-btn');
    var undoBtn = document.getElementById('undo-btn');

    var self = this;

        // 鼠标事件
    gameBoard.addEventListener('mousedown', function(e) { self.handleMouseDown(e); });
    gameBoard.addEventListener('mousemove', function(e) { self.handleMouseMove(e); });
    gameBoard.addEventListener('mouseup', function(e) { self.handleMouseUp(e); });
    gameBoard.addEventListener('click', function(e) { self.handleClick(e); });

        // 触摸事件（移动端支持）
    gameBoard.addEventListener('touchstart', function(e) { self.handleTouchStart(e); }, { passive: false });
    gameBoard.addEventListener('touchmove', function(e) { self.handleTouchMove(e); }, { passive: false });
    gameBoard.addEventListener('touchend', function(e) { self.handleTouchEnd(e); }, { passive: false });

    // 按钮事件
    restartBtn.addEventListener('click', function() { self.restart(); });
    hintBtn.addEventListener('click', function() { self.showHint(); });
    undoBtn.addEventListener('click', function() { self.undoLastMove(); });

        // 防止拖拽时选中文本
    gameBoard.addEventListener('selectstart', function(e) { e.preventDefault(); });
};

MahjongGame.prototype.handleClick = function(e) {
    if (this.isDragging) {
        return;
    }

    var target = e.target;
    
    if (!target.classList.contains('tile') || !target.getAttribute('data-type')) {
        return;
    }

    var row = parseInt(target.getAttribute('data-row'));
    var col = parseInt(target.getAttribute('data-col'));

    // 始终使用智能消除逻辑，无论是否已有选中的麻将子
    // 首先检查当前点击的麻将子是否有可直接消除的配对
    var eliminableTiles = this.getDirectlyEliminableTiles(row, col);
    

    
    if (eliminableTiles.length > 0) {
        // 有可直接消除的麻将子
        this.clearSelection(); // 清除之前的选择
        
        if (eliminableTiles.length === 1) {
            // 只有一个可消除的选项，直接消除
            this.eliminatePair(row, col, eliminableTiles[0].row, eliminableTiles[0].col);
        } else {
            // 有多个可消除的选项，优先选择相邻的
            var adjacentTile = null;
            for (var i = 0; i < eliminableTiles.length; i++) {
                if (this.isAdjacent(row, col, eliminableTiles[i].row, eliminableTiles[i].col)) {
                    adjacentTile = eliminableTiles[i];
                    break;
                }
            }
            
            if (adjacentTile) {
                console.log('智能消除(相邻): (' + row + ', ' + col + ') 与 (' + adjacentTile.row + ', ' + adjacentTile.col + ')');
                this.eliminatePair(row, col, adjacentTile.row, adjacentTile.col);
                } else {
                // 没有相邻的，选择第一个
                console.log('智能消除(远距离): (' + row + ', ' + col + ') 与 (' + eliminableTiles[0].row + ', ' + eliminableTiles[0].col + ')');
                this.eliminatePair(row, col, eliminableTiles[0].row, eliminableTiles[0].col);
            }
        }
        return;
    }

    // 没有可直接消除的麻将子，使用传统的双击逻辑
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
            this.selectedTile = { row: row, col: col };
            target.classList.add('selected');
            this.highlightEliminable(row, col);
        }
    } else {
        // 第一次选择麻将子
        this.selectedTile = { row: row, col: col };
        target.classList.add('selected');
        this.highlightEliminable(row, col);
    }
};

MahjongGame.prototype.getDirectlyEliminableTiles = function(row, col) {
    var currentTile = this.board[row][col];
        if (!currentTile) return [];

    var eliminableTiles = [];
    
    // 检查所有位置的相同类型麻将子
    for (var r = 0; r < this.boardSize; r++) {
        for (var c = 0; c < this.boardSize; c++) {
            if (r === row && c === col) continue; // 跳过自己
            
            var targetTile = this.board[r][c];
            if (!targetTile || targetTile.type !== currentTile.type) continue;
            
            // 检查是否可以直接消除（相邻或同行/列无障碍）
            var canElim = this.canEliminate(row, col, r, c);
            console.log('检查 (' + row + ', ' + col + ') 与 (' + r + ', ' + c + '): 相同类型=' + (targetTile.type === currentTile.type) + ', 可消除=' + canElim);
            
            if (canElim) {
                eliminableTiles.push({ row: r, col: c });
            }
        }
    }

    return eliminableTiles;
};

MahjongGame.prototype.canEliminate = function(row1, col1, row2, col2) {
    var tile1 = this.board[row1][col1];
    var tile2 = this.board[row2][col2];

        if (!tile1 || !tile2 || tile1.type !== tile2.type) {
            return false;
        }

        // 相邻的麻将子
        if (this.isAdjacent(row1, col1, row2, col2)) {
            return true;
        }

        // 同一行且中间无障碍
        if (row1 === row2) {
        var minCol = Math.min(col1, col2);
        var maxCol = Math.max(col1, col2);
        for (var col = minCol + 1; col < maxCol; col++) {
                if (this.board[row1][col]) {
                    return false;
                }
            }
            return true;
        }

        // 同一列且中间无障碍
        if (col1 === col2) {
        var minRow = Math.min(row1, row2);
        var maxRow = Math.max(row1, row2);
        for (var row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][col1]) {
                    return false;
                }
            }
            return true;
        }

        return false;
};

MahjongGame.prototype.isAdjacent = function(row1, col1, row2, col2) {
    var rowDiff = Math.abs(row1 - row2);
    var colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

MahjongGame.prototype.eliminatePair = function(row1, col1, row2, col2) {
    console.log('消除配对: (' + row1 + ', ' + col1 + ') 和 (' + row2 + ', ' + col2 + ')');
    
    // 保存消除前的状态
    this.eliminationHistory.push({
        type: 'elimination',
        tile1: { row: row1, col: col1, data: this.deepCopyTile(this.board[row1][col1]) },
        tile2: { row: row2, col: col2, data: this.deepCopyTile(this.board[row2][col2]) },
        boardState: this.deepCopyBoard(),
        score: this.score
    });

        // 添加消除动画
    var tile1Element = document.querySelector('[data-row="' + row1 + '"][data-col="' + col1 + '"]');
    var tile2Element = document.querySelector('[data-row="' + row2 + '"][data-col="' + col2 + '"]');
    
    if (tile1Element) tile1Element.classList.add('eliminating');
    if (tile2Element) tile2Element.classList.add('eliminating');

    var self = this;
    setTimeout(function() {
        self.board[row1][col1] = null;
        self.board[row2][col2] = null;
        self.score += 10;
        self.updateUndoButton();
        self.renderBoard();
        self.updateUI();
        self.checkWin();
        }, 500);
};

MahjongGame.prototype.highlightEliminable = function(row, col) {
    var currentTile = this.board[row][col];
        if (!currentTile) return;

        // 清除之前的高亮
    var highlightElements = document.querySelectorAll('.tile.highlight, .tile.adjacent-highlight');
    for (var i = 0; i < highlightElements.length; i++) {
        highlightElements[i].classList.remove('highlight', 'adjacent-highlight');
    }

        // 获取相邻的相同麻将子
    var adjacentSameTiles = this.getAdjacentSameTiles(row, col);

        // 高亮所有可消除的麻将子
    for (var r = 0; r < this.boardSize; r++) {
        for (var c = 0; c < this.boardSize; c++) {
                if (r === row && c === col) continue;
                if (this.canEliminate(row, col, r, c)) {
                var tileElement = document.querySelector('[data-row="' + r + '"][data-col="' + c + '"]');
                    if (tileElement) {
                        // 如果是相邻的相同麻将子，使用特殊高亮
                    var isAdjacent = false;
                    for (var j = 0; j < adjacentSameTiles.length; j++) {
                        if (adjacentSameTiles[j].row === r && adjacentSameTiles[j].col === c) {
                            isAdjacent = true;
                            break;
                        }
                    }
                    
                        if (isAdjacent) {
                            tileElement.classList.add('adjacent-highlight');
                        } else {
                            tileElement.classList.add('highlight');
                        }
                    }
                }
        }
    }
};

MahjongGame.prototype.getAdjacentSameTiles = function(row, col) {
    var currentTile = this.board[row][col];
    if (!currentTile) return [];

    var adjacentPositions = [
        { row: row - 1, col: col }, // 上
        { row: row + 1, col: col }, // 下
        { row: row, col: col - 1 }, // 左
        { row: row, col: col + 1 }  // 右
    ];

    var adjacentSameTiles = [];
    
    for (var i = 0; i < adjacentPositions.length; i++) {
        var pos = adjacentPositions[i];
        if (pos.row >= 0 && pos.row < this.boardSize && 
            pos.col >= 0 && pos.col < this.boardSize) {
            var adjacentTile = this.board[pos.row][pos.col];
            if (adjacentTile && adjacentTile.type === currentTile.type) {
                adjacentSameTiles.push(pos);
            }
        }
    }

    return adjacentSameTiles;
};

MahjongGame.prototype.clearSelection = function() {
    var selectedElements = document.querySelectorAll('.tile.selected, .tile.highlight, .tile.adjacent-highlight');
    for (var i = 0; i < selectedElements.length; i++) {
        selectedElements[i].classList.remove('selected', 'highlight', 'adjacent-highlight');
    }
        this.selectedTile = null;
};

MahjongGame.prototype.updateUI = function() {
    var scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = this.score;
    }
        
        // 计算剩余对数
    var remainingTiles = {};
    for (var row = 0; row < this.boardSize; row++) {
        for (var col = 0; col < this.boardSize; col++) {
            var tile = this.board[row][col];
                if (tile) {
                    remainingTiles[tile.type] = (remainingTiles[tile.type] || 0) + 1;
                }
            }
        }
        
    var totalPairs = 0;
    for (var type in remainingTiles) {
        totalPairs += Math.floor(remainingTiles[type] / 2);
    }
    
    var pairsElement = document.getElementById('pairs-left');
    if (pairsElement) {
        pairsElement.textContent = totalPairs;
    }
};

MahjongGame.prototype.checkWin = function() {
    var hasRemainingTiles = false;
    for (var row = 0; row < this.boardSize && !hasRemainingTiles; row++) {
        for (var col = 0; col < this.boardSize && !hasRemainingTiles; col++) {
            if (this.board[row][col] !== null) {
                hasRemainingTiles = true;
            }
        }
    }
    
    if (!hasRemainingTiles) {
        var self = this;
        setTimeout(function() {
            self.showWinMessage();
        }, 600);
    }
};

MahjongGame.prototype.showWinMessage = function() {
    var message = '🎉 恭喜您获得胜利！\n\n✨ 最终得分：' + this.score + ' 分\n💎 所有麻将子都已消除！\n\n是否要重新开始游戏？';
    
    if (confirm(message)) {
        this.restart();
    }
};

MahjongGame.prototype.restart = function() {
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
    this.updateUndoButton();
        this.init();
};

MahjongGame.prototype.deepCopyBoard = function() {
    var copy = [];
    for (var i = 0; i < this.board.length; i++) {
        copy[i] = [];
        for (var j = 0; j < this.board[i].length; j++) {
            copy[i][j] = this.board[i][j] ? this.deepCopyTile(this.board[i][j]) : null;
        }
    }
    return copy;
};

MahjongGame.prototype.deepCopyTile = function(tile) {
    if (!tile) return null;
    return {
        type: tile.type,
        symbol: tile.symbol,
        id: tile.id
    };
};

MahjongGame.prototype.updateUndoButton = function() {
    var undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        var canUndo = this.moveHistory.length > 0 || this.eliminationHistory.length > 0;
        undoBtn.disabled = !canUndo;
    }
};

MahjongGame.prototype.undoLastMove = function() {
    if (this.eliminationHistory.length > 0) {
        // 撤销最后一次消除
        var lastElimination = this.eliminationHistory.pop();
        this.board = lastElimination.boardState;
        this.score = lastElimination.score;
    } else if (this.moveHistory.length > 0) {
        // 撤销最后一次移动
        var lastMove = this.moveHistory.pop();
        this.board = lastMove.previousBoard;
        this.score = lastMove.score;
    }
    
    this.clearSelection();
    this.clearHint();
    this.updateUndoButton();
    this.renderBoard();
    this.updateUI();
};

MahjongGame.prototype.showHint = function() {
    this.clearHint();
    
    // 查找所有可消除的麻将子对
    var eliminablePairs = [];
    
    for (var row1 = 0; row1 < this.boardSize; row1++) {
        for (var col1 = 0; col1 < this.boardSize; col1++) {
            var tile1 = this.board[row1][col1];
            if (!tile1) continue;
            
            for (var row2 = 0; row2 < this.boardSize; row2++) {
                for (var col2 = 0; col2 < this.boardSize; col2++) {
                    if (row1 === row2 && col1 === col2) continue;
                    
                    if (this.canEliminate(row1, col1, row2, col2)) {
                        // 检查是否已经添加过这个配对（避免重复）
                        var pairExists = false;
                        for (var k = 0; k < eliminablePairs.length; k++) {
                            var pair = eliminablePairs[k];
                            if ((pair.pos1.row === row1 && pair.pos1.col === col1 && 
                                 pair.pos2.row === row2 && pair.pos2.col === col2) ||
                                (pair.pos1.row === row2 && pair.pos1.col === col2 && 
                                 pair.pos2.row === row1 && pair.pos2.col === col1)) {
                                pairExists = true;
                                break;
                            }
                        }
                        
                        if (!pairExists) {
                            eliminablePairs.push({
                                pos1: { row: row1, col: col1 },
                                pos2: { row: row2, col: col2 },
                                isAdjacent: this.isAdjacent(row1, col1, row2, col2)
                            });
                        }
                    }
                }
            }
        }
    }
    
    if (eliminablePairs.length > 0) {
        // 优先显示相邻的配对，如果没有则显示第一个
        var pairToShow = null;
        for (var i = 0; i < eliminablePairs.length; i++) {
            if (eliminablePairs[i].isAdjacent) {
                pairToShow = eliminablePairs[i];
                break;
            }
        }
        if (!pairToShow) {
            pairToShow = eliminablePairs[0];
        }
        
        var tile1Element = document.querySelector('[data-row="' + pairToShow.pos1.row + '"][data-col="' + pairToShow.pos1.col + '"]');
        var tile2Element = document.querySelector('[data-row="' + pairToShow.pos2.row + '"][data-col="' + pairToShow.pos2.col + '"]');
        
        if (tile1Element && tile2Element) {
            tile1Element.classList.add('hint-highlight');
            tile2Element.classList.add('hint-highlight');
            this.hintHighlighted = true;
            
            // 3秒后自动清除提示
            var self = this;
            setTimeout(function() {
                self.clearHint();
            }, 3000);
        }
    } else {
        // 没有可消除的配对，检查是否需要移动
        alert('💡 提示：当前没有可直接消除的配对，尝试拖动麻将子来创造消除机会！');
    }
};

MahjongGame.prototype.clearHint = function() {
    var hintElements = document.querySelectorAll('.tile.hint-highlight');
    for (var i = 0; i < hintElements.length; i++) {
        hintElements[i].classList.remove('hint-highlight');
    }
    this.hintHighlighted = false;
};

MahjongGame.prototype.handleMouseDown = function(e) {
    this.startDrag(e.target, e.clientX, e.clientY);
};

MahjongGame.prototype.handleMouseMove = function(e) {
    this.handleDragMove(e.clientX, e.clientY);
};

MahjongGame.prototype.handleMouseUp = function(e) {
    this.endDrag(e.clientX, e.clientY);
};

MahjongGame.prototype.handleTouchStart = function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    
    // 添加触摸反馈
    var target = e.target;
    if (target.classList.contains('tile') && target.getAttribute('data-type')) {
        target.classList.add('touch-active');
    }
    
    this.startDrag(target, touch.clientX, touch.clientY);
};

MahjongGame.prototype.handleTouchMove = function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    this.handleDragMove(touch.clientX, touch.clientY);
};

MahjongGame.prototype.handleTouchEnd = function(e) {
    e.preventDefault();
    
    // 清除触摸反馈
    var touchElements = document.querySelectorAll('.tile.touch-active');
    for (var i = 0; i < touchElements.length; i++) {
        touchElements[i].classList.remove('touch-active');
    }
    
    if (e.changedTouches && e.changedTouches.length > 0) {
        var touch = e.changedTouches[0];
        this.endDrag(touch.clientX, touch.clientY);
    } else {
        this.endDrag();
    }
};

MahjongGame.prototype.startDrag = function(target, clientX, clientY) {
    if (!target.classList.contains('tile') || !target.getAttribute('data-type')) return;

    var row = parseInt(target.getAttribute('data-row'));
    var col = parseInt(target.getAttribute('data-col'));

    // 不立即设置 isDragging，等到真正开始拖动时再设置
    this.dragStartPos = { row: row, col: col, x: clientX, y: clientY };
    // 不在这里设置 selectedTile，让点击事件来处理选择逻辑
};

MahjongGame.prototype.handleDragMove = function(clientX, clientY) {
    if (!this.dragStartPos) return;

    var deltaX = clientX - this.dragStartPos.x;
    var deltaY = clientY - this.dragStartPos.y;
    var threshold = 30; // 拖拽阈值

    // 只有当移动距离超过阈值时，才认为是真正的拖拽
    if (!this.isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
        this.isDragging = true;
        var target = document.querySelector('[data-row="' + this.dragStartPos.row + '"][data-col="' + this.dragStartPos.col + '"]');
        if (target) {
            target.classList.add('dragging');
        }
    }
    
    // 持续更新结束位置
    this.dragEndPos = { x: clientX, y: clientY };
};

MahjongGame.prototype.endDrag = function(endX, endY) {
    // 清除拖拽状态和方向指示器
    var draggingElements = document.querySelectorAll('.tile.dragging');
    for (var i = 0; i < draggingElements.length; i++) {
        draggingElements[i].classList.remove('dragging');
    }
    this.clearDragIndicators();

    if (this.isDragging && this.dragStartPos && (endX !== undefined && endY !== undefined)) {
        // 计算松手时的移动方向和距离
        var deltaX = endX - this.dragStartPos.x;
        var deltaY = endY - this.dragStartPos.y;
        var threshold = 30;
        
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            // 基于网格位置计算移动
            var targetGridPos = this.getGridPositionFromScreenCoords(endX, endY);
            var startGridPos = { row: this.dragStartPos.row, col: this.dragStartPos.col };
            
            console.log('拖拽位置:', '起始网格(' + startGridPos.row + ',' + startGridPos.col + ')', '目标网格(' + targetGridPos.row + ',' + targetGridPos.col + ')');
            
            // 计算实际的网格移动距离和方向
            var gridDeltaX = targetGridPos.col - startGridPos.col;
            var gridDeltaY = targetGridPos.row - startGridPos.row;
            
            var direction = '';
            var steps = 0;
            
            // 确定主要移动方向
            if (Math.abs(gridDeltaX) > Math.abs(gridDeltaY)) {
                // 水平移动
                direction = gridDeltaX > 0 ? 'right' : 'left';
                steps = Math.abs(gridDeltaX);
            } else if (Math.abs(gridDeltaY) > 0) {
                // 垂直移动
                direction = gridDeltaY > 0 ? 'down' : 'up';
                steps = Math.abs(gridDeltaY);
            }
            
            // 限制最大移动步数，防止意外的大距离移动
            steps = Math.min(steps, 4);
            
            console.log('网格移动计算:', '方向=' + direction, '步数=' + steps, 'gridDelta=(' + gridDeltaX + ',' + gridDeltaY + ')');
            
            if (steps > 0) {
                // 执行移动
                var actualMoved = this.moveTiles(this.dragStartPos.row, this.dragStartPos.col, direction, steps);
                
                // 更新拖拽起始位置到移动后的位置
                if (actualMoved > 0) {
                    this.updateDragPositionByDistance(direction, actualMoved);
                    // 移动后检查消除
                    this.checkElimination();
                } else {
                    // 如果没有移动成功，给出视觉反馈
                    this.showMoveFailedFeedback(this.dragStartPos.row, this.dragStartPos.col);
                }
            }
        }
    }

    this.isDragging = false;
    this.dragStartPos = null;
    this.dragEndPos = null;
    this.dragTiles = [];
    
    // 清除在 startDrag 中可能设置的 selectedTile
    // 如果没有真正拖拽，让点击事件来处理选择
};

MahjongGame.prototype.getGridPositionFromScreenCoords = function(screenX, screenY) {
    // 获取游戏板的位置和尺寸
    var gameBoard = document.getElementById('game-board');
    var rect = gameBoard.getBoundingClientRect();
    
    // 计算相对于游戏板的坐标
    var relativeX = screenX - rect.left;
    var relativeY = screenY - rect.top;
    
    // 计算每个网格的大小
    var gridWidth = rect.width / this.boardSize;
    var gridHeight = rect.height / this.boardSize;
    
    // 计算网格位置
    var col = Math.floor(relativeX / gridWidth);
    var row = Math.floor(relativeY / gridHeight);
    
    // 确保坐标在有效范围内
    col = Math.max(0, Math.min(this.boardSize - 1, col));
    row = Math.max(0, Math.min(this.boardSize - 1, row));
    
    return { row: row, col: col };
};

MahjongGame.prototype.updateDragPositionByDistance = function(direction, distance) {
    // 更新拖拽起始位置到移动后的新位置
    var directions = {
        'up': [-1, 0],
        'down': [1, 0],
        'left': [0, -1],
        'right': [0, 1]
    };
    
    var deltaRow = directions[direction][0];
    var deltaCol = directions[direction][1];
    var newRow = this.dragStartPos.row + deltaRow * distance;
    var newCol = this.dragStartPos.col + deltaCol * distance;
    
    // 检查新位置是否有效且有麻将子
    if (newRow >= 0 && newRow < this.boardSize && 
        newCol >= 0 && newCol < this.boardSize && 
        this.board[newRow][newCol]) {
        this.dragStartPos.row = newRow;
        this.dragStartPos.col = newCol;
    }
};

MahjongGame.prototype.clearDragIndicators = function() {
    var previewElements = document.querySelectorAll('.tile.move-preview');
    for (var i = 0; i < previewElements.length; i++) {
        previewElements[i].classList.remove('move-preview');
    }
};

MahjongGame.prototype.showMoveFailedFeedback = function(row, col) {
    var tileElement = document.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
    if (tileElement) {
        tileElement.classList.add('move-failed');
        setTimeout(function() {
            tileElement.classList.remove('move-failed');
        }, 500);
    }
};

MahjongGame.prototype.moveTiles = function(startRow, startCol, direction, moveDistance) {
    if (typeof moveDistance === 'undefined') moveDistance = 1;
    
    // 验证起始位置是否有效
    if (!this.board[startRow] || !this.board[startRow][startCol]) {
        console.log('移动失败：起始位置没有麻将子');
        return 0;
    }
    
    console.log('开始移动:', '起始位置(' + startRow + ',' + startCol + ')', '方向:' + direction, '距离:' + moveDistance);
    
    // 保存移动前的状态
    var previousBoard = this.deepCopyBoard();
    
    var directions = {
        'up': [-1, 0],
        'down': [1, 0],
        'left': [0, -1],
        'right': [0, 1]
    };

    var deltaRow = directions[direction][0];
    var deltaCol = directions[direction][1];
    var tilesToMove = [];

    // 找到需要移动的所有麻将子
    if (direction === 'up') {
        for (var row = startRow; row >= 0; row--) {
            if (this.board[row][startCol]) {
                tilesToMove.push({ row: row, col: startCol });
            } else {
                break;
            }
        }
    } else if (direction === 'down') {
        for (var row = startRow; row < this.boardSize; row++) {
            if (this.board[row][startCol]) {
                tilesToMove.push({ row: row, col: startCol });
            } else {
                break;
            }
        }
    } else if (direction === 'left') {
        for (var col = startCol; col >= 0; col--) {
            if (this.board[startRow][col]) {
                tilesToMove.push({ row: startRow, col: col });
            } else {
                break;
            }
        }
    } else if (direction === 'right') {
        for (var col = startCol; col < this.boardSize; col++) {
            if (this.board[startRow][col]) {
                tilesToMove.push({ row: startRow, col: col });
            } else {
                break;
            }
        }
    }

    // 计算实际可以移动的最大距离
    var maxDistance = 0;
    for (var i = 0; i < tilesToMove.length; i++) {
        var tile = tilesToMove[i];
        var distance = 0;
        var newRow = tile.row + deltaRow;
        var newCol = tile.col + deltaCol;

        while (newRow >= 0 && newRow < this.boardSize && 
               newCol >= 0 && newCol < this.boardSize) {
            // 检查目标位置是否被占用
            // 如果目标位置有麻将子，且不在当前移动的麻将子列表中，则停止移动
            if (this.board[newRow][newCol]) {
                var isMovingTile = false;
                for (var j = 0; j < tilesToMove.length; j++) {
                    if (tilesToMove[j].row === newRow && tilesToMove[j].col === newCol) {
                        isMovingTile = true;
                        break;
                    }
                }
                if (!isMovingTile) {
                    break; // 遇到障碍物，停止移动
                }
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
    var actualMoveDistance = Math.min(moveDistance, maxDistance);

    // 移动麻将子
    if (actualMoveDistance > 0) {
        // 保存移动记录
        this.moveHistory.push({
            type: 'move',
            previousBoard: previousBoard,
            currentBoard: null, // 将在移动后设置
            score: this.score
        });

        // 根据移动方向确定移动顺序，避免覆盖问题
        if (direction === 'up' || direction === 'left') {
            // 向上或向左移动时，从最远的开始移动
            tilesToMove.reverse();
        }

        // 先将所有要移动的麻将子暂存，然后清空原位置
        var tilesToMoveData = [];
        for (var i = 0; i < tilesToMove.length; i++) {
            var tile = tilesToMove[i];
            tilesToMoveData.push({
                data: this.board[tile.row][tile.col],
                oldRow: tile.row,
                oldCol: tile.col,
                newRow: tile.row + deltaRow * actualMoveDistance,
                newCol: tile.col + deltaCol * actualMoveDistance
            });
        }

        // 清空所有原位置
        for (var i = 0; i < tilesToMoveData.length; i++) {
            this.board[tilesToMoveData[i].oldRow][tilesToMoveData[i].oldCol] = null;
        }

        // 将麻将子放到新位置
        for (var i = 0; i < tilesToMoveData.length; i++) {
            var moveData = tilesToMoveData[i];
            // 验证新位置是否在有效范围内
            if (moveData.newRow >= 0 && moveData.newRow < this.boardSize && 
                moveData.newCol >= 0 && moveData.newCol < this.boardSize) {
                this.board[moveData.newRow][moveData.newCol] = moveData.data;
                console.log('移动麻将子:', '从(' + moveData.oldRow + ',' + moveData.oldCol + ')到(' + moveData.newRow + ',' + moveData.newCol + ')');
            } else {
                console.error('错误：尝试移动到无效位置', moveData);
            }
        }

        console.log('移动完成，实际移动距离:', actualMoveDistance);

        // 保存移动后的状态
        this.moveHistory[this.moveHistory.length - 1].currentBoard = this.deepCopyBoard();
        this.updateUndoButton();

        this.renderBoard();
        return actualMoveDistance; // 返回实际移动的距离
    }
    
    return 0; // 没有移动
};

MahjongGame.prototype.checkElimination = function() {
    // 拖动后不自动消除，只是清除选择状态
    // 让玩家手动点击来决定是否消除
    this.clearSelection();
};

// 游戏初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化游戏');
    var game = new MahjongGame();
    console.log('游戏实例创建完成:', game);
});

console.log('script.js 加载完成');