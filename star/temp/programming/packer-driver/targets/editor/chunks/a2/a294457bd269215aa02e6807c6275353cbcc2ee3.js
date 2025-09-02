System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Label, tween, SpriteAtlas, BoardManager, BlockManager, EliminationManager, PhysicsManager, InputManager, ScoreManager, UIManager, GameStateManager, GameState, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _crd, ccclass, property, GameManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfBoardManager(extras) {
    _reporterNs.report("BoardManager", "./BoardManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBlockManager(extras) {
    _reporterNs.report("BlockManager", "./BlockManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEliminationManager(extras) {
    _reporterNs.report("EliminationManager", "./EliminationManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPhysicsManager(extras) {
    _reporterNs.report("PhysicsManager", "./PhysicsManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInputManager(extras) {
    _reporterNs.report("InputManager", "./InputManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfScoreManager(extras) {
    _reporterNs.report("ScoreManager", "./ScoreManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "./UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStateManager(extras) {
    _reporterNs.report("GameStateManager", "./GameStateManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameState(extras) {
    _reporterNs.report("GameState", "./GameStateManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
      Label = _cc.Label;
      tween = _cc.tween;
      SpriteAtlas = _cc.SpriteAtlas;
    }, function (_unresolved_2) {
      BoardManager = _unresolved_2.BoardManager;
    }, function (_unresolved_3) {
      BlockManager = _unresolved_3.BlockManager;
    }, function (_unresolved_4) {
      EliminationManager = _unresolved_4.EliminationManager;
    }, function (_unresolved_5) {
      PhysicsManager = _unresolved_5.PhysicsManager;
    }, function (_unresolved_6) {
      InputManager = _unresolved_6.InputManager;
    }, function (_unresolved_7) {
      ScoreManager = _unresolved_7.ScoreManager;
    }, function (_unresolved_8) {
      UIManager = _unresolved_8.UIManager;
    }, function (_unresolved_9) {
      GameStateManager = _unresolved_9.GameStateManager;
      GameState = _unresolved_9.GameState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "55460KzmpNKn7K3kZ8KOR+F", "GameManager", undefined);
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


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Color', 'Label', 'UITransform', 'Vec2', 'tween', 'UIOpacity', 'Sprite', 'SpriteFrame', 'SpriteAtlas']);

      ({
        ccclass,
        property
      } = _decorator);
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

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec2 = property(Node), _dec3 = property(SpriteAtlas), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Node), _dec7 = property(Label), _dec(_class = (_class2 = class GameManager extends Component {
        constructor(...args) {
          super(...args);

          // ==================== 组件引用 ====================
          _initializerDefineProperty(this, "gameBoard", _descriptor, this);

          // 游戏棋盘根节点
          _initializerDefineProperty(this, "blockAtlas", _descriptor2, this);

          // 方块图集
          _initializerDefineProperty(this, "scoreLabel", _descriptor3, this);

          // 分数显示标签
          _initializerDefineProperty(this, "targetScoreLabel", _descriptor4, this);

          // 目标分数标签
          _initializerDefineProperty(this, "gameOverPanel", _descriptor5, this);

          // 游戏结束面板
          _initializerDefineProperty(this, "finalScoreLabel", _descriptor6, this);

          // 最终分数标签
          // ==================== 游戏配置 ====================
          _initializerDefineProperty(this, "boardSize", _descriptor7, this);

          // 棋盘大小（10x10）
          _initializerDefineProperty(this, "blockTypes", _descriptor8, this);

          // 方块类型数量
          _initializerDefineProperty(this, "targetScore", _descriptor9, this);

          // 目标分数
          _initializerDefineProperty(this, "blockSize", _descriptor10, this);

          // 方块大小（竖屏适配，保守尺寸）
          _initializerDefineProperty(this, "blockSpacing", _descriptor11, this);

          // 方块间距（竖屏适配，紧凑）
          // ==================== 管理器实例 ====================
          this.boardManager = null;
          this.blockManager = null;
          this.eliminationManager = null;
          this.physicsManager = null;
          this.inputManager = null;
          this.scoreManager = null;
          this.uiManager = null;
          this.gameStateManager = null;
          // ==================== 游戏状态 ====================
          this.currentScore = 0;
          this.isGameOver = false;
          this.isProcessing = false;
        }

        // 防止多次操作
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


        initManagers() {
          // 创建管理器实例
          this.boardManager = new (_crd && BoardManager === void 0 ? (_reportPossibleCrUseOfBoardManager({
            error: Error()
          }), BoardManager) : BoardManager)();
          this.blockManager = new (_crd && BlockManager === void 0 ? (_reportPossibleCrUseOfBlockManager({
            error: Error()
          }), BlockManager) : BlockManager)();
          this.eliminationManager = new (_crd && EliminationManager === void 0 ? (_reportPossibleCrUseOfEliminationManager({
            error: Error()
          }), EliminationManager) : EliminationManager)();
          this.physicsManager = new (_crd && PhysicsManager === void 0 ? (_reportPossibleCrUseOfPhysicsManager({
            error: Error()
          }), PhysicsManager) : PhysicsManager)();
          this.scoreManager = new (_crd && ScoreManager === void 0 ? (_reportPossibleCrUseOfScoreManager({
            error: Error()
          }), ScoreManager) : ScoreManager)();
          this.uiManager = new (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager)();
          this.gameStateManager = new (_crd && GameStateManager === void 0 ? (_reportPossibleCrUseOfGameStateManager({
            error: Error()
          }), GameStateManager) : GameStateManager)(); // 初始化管理器

          this.boardManager.init(this.gameBoard, this.boardSize, this.blockSize, this.blockSpacing);
          this.blockManager.init(this.blockAtlas, this.blockTypes);
          this.eliminationManager.init();
          this.physicsManager.init();
          this.scoreManager.init(this.targetScore);
          this.gameStateManager.init(); // 初始化UI管理器

          this.uiManager.init({
            scoreLabel: this.scoreLabel,
            targetScoreLabel: this.targetScoreLabel,
            gameOverPanel: this.gameOverPanel,
            finalScoreLabel: this.finalScoreLabel
          }); // 设置UI回调

          this.uiManager.setCallbacks({
            onRestart: () => this.restartGame(),
            onHint: () => this.showHint(),
            onPause: () => this.togglePause()
          }); // 创建输入管理器并传入回调接口

          this.inputManager = new (_crd && InputManager === void 0 ? (_reportPossibleCrUseOfInputManager({
            error: Error()
          }), InputManager) : InputManager)();
          this.inputManager.init({
            getBoardData: () => this.boardManager.getBoardData(),
            getBlockAt: (row, col) => this.boardManager.getBlockAt(row, col),
            screenToGridPosition: screenPos => this.boardManager.screenToGridPosition(screenPos),
            onBlockClick: (row, col) => this.handleBlockClick(row, col),
            isGameActive: () => this.gameStateManager.canPerformGameAction() && !this.isProcessing
          });
          console.log('✅ 所有管理器初始化完成');
        }
        /**
         * 开始新游戏
         */


        startNewGame() {
          console.log('🎯 开始新游戏'); // 开始新游戏会话

          this.gameStateManager.startNewGame(1, this.targetScore); // 重置游戏状态

          this.currentScore = 0;
          this.isGameOver = false;
          this.isProcessing = false; // 生成初始棋盘

          this.boardManager.generateBoard(this.blockManager); // 更新UI

          this.updateGameUI();
          console.log('✅ 新游戏初始化完成');
        }
        /**
         * 处理方块点击
         */


        async handleBlockClick(row, col) {
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
              console.log(`❌ 点击了空位置，方块类型: ${clickedBlock == null ? void 0 : clickedBlock.type}`);
              this.isProcessing = false;
              return;
            }

            console.log(`📦 方块类型: ${clickedBlock.type}`); // 获取连通区域

            console.log(`🔍 开始查找连通区域...`);
            const connectedBlocks = this.eliminationManager.findConnectedBlocks(this.boardManager.getBoardData(), row, col);
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

            console.log(`✨ 可以消除！找到 ${connectedBlocks.length} 个连通方块`); // 计算得分

            const score = this.scoreManager.calculateEliminationScore(connectedBlocks.length);
            console.log(`💰 得分计算: ${connectedBlocks.length} 个方块 → ${score} 分`);
            this.currentScore += score;
            console.log(`📊 当前总分: ${this.currentScore}`); // 记录消除操作到状态管理器

            this.gameStateManager.recordElimination(connectedBlocks.length, score);
            console.log(`📝 已记录消除操作到状态管理器`); // 执行消除动画

            console.log(`🎬 开始消除动画...`);
            await this.animateElimination(connectedBlocks);
            console.log(`✅ 消除动画完成`); // 移除方块数据

            console.log(`🗑️ 移除方块数据...`);
            this.boardManager.removeBlocks(connectedBlocks);
            console.log(`✅ 方块数据移除完成`); // 执行物理重排

            console.log(`🌊 开始物理重排...`);
            await this.physicsManager.rearrangeBoard(this.boardManager, this.blockManager);
            console.log(`✅ 物理重排完成`); // 更新显示

            console.log(`🔄 更新UI显示...`);
            this.updateGameUI();
            console.log(`✅ UI更新完成`); // 检查游戏状态

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


        async animateElimination(blocks) {
          return new Promise(resolve => {
            let completedAnimations = 0;
            const totalAnimations = blocks.length;
            blocks.forEach(({
              row,
              col
            }) => {
              const blockNode = this.boardManager.getBlockNodeAt(row, col);

              if (blockNode) {
                // 缩放消失动画
                tween(blockNode).to(0.3, {
                  scale: new Vec3(0, 0, 1)
                }, {
                  easing: 'backIn'
                }).call(() => {
                  blockNode.removeFromParent();
                  completedAnimations++;

                  if (completedAnimations >= totalAnimations) {
                    resolve();
                  }
                }).start();
              }
            }); // 防止卡死

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


        updateGameUI() {
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


        updateScoreDisplay() {
          this.updateGameUI();
        }
        /**
         * 检查游戏状态
         */


        checkGameState() {
          // 更新剩余方块数量
          const remainingBlocks = this.boardManager.countRemainingBlocks();
          this.gameStateManager.updateGameData({
            remainingBlocks
          }); // 检查胜利条件（在 GameStateManager 中自动检查）

          const gameData = this.gameStateManager.getGameData();

          if (gameData.currentScore >= gameData.targetScore) {
            this.endGame(true);
            return;
          } // 检查是否还有可消除的连通区域


          const hasValidMoves = this.eliminationManager.hasValidMoves(this.boardManager.getBoardData());

          if (!hasValidMoves) {
            this.endGame(false);
          }
        }
        /**
         * 结束游戏
         */


        endGame(isVictory = false) {
          console.log(`🎲 游戏结束 - ${isVictory ? '胜利' : '失败'}`); // 计算剩余方块奖励

          const remainingBlocks = this.boardManager.countRemainingBlocks();
          const bonusScore = this.scoreManager.calculateBonusScore(remainingBlocks);

          if (bonusScore > 0) {
            this.currentScore += bonusScore;
            this.gameStateManager.updateGameData({
              currentScore: this.currentScore
            });
            console.log(`🎁 剩余方块奖励: ${bonusScore} 分`);
          } // 通知状态管理器游戏结束


          this.gameStateManager.endGame(isVictory); // 更新最终UI显示

          this.updateGameUI();
          this.isGameOver = true;
        }
        /**
         * 显示提示
         */


        showHint() {
          if (!this.gameStateManager.canPerformGameAction()) {
            return;
          }

          console.log('💡 显示游戏提示'); // 找到最大的连通区域

          const boardData = this.boardManager.getBoardData();
          let largestRegion = [];
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


        togglePause() {
          if (this.gameStateManager.getCurrentState() === (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
            error: Error()
          }), GameState) : GameState).PLAYING) {
            this.gameStateManager.pauseGame();
            this.inputManager.disableInput();
            console.log('⏸️ 游戏已暂停');
          } else if (this.gameStateManager.getCurrentState() === (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
            error: Error()
          }), GameState) : GameState).PAUSED) {
            this.gameStateManager.resumeGame();
            this.inputManager.enableInput();
            console.log('▶️ 游戏已恢复');
          }
        }
        /**
         * 重新开始游戏
         */


        restartGame() {
          console.log('🔄 重新开始游戏');
          this.startNewGame();
        }
        /**
         * 获取当前分数
         */


        getCurrentScore() {
          return this.currentScore;
        }
        /**
         * 获取游戏状态
         */


        getGameState() {
          return {
            score: this.currentScore,
            isGameOver: this.isGameOver,
            targetScore: this.targetScore
          };
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gameBoard", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "blockAtlas", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "scoreLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "targetScoreLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "gameOverPanel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "finalScoreLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "boardSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 10;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "blockTypes", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "targetScore", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1000;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "blockSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 35;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "blockSpacing", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a294457bd269215aa02e6807c6275353cbcc2ee3.js.map