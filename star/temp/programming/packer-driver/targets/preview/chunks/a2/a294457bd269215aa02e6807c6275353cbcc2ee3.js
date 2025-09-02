System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Label, tween, SpriteAtlas, BoardManager, BlockManager, EliminationManager, PhysicsManager, InputManager, ScoreManager, UIManager, GameStateManager, GameState, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _crd, ccclass, property, GameManager;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
        constructor() {
          super(...arguments);

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


        handleBlockClick(row, col) {
          var _this = this;

          return _asyncToGenerator(function* () {
            console.log("\n\uD83C\uDFAF ===== \u65B9\u5757\u70B9\u51FB\u4E8B\u4EF6\u5F00\u59CB =====");
            console.log("\uD83C\uDFAF \u70B9\u51FB\u4F4D\u7F6E: (" + row + ", " + col + ")");
            console.log("\uD83C\uDFAE \u6E38\u620F\u72B6\u6001: " + _this.gameStateManager.getCurrentState());
            console.log("\uD83D\uDD12 \u662F\u5426\u5904\u7406\u4E2D: " + _this.isProcessing);
            console.log("\u2705 \u53EF\u4EE5\u6267\u884C\u64CD\u4F5C: " + _this.gameStateManager.canPerformGameAction());

            if (!_this.gameStateManager.canPerformGameAction() || _this.isProcessing) {
              console.log("\u274C \u65E0\u6CD5\u6267\u884C\u64CD\u4F5C\uFF0C\u8DF3\u8FC7\u5904\u7406");
              return;
            }

            console.log("\uD83C\uDFAF \u5F00\u59CB\u5904\u7406\u65B9\u5757\u70B9\u51FB: (" + row + ", " + col + ")");
            _this.isProcessing = true;

            try {
              // 获取点击的方块信息
              var clickedBlock = _this.boardManager.getBlockAt(row, col);

              console.log("\uD83D\uDD0D \u70B9\u51FB\u7684\u65B9\u5757\u4FE1\u606F:", clickedBlock);

              if (!clickedBlock || clickedBlock.type === -1) {
                console.log("\u274C \u70B9\u51FB\u4E86\u7A7A\u4F4D\u7F6E\uFF0C\u65B9\u5757\u7C7B\u578B: " + (clickedBlock == null ? void 0 : clickedBlock.type));
                _this.isProcessing = false;
                return;
              }

              console.log("\uD83D\uDCE6 \u65B9\u5757\u7C7B\u578B: " + clickedBlock.type); // 获取连通区域

              console.log("\uD83D\uDD0D \u5F00\u59CB\u67E5\u627E\u8FDE\u901A\u533A\u57DF...");

              var connectedBlocks = _this.eliminationManager.findConnectedBlocks(_this.boardManager.getBoardData(), row, col);

              console.log("\uD83D\uDD17 \u8FDE\u901A\u533A\u57DF\u641C\u7D22\u5B8C\u6210\uFF0C\u627E\u5230 " + connectedBlocks.length + " \u4E2A\u65B9\u5757");
              connectedBlocks.forEach((block, index) => {
                console.log("  " + (index + 1) + ". (" + block.row + ", " + block.col + ")");
              });

              if (connectedBlocks.length < 2) {
                console.log('⚠️ 连通区域少于2个方块，无法消除');
                console.log("\uD83C\uDFAF ===== \u65B9\u5757\u70B9\u51FB\u4E8B\u4EF6\u7ED3\u675F (\u65E0\u6CD5\u6D88\u9664) =====\n");
                _this.isProcessing = false;
                return;
              }

              console.log("\u2728 \u53EF\u4EE5\u6D88\u9664\uFF01\u627E\u5230 " + connectedBlocks.length + " \u4E2A\u8FDE\u901A\u65B9\u5757"); // 计算得分

              var score = _this.scoreManager.calculateEliminationScore(connectedBlocks.length);

              console.log("\uD83D\uDCB0 \u5F97\u5206\u8BA1\u7B97: " + connectedBlocks.length + " \u4E2A\u65B9\u5757 \u2192 " + score + " \u5206");
              _this.currentScore += score;
              console.log("\uD83D\uDCCA \u5F53\u524D\u603B\u5206: " + _this.currentScore); // 记录消除操作到状态管理器

              _this.gameStateManager.recordElimination(connectedBlocks.length, score);

              console.log("\uD83D\uDCDD \u5DF2\u8BB0\u5F55\u6D88\u9664\u64CD\u4F5C\u5230\u72B6\u6001\u7BA1\u7406\u5668"); // 执行消除动画

              console.log("\uD83C\uDFAC \u5F00\u59CB\u6D88\u9664\u52A8\u753B...");
              yield _this.animateElimination(connectedBlocks);
              console.log("\u2705 \u6D88\u9664\u52A8\u753B\u5B8C\u6210"); // 移除方块数据

              console.log("\uD83D\uDDD1\uFE0F \u79FB\u9664\u65B9\u5757\u6570\u636E...");

              _this.boardManager.removeBlocks(connectedBlocks);

              console.log("\u2705 \u65B9\u5757\u6570\u636E\u79FB\u9664\u5B8C\u6210"); // 执行物理重排

              console.log("\uD83C\uDF0A \u5F00\u59CB\u7269\u7406\u91CD\u6392...");
              yield _this.physicsManager.rearrangeBoard(_this.boardManager, _this.blockManager);
              console.log("\u2705 \u7269\u7406\u91CD\u6392\u5B8C\u6210"); // 更新显示

              console.log("\uD83D\uDD04 \u66F4\u65B0UI\u663E\u793A...");

              _this.updateGameUI();

              console.log("\u2705 UI\u66F4\u65B0\u5B8C\u6210"); // 检查游戏状态

              console.log("\uD83D\uDD0D \u68C0\u67E5\u6E38\u620F\u72B6\u6001...");

              _this.checkGameState();

              console.log("\u2705 \u6E38\u620F\u72B6\u6001\u68C0\u67E5\u5B8C\u6210");
            } catch (error) {
              console.error('❌ 处理方块点击时出错:', error);
              console.error('❌ 错误堆栈:', error.stack);
            } finally {
              _this.isProcessing = false;
              console.log("\uD83C\uDFAF ===== \u65B9\u5757\u70B9\u51FB\u4E8B\u4EF6\u7ED3\u675F =====\n");
            }
          })();
        }
        /**
         * 执行消除动画
         */


        animateElimination(blocks) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            return new Promise(resolve => {
              var completedAnimations = 0;
              var totalAnimations = blocks.length;
              blocks.forEach(_ref => {
                var {
                  row,
                  col
                } = _ref;

                var blockNode = _this2.boardManager.getBlockNodeAt(row, col);

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
          })();
        }
        /**
         * 更新游戏UI显示
         */


        updateGameUI() {
          var gameData = this.gameStateManager.getGameData();
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
          var remainingBlocks = this.boardManager.countRemainingBlocks();
          this.gameStateManager.updateGameData({
            remainingBlocks
          }); // 检查胜利条件（在 GameStateManager 中自动检查）

          var gameData = this.gameStateManager.getGameData();

          if (gameData.currentScore >= gameData.targetScore) {
            this.endGame(true);
            return;
          } // 检查是否还有可消除的连通区域


          var hasValidMoves = this.eliminationManager.hasValidMoves(this.boardManager.getBoardData());

          if (!hasValidMoves) {
            this.endGame(false);
          }
        }
        /**
         * 结束游戏
         */


        endGame(isVictory) {
          if (isVictory === void 0) {
            isVictory = false;
          }

          console.log("\uD83C\uDFB2 \u6E38\u620F\u7ED3\u675F - " + (isVictory ? '胜利' : '失败')); // 计算剩余方块奖励

          var remainingBlocks = this.boardManager.countRemainingBlocks();
          var bonusScore = this.scoreManager.calculateBonusScore(remainingBlocks);

          if (bonusScore > 0) {
            this.currentScore += bonusScore;
            this.gameStateManager.updateGameData({
              currentScore: this.currentScore
            });
            console.log("\uD83C\uDF81 \u5269\u4F59\u65B9\u5757\u5956\u52B1: " + bonusScore + " \u5206");
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

          var boardData = this.boardManager.getBoardData();
          var largestRegion = [];
          var maxSize = 0;

          for (var row = 0; row < this.boardSize; row++) {
            for (var col = 0; col < this.boardSize; col++) {
              if (boardData[row][col].type !== -1) {
                var region = this.eliminationManager.findConnectedBlocks(boardData, row, col);

                if (region.length >= 2 && region.length > maxSize) {
                  maxSize = region.length;
                  largestRegion = region;
                }
              }
            }
          }

          if (largestRegion.length > 0) {
            console.log("\uD83D\uDCA1 \u6700\u4F73\u9009\u62E9: " + largestRegion.length + " \u4E2A\u8FDE\u901A\u65B9\u5757");
            this.uiManager.showHint("\u5EFA\u8BAE\u6D88\u9664 " + largestRegion.length + " \u4E2A\u8FDE\u901A\u65B9\u5757\uFF0C\u53EF\u83B7\u5F97 " + this.scoreManager.calculateEliminationScore(largestRegion.length) + " \u5206");
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
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "blockAtlas", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "scoreLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "targetScoreLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "gameOverPanel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "finalScoreLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "boardSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "blockTypes", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "targetScore", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1000;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "blockSize", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 35;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "blockSpacing", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a294457bd269215aa02e6807c6275353cbcc2ee3.js.map