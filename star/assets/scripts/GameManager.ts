/**
 * 消灭星星游戏 - Cocos Creator版本
 * 
 * 主要特性：
 * - 10x10棋盘，多种彩色方块
 * - 点击连接的同色方块进行消除
 * - 方块下落和左移物理效果
 * - 得分系统：(n-2)² 公式计算
 * - 剩余方块奖励系统
 * - 完整的触摸事件处理
 * 
 * 技术要点：
 * - 使用Tween系统实现动画效果
 * - 完善的错误处理和安全检查
 * - 智能的连通区域检测算法
 * - 基于物理规律的方块重排系统
 * 
 * @author Zipxing & Cursor
 * @version 1.0
 * @date 2025-01-11
 */

import { _decorator, Component, Node, Vec3, Color, Label, UITransform, Vec2, tween, UIOpacity, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
import { BoardManager } from './BoardManager';
import { BlockManager } from './BlockManager';
import { EliminationManager } from './EliminationManager';
import { PhysicsManager } from './PhysicsManager';
import { InputManager } from './InputManager';
import { ScoreManager } from './ScoreManager';
import { UIManager } from './UIManager';
import { GameStateManager, GameState } from './GameStateManager';
const { ccclass, property } = _decorator;

/**
 * 消灭星星游戏管理器
 * 
 * 核心功能：
 * - 10x10棋盘生成与渲染
 * - 点击连通区域检测与消除
 * - 方块下落与左移重排
 * - 得分计算与游戏状态管理
 * - 高亮显示与视觉反馈
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    // ==================== 组件引用 ====================
    @property(Node)
    gameBoard: Node = null!;  // 游戏棋盘根节点
    
    @property(SpriteAtlas)
    blockAtlas: SpriteAtlas = null!;  // 方块图集
    
    @property(Label)
    scoreLabel: Label = null!;  // 分数显示标签
    
    @property(Label)
    targetScoreLabel: Label = null!;  // 目标分数标签
    
    @property(Node)
    gameOverPanel: Node = null!;  // 游戏结束面板
    
    @property(Label)
    finalScoreLabel: Label = null!;  // 最终分数标签
    
    // ==================== 游戏配置 ====================
    @property
    boardSize: number = 10;  // 棋盘大小（10x10）
    
    @property
    blockTypes: number = 5;  // 方块类型数量
    
    @property
    targetScore: number = 1000;  // 目标分数
    
    @property
    blockSize: number = 35;  // 方块大小（竖屏适配，保守尺寸）
    
    @property
    blockSpacing: number = 2;  // 方块间距（竖屏适配，紧凑）
    
    // ==================== 管理器实例 ====================
    private boardManager: BoardManager = null!;
    private blockManager: BlockManager = null!;
    private eliminationManager: EliminationManager = null!;
    private physicsManager: PhysicsManager = null!;
    private inputManager: InputManager = null!;
    private scoreManager: ScoreManager = null!;
    private uiManager: UIManager = null!;
    private gameStateManager: GameStateManager = null!;
    
    // ==================== 游戏状态 ====================
    private currentScore: number = 0;
    private isGameOver: boolean = false;
    private isProcessing: boolean = false;  // 防止多次操作
    
    onLoad() {
        console.log('🎮 消灭星星游戏加载中...');
        this.initManagers();
    }
    
    start() {
        console.log('🎮 消灭星星游戏开始');
        this.startNewGame();
    }
    
    /**
     * 初始化所有管理器
     */
    private initManagers() {
        // 创建管理器实例
        this.boardManager = new BoardManager();
        this.blockManager = new BlockManager();
        this.eliminationManager = new EliminationManager();
        this.physicsManager = new PhysicsManager();
        this.scoreManager = new ScoreManager();
        this.uiManager = new UIManager();
        this.gameStateManager = new GameStateManager();
        
        // 初始化管理器
        this.boardManager.init(this.gameBoard, this.boardSize, this.blockSize, this.blockSpacing);
        this.blockManager.init(this.blockAtlas, this.blockTypes);
        this.eliminationManager.init();
        this.physicsManager.init();
        this.scoreManager.init(this.targetScore);
        this.gameStateManager.init();
        
        // 初始化UI管理器
        this.uiManager.init({
            scoreLabel: this.scoreLabel,
            targetScoreLabel: this.targetScoreLabel,
            gameOverPanel: this.gameOverPanel,
            finalScoreLabel: this.finalScoreLabel
        });
        
        // 设置UI回调
        this.uiManager.setCallbacks({
            onRestart: () => this.restartGame(),
            onHint: () => this.showHint(),
            onPause: () => this.togglePause()
        });
        
        // 创建输入管理器并传入回调接口
        this.inputManager = new InputManager();
        this.inputManager.init({
            getBoardData: () => this.boardManager.getBoardData(),
            getBlockAt: (row: number, col: number) => this.boardManager.getBlockAt(row, col),
            screenToGridPosition: (screenPos: Vec3) => this.boardManager.screenToGridPosition(screenPos),
            onBlockClick: (row: number, col: number) => this.handleBlockClick(row, col),
            isGameActive: () => this.gameStateManager.canPerformGameAction() && !this.isProcessing
        });
        
        console.log('✅ 所有管理器初始化完成');
    }
    
    /**
     * 开始新游戏
     */
    private startNewGame() {
        console.log('🎯 开始新游戏');
        
        // 开始新游戏会话
        this.gameStateManager.startNewGame(1, this.targetScore);
        
        // 重置游戏状态
        this.currentScore = 0;
        this.isGameOver = false;
        this.isProcessing = false;
        
        // 生成初始棋盘
        this.boardManager.generateBoard(this.blockManager);
        
        // 更新UI
        this.updateGameUI();
        
        console.log('✅ 新游戏初始化完成');
    }
    
    /**
     * 处理方块点击
     */
    private async handleBlockClick(row: number, col: number) {
        console.log(`\n🎯 ===== 方块点击事件开始 =====`);
        console.log(`🎯 点击位置: (${row}, ${col})`);
        console.log(`🎮 游戏状态: ${this.gameStateManager.getCurrentState()}`);
        console.log(`🔒 是否处理中: ${this.isProcessing}`);
        console.log(`✅ 可以执行操作: ${this.gameStateManager.canPerformGameAction()}`);
        
        if (!this.gameStateManager.canPerformGameAction() || this.isProcessing) {
            console.log(`❌ 无法执行操作，跳过处理`);
            return;
        }
        
        console.log(`🎯 开始处理方块点击: (${row}, ${col})`);
        
        this.isProcessing = true;
        
        try {
            // 获取点击的方块信息
            const clickedBlock = this.boardManager.getBlockAt(row, col);
            console.log(`🔍 点击的方块信息:`, clickedBlock);
            
            if (!clickedBlock || clickedBlock.type === -1) {
                console.log(`❌ 点击了空位置，方块类型: ${clickedBlock?.type}`);
                this.isProcessing = false;
                return;
            }
            
            console.log(`📦 方块类型: ${clickedBlock.type}`);
            
            // 获取连通区域
            console.log(`🔍 开始查找连通区域...`);
            const connectedBlocks = this.eliminationManager.findConnectedBlocks(
                this.boardManager.getBoardData(), 
                row, 
                col
            );
            
            console.log(`🔗 连通区域搜索完成，找到 ${connectedBlocks.length} 个方块`);
            connectedBlocks.forEach((block, index) => {
                console.log(`  ${index + 1}. (${block.row}, ${block.col})`);
            });
            
            if (connectedBlocks.length < 2) {
                console.log('⚠️ 连通区域少于2个方块，无法消除');
                console.log(`🎯 ===== 方块点击事件结束 (无法消除) =====\n`);
                this.isProcessing = false;
                return;
            }
            
            console.log(`✨ 可以消除！找到 ${connectedBlocks.length} 个连通方块`);
            
            // 计算得分
            const score = this.scoreManager.calculateEliminationScore(connectedBlocks.length);
            console.log(`💰 得分计算: ${connectedBlocks.length} 个方块 → ${score} 分`);
            
            this.currentScore += score;
            console.log(`📊 当前总分: ${this.currentScore}`);
            
            // 记录消除操作到状态管理器
            this.gameStateManager.recordElimination(connectedBlocks.length, score);
            console.log(`📝 已记录消除操作到状态管理器`);
            
            // 执行消除动画
            console.log(`🎬 开始消除动画...`);
            await this.animateElimination(connectedBlocks);
            console.log(`✅ 消除动画完成`);
            
            // 移除方块数据
            console.log(`🗑️ 移除方块数据...`);
            this.boardManager.removeBlocks(connectedBlocks);
            console.log(`✅ 方块数据移除完成`);
            
            // 执行物理重排
            console.log(`🌊 开始物理重排...`);
            await this.physicsManager.rearrangeBoard(this.boardManager, this.blockManager);
            console.log(`✅ 物理重排完成`);
            
            // 更新显示
            console.log(`🔄 更新UI显示...`);
            this.updateGameUI();
            console.log(`✅ UI更新完成`);
            
            // 检查游戏状态
            console.log(`🔍 检查游戏状态...`);
            this.checkGameState();
            console.log(`✅ 游戏状态检查完成`);
            
        } catch (error) {
            console.error('❌ 处理方块点击时出错:', error);
            console.error('❌ 错误堆栈:', error.stack);
        } finally {
            this.isProcessing = false;
            console.log(`🎯 ===== 方块点击事件结束 =====\n`);
        }
    }
    
    /**
     * 执行消除动画
     */
    private async animateElimination(blocks: {row: number, col: number}[]): Promise<void> {
        return new Promise((resolve) => {
            let completedAnimations = 0;
            const totalAnimations = blocks.length;
            
            blocks.forEach(({row, col}) => {
                const blockNode = this.boardManager.getBlockNodeAt(row, col);
                if (blockNode) {
                    // 缩放消失动画
                    tween(blockNode)
                        .to(0.3, { 
                            scale: new Vec3(0, 0, 1) 
                        }, { easing: 'backIn' })
                        .call(() => {
                            blockNode.removeFromParent();
                            completedAnimations++;
                            if (completedAnimations >= totalAnimations) {
                                resolve();
                            }
                        })
                        .start();
                }
            });
            
            // 防止卡死
            setTimeout(() => {
                if (completedAnimations < totalAnimations) {
                    console.warn('⚠️ 消除动画超时，强制完成');
                    resolve();
                }
            }, 2000);
        });
    }
    
    /**
     * 更新游戏UI显示
     */
    private updateGameUI() {
        const gameData = this.gameStateManager.getGameData();
        this.uiManager.updateGameState({
            score: gameData.currentScore,
            targetScore: gameData.targetScore,
            isGameOver: this.gameStateManager.isGameEnded(),
            remainingBlocks: gameData.remainingBlocks,
            moveCount: gameData.moveCount
        });
    }
    
    /**
     * 更新分数显示（保持兼容性）
     */
    private updateScoreDisplay() {
        this.updateGameUI();
    }
    
    /**
     * 检查游戏状态
     */
    private checkGameState() {
        // 更新剩余方块数量
        const remainingBlocks = this.boardManager.countRemainingBlocks();
        this.gameStateManager.updateGameData({ remainingBlocks });
        
        // 检查胜利条件（在 GameStateManager 中自动检查）
        const gameData = this.gameStateManager.getGameData();
        if (gameData.currentScore >= gameData.targetScore) {
            this.endGame(true);
            return;
        }
        
        // 检查是否还有可消除的连通区域
        const hasValidMoves = this.eliminationManager.hasValidMoves(this.boardManager.getBoardData());
        
        if (!hasValidMoves) {
            this.endGame(false);
        }
    }
    
    /**
     * 结束游戏
     */
    private endGame(isVictory: boolean = false) {
        console.log(`🎲 游戏结束 - ${isVictory ? '胜利' : '失败'}`);
        
        // 计算剩余方块奖励
        const remainingBlocks = this.boardManager.countRemainingBlocks();
        const bonusScore = this.scoreManager.calculateBonusScore(remainingBlocks);
        
        if (bonusScore > 0) {
            this.currentScore += bonusScore;
            this.gameStateManager.updateGameData({ 
                currentScore: this.currentScore 
            });
            console.log(`🎁 剩余方块奖励: ${bonusScore} 分`);
        }
        
        // 通知状态管理器游戏结束
        this.gameStateManager.endGame(isVictory);
        
        // 更新最终UI显示
        this.updateGameUI();
        
        this.isGameOver = true;
    }
    
    /**
     * 显示提示
     */
    private showHint() {
        if (!this.gameStateManager.canPerformGameAction()) {
            return;
        }
        
        console.log('💡 显示游戏提示');
        
        // 找到最大的连通区域
        const boardData = this.boardManager.getBoardData();
        let largestRegion: {row: number, col: number}[] = [];
        let maxSize = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (boardData[row][col].type !== -1) {
                    const region = this.eliminationManager.findConnectedBlocks(boardData, row, col);
                    if (region.length >= 2 && region.length > maxSize) {
                        maxSize = region.length;
                        largestRegion = region;
                    }
                }
            }
        }
        
        if (largestRegion.length > 0) {
            console.log(`💡 最佳选择: ${largestRegion.length} 个连通方块`);
            this.uiManager.showHint(`建议消除 ${largestRegion.length} 个连通方块，可获得 ${this.scoreManager.calculateEliminationScore(largestRegion.length)} 分`);
        } else {
            this.uiManager.showHint('没有可消除的方块组合');
        }
    }
    
    /**
     * 切换暂停状态
     */
    private togglePause() {
        if (this.gameStateManager.getCurrentState() === GameState.PLAYING) {
            this.gameStateManager.pauseGame();
            this.inputManager.disableInput();
            console.log('⏸️ 游戏已暂停');
        } else if (this.gameStateManager.getCurrentState() === GameState.PAUSED) {
            this.gameStateManager.resumeGame();
            this.inputManager.enableInput();
            console.log('▶️ 游戏已恢复');
        }
    }
    
    /**
     * 重新开始游戏
     */
    public restartGame() {
        console.log('🔄 重新开始游戏');
        this.startNewGame();
    }
    
    /**
     * 获取当前分数
     */
    public getCurrentScore(): number {
        return this.currentScore;
    }
    
    /**
     * 获取游戏状态
     */
    public getGameState(): {score: number, isGameOver: boolean, targetScore: number} {
        return {
            score: this.currentScore,
            isGameOver: this.isGameOver,
            targetScore: this.targetScore
        };
    }
}
