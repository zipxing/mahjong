/**
 * 游戏状态管理器
 * 负责管理游戏的各种状态，包括开始、暂停、结束等
 */

export enum GameState {
    LOADING = 'loading',
    MENU = 'menu', 
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over',
    VICTORY = 'victory'
}

export interface GameData {
    currentScore: number;
    targetScore: number;
    moveCount: number;
    remainingBlocks: number;
    elapsedTime: number;
    level: number;
}

export interface GameStatistics {
    totalMoves: number;
    totalScore: number;
    largestElimination: number;
    averageScorePerMove: number;
    playTime: number;
    consecutiveVictories: number;
}

export class GameStateManager {
    
    // 当前游戏状态
    private currentState: GameState = GameState.LOADING;
    private previousState: GameState = GameState.LOADING;
    
    // 游戏数据
    private gameData: GameData = {
        currentScore: 0,
        targetScore: 1000,
        moveCount: 0,
        remainingBlocks: 100,
        elapsedTime: 0,
        level: 1
    };
    
    // 游戏统计
    private gameStatistics: GameStatistics = {
        totalMoves: 0,
        totalScore: 0,
        largestElimination: 0,
        averageScorePerMove: 0,
        playTime: 0,
        consecutiveVictories: 0
    };
    
    // 时间跟踪
    private gameStartTime: number = 0;
    private pauseStartTime: number = 0;
    private totalPausedTime: number = 0;
    
    // 状态变化回调
    private stateChangeCallbacks: Map<GameState, (() => void)[]> = new Map();
    
    /**
     * 初始化游戏状态管理器
     */
    init() {
        this.initializeStateCallbacks();
        this.loadGameStatistics();
        
        console.log('✅ 游戏状态管理器初始化完成');
    }
    
    /**
     * 初始化状态回调映射
     */
    private initializeStateCallbacks() {
        for (const state of Object.values(GameState)) {
            this.stateChangeCallbacks.set(state, []);
        }
    }
    
    /**
     * 设置游戏状态
     */
    setState(newState: GameState) {
        if (this.currentState === newState) {
            console.log(`⚠️ 游戏状态已经是 ${newState}，跳过设置`);
            return;
        }
        
        console.log(`🔄 游戏状态变化: ${this.currentState} -> ${newState}`);
        
        // 处理状态退出逻辑
        this.handleStateExit(this.currentState);
        
        // 更新状态
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // 处理状态进入逻辑
        this.handleStateEnter(newState);
        
        // 调用状态变化回调
        this.triggerStateCallbacks(newState);
    }
    
    /**
     * 处理状态退出逻辑
     */
    private handleStateExit(state: GameState) {
        switch (state) {
            case GameState.PLAYING:
                // 记录游戏时间
                if (this.gameStartTime > 0) {
                    this.gameData.elapsedTime = Date.now() - this.gameStartTime - this.totalPausedTime;
                }
                break;
                
            case GameState.PAUSED:
                // 记录暂停时间
                if (this.pauseStartTime > 0) {
                    this.totalPausedTime += Date.now() - this.pauseStartTime;
                    this.pauseStartTime = 0;
                }
                break;
        }
    }
    
    /**
     * 处理状态进入逻辑
     */
    private handleStateEnter(state: GameState) {
        switch (state) {
            case GameState.PLAYING:
                if (this.gameStartTime === 0) {
                    this.gameStartTime = Date.now();
                    this.totalPausedTime = 0;
                }
                break;
                
            case GameState.PAUSED:
                this.pauseStartTime = Date.now();
                break;
                
            case GameState.GAME_OVER:
            case GameState.VICTORY:
                this.finalizeGameSession();
                break;
        }
    }
    
    /**
     * 结束游戏会话，更新统计数据
     */
    private finalizeGameSession() {
        // 更新游戏统计
        this.gameStatistics.totalMoves += this.gameData.moveCount;
        this.gameStatistics.totalScore += this.gameData.currentScore;
        this.gameStatistics.playTime += this.gameData.elapsedTime;
        
        if (this.gameData.moveCount > 0) {
            this.gameStatistics.averageScorePerMove = 
                this.gameStatistics.totalScore / this.gameStatistics.totalMoves;
        }
        
        if (this.currentState === GameState.VICTORY) {
            this.gameStatistics.consecutiveVictories++;
        } else {
            this.gameStatistics.consecutiveVictories = 0;
        }
        
        // 保存统计数据
        this.saveGameStatistics();
        
        console.log('📊 游戏会话结束，统计数据已更新');
    }
    
    /**
     * 开始新游戏
     */
    startNewGame(level: number = 1, targetScore: number = 1000) {
        console.log(`🎮 开始新游戏 - 关卡: ${level}, 目标分数: ${targetScore}`);
        
        // 重置游戏数据
        this.gameData = {
            currentScore: 0,
            targetScore: targetScore,
            moveCount: 0,
            remainingBlocks: 100, // 10x10 棋盘
            elapsedTime: 0,
            level: level
        };
        
        // 重置时间跟踪
        this.gameStartTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        
        // 设置为游戏中状态
        this.setState(GameState.PLAYING);
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.currentState === GameState.PLAYING) {
            this.setState(GameState.PAUSED);
        }
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.currentState === GameState.PAUSED) {
            this.setState(GameState.PLAYING);
        }
    }
    
    /**
     * 结束游戏
     */
    endGame(isVictory: boolean = false) {
        const newState = isVictory ? GameState.VICTORY : GameState.GAME_OVER;
        this.setState(newState);
    }
    
    /**
     * 更新游戏数据
     */
    updateGameData(updates: Partial<GameData>) {
        Object.assign(this.gameData, updates);
        
        // 检查胜利条件
        if (updates.currentScore !== undefined && 
            this.gameData.currentScore >= this.gameData.targetScore) {
            this.endGame(true);
        }
        
        // 检查失败条件（如果需要的话）
        // 例如：无可消除方块且分数不足
    }
    
    /**
     * 记录消除操作
     */
    recordElimination(blocksEliminated: number, scoreGained: number) {
        this.gameData.moveCount++;
        this.gameData.currentScore += scoreGained;
        this.gameData.remainingBlocks -= blocksEliminated;
        
        // 更新最大消除记录
        if (blocksEliminated > this.gameStatistics.largestElimination) {
            this.gameStatistics.largestElimination = blocksEliminated;
        }
        
        console.log(`📝 记录消除: ${blocksEliminated} 个方块, +${scoreGained} 分`);
    }
    
    /**
     * 获取当前游戏状态
     */
    getCurrentState(): GameState {
        return this.currentState;
    }
    
    /**
     * 获取上一个游戏状态
     */
    getPreviousState(): GameState {
        return this.previousState;
    }
    
    /**
     * 获取游戏数据
     */
    getGameData(): GameData {
        return { ...this.gameData };
    }
    
    /**
     * 获取游戏统计
     */
    getGameStatistics(): GameStatistics {
        return { ...this.gameStatistics };
    }
    
    /**
     * 检查是否可以进行游戏操作
     */
    canPerformGameAction(): boolean {
        return this.currentState === GameState.PLAYING;
    }
    
    /**
     * 检查游戏是否结束
     */
    isGameEnded(): boolean {
        return this.currentState === GameState.GAME_OVER || 
               this.currentState === GameState.VICTORY;
    }
    
    /**
     * 检查游戏是否暂停
     */
    isGamePaused(): boolean {
        return this.currentState === GameState.PAUSED;
    }
    
    /**
     * 注册状态变化回调
     */
    onStateChange(state: GameState, callback: () => void) {
        const callbacks = this.stateChangeCallbacks.get(state);
        if (callbacks) {
            callbacks.push(callback);
        }
    }
    
    /**
     * 移除状态变化回调
     */
    offStateChange(state: GameState, callback: () => void) {
        const callbacks = this.stateChangeCallbacks.get(state);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * 触发状态变化回调
     */
    private triggerStateCallbacks(state: GameState) {
        const callbacks = this.stateChangeCallbacks.get(state);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error(`❌ 状态回调执行出错: ${error}`);
                }
            });
        }
    }
    
    /**
     * 获取游戏进度百分比
     */
    getGameProgress(): number {
        if (this.gameData.targetScore <= 0) return 0;
        return Math.min(100, (this.gameData.currentScore / this.gameData.targetScore) * 100);
    }
    
    /**
     * 获取游戏效率评级
     */
    getEfficiencyRating(): string {
        if (this.gameData.moveCount === 0) return "未开始";
        
        const avgScore = this.gameData.currentScore / this.gameData.moveCount;
        
        if (avgScore >= 20) return "优秀";
        if (avgScore >= 10) return "良好";
        if (avgScore >= 5) return "一般";
        return "需要改进";
    }
    
    /**
     * 保存游戏统计到本地存储
     */
    private saveGameStatistics() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('starElimination_statistics', JSON.stringify(this.gameStatistics));
                console.log('💾 游戏统计已保存');
            }
        } catch (error) {
            console.warn('⚠️ 保存游戏统计失败:', error);
        }
    }
    
    /**
     * 从本地存储加载游戏统计
     */
    private loadGameStatistics() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('starElimination_statistics');
                if (saved) {
                    this.gameStatistics = JSON.parse(saved);
                    console.log('📁 游戏统计已加载');
                }
            }
        } catch (error) {
            console.warn('⚠️ 加载游戏统计失败:', error);
        }
    }
    
    /**
     * 重置游戏统计
     */
    resetStatistics() {
        this.gameStatistics = {
            totalMoves: 0,
            totalScore: 0,
            largestElimination: 0,
            averageScorePerMove: 0,
            playTime: 0,
            consecutiveVictories: 0
        };
        
        this.saveGameStatistics();
        console.log('🔄 游戏统计已重置');
    }
    
    /**
     * 调试：打印当前状态
     */
    debugPrintState() {
        console.log('🎲 游戏状态信息:');
        console.log(`  当前状态: ${this.currentState}`);
        console.log(`  上一状态: ${this.previousState}`);
        console.log(`  游戏数据:`, this.gameData);
        console.log(`  游戏统计:`, this.gameStatistics);
        console.log(`  游戏进度: ${this.getGameProgress().toFixed(1)}%`);
        console.log(`  效率评级: ${this.getEfficiencyRating()}`);
    }
}
