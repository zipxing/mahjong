System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, GameStateManager, _crd, GameState;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  _export("GameStateManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7b69d6Pd1hD2bmwuYYnRB1l", "GameStateManager", undefined);

      /**
       * 游戏状态管理器
       * 负责管理游戏的各种状态，包括开始、暂停、结束等
       */
      _export("GameState", GameState = /*#__PURE__*/function (GameState) {
        GameState["LOADING"] = "loading";
        GameState["MENU"] = "menu";
        GameState["PLAYING"] = "playing";
        GameState["PAUSED"] = "paused";
        GameState["GAME_OVER"] = "game_over";
        GameState["VICTORY"] = "victory";
        return GameState;
      }({}));

      _export("GameStateManager", GameStateManager = class GameStateManager {
        constructor() {
          // 当前游戏状态
          this.currentState = GameState.LOADING;
          this.previousState = GameState.LOADING;
          // 游戏数据
          this.gameData = {
            currentScore: 0,
            targetScore: 1000,
            moveCount: 0,
            remainingBlocks: 100,
            elapsedTime: 0,
            level: 1
          };
          // 游戏统计
          this.gameStatistics = {
            totalMoves: 0,
            totalScore: 0,
            largestElimination: 0,
            averageScorePerMove: 0,
            playTime: 0,
            consecutiveVictories: 0
          };
          // 时间跟踪
          this.gameStartTime = 0;
          this.pauseStartTime = 0;
          this.totalPausedTime = 0;
          // 状态变化回调
          this.stateChangeCallbacks = new Map();
        }

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


        initializeStateCallbacks() {
          for (var state of Object.values(GameState)) {
            this.stateChangeCallbacks.set(state, []);
          }
        }
        /**
         * 设置游戏状态
         */


        setState(newState) {
          if (this.currentState === newState) {
            console.log("\u26A0\uFE0F \u6E38\u620F\u72B6\u6001\u5DF2\u7ECF\u662F " + newState + "\uFF0C\u8DF3\u8FC7\u8BBE\u7F6E");
            return;
          }

          console.log("\uD83D\uDD04 \u6E38\u620F\u72B6\u6001\u53D8\u5316: " + this.currentState + " -> " + newState); // 处理状态退出逻辑

          this.handleStateExit(this.currentState); // 更新状态

          this.previousState = this.currentState;
          this.currentState = newState; // 处理状态进入逻辑

          this.handleStateEnter(newState); // 调用状态变化回调

          this.triggerStateCallbacks(newState);
        }
        /**
         * 处理状态退出逻辑
         */


        handleStateExit(state) {
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


        handleStateEnter(state) {
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


        finalizeGameSession() {
          // 更新游戏统计
          this.gameStatistics.totalMoves += this.gameData.moveCount;
          this.gameStatistics.totalScore += this.gameData.currentScore;
          this.gameStatistics.playTime += this.gameData.elapsedTime;

          if (this.gameData.moveCount > 0) {
            this.gameStatistics.averageScorePerMove = this.gameStatistics.totalScore / this.gameStatistics.totalMoves;
          }

          if (this.currentState === GameState.VICTORY) {
            this.gameStatistics.consecutiveVictories++;
          } else {
            this.gameStatistics.consecutiveVictories = 0;
          } // 保存统计数据


          this.saveGameStatistics();
          console.log('📊 游戏会话结束，统计数据已更新');
        }
        /**
         * 开始新游戏
         */


        startNewGame(level, targetScore) {
          if (level === void 0) {
            level = 1;
          }

          if (targetScore === void 0) {
            targetScore = 1000;
          }

          console.log("\uD83C\uDFAE \u5F00\u59CB\u65B0\u6E38\u620F - \u5173\u5361: " + level + ", \u76EE\u6807\u5206\u6570: " + targetScore); // 重置游戏数据

          this.gameData = {
            currentScore: 0,
            targetScore: targetScore,
            moveCount: 0,
            remainingBlocks: 100,
            // 10x10 棋盘
            elapsedTime: 0,
            level: level
          }; // 重置时间跟踪

          this.gameStartTime = 0;
          this.pauseStartTime = 0;
          this.totalPausedTime = 0; // 设置为游戏中状态

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


        endGame(isVictory) {
          if (isVictory === void 0) {
            isVictory = false;
          }

          var newState = isVictory ? GameState.VICTORY : GameState.GAME_OVER;
          this.setState(newState);
        }
        /**
         * 更新游戏数据
         */


        updateGameData(updates) {
          Object.assign(this.gameData, updates); // 检查胜利条件

          if (updates.currentScore !== undefined && this.gameData.currentScore >= this.gameData.targetScore) {
            this.endGame(true);
          } // 检查失败条件（如果需要的话）
          // 例如：无可消除方块且分数不足

        }
        /**
         * 记录消除操作
         */


        recordElimination(blocksEliminated, scoreGained) {
          this.gameData.moveCount++;
          this.gameData.currentScore += scoreGained;
          this.gameData.remainingBlocks -= blocksEliminated; // 更新最大消除记录

          if (blocksEliminated > this.gameStatistics.largestElimination) {
            this.gameStatistics.largestElimination = blocksEliminated;
          }

          console.log("\uD83D\uDCDD \u8BB0\u5F55\u6D88\u9664: " + blocksEliminated + " \u4E2A\u65B9\u5757, +" + scoreGained + " \u5206");
        }
        /**
         * 获取当前游戏状态
         */


        getCurrentState() {
          return this.currentState;
        }
        /**
         * 获取上一个游戏状态
         */


        getPreviousState() {
          return this.previousState;
        }
        /**
         * 获取游戏数据
         */


        getGameData() {
          return _extends({}, this.gameData);
        }
        /**
         * 获取游戏统计
         */


        getGameStatistics() {
          return _extends({}, this.gameStatistics);
        }
        /**
         * 检查是否可以进行游戏操作
         */


        canPerformGameAction() {
          return this.currentState === GameState.PLAYING;
        }
        /**
         * 检查游戏是否结束
         */


        isGameEnded() {
          return this.currentState === GameState.GAME_OVER || this.currentState === GameState.VICTORY;
        }
        /**
         * 检查游戏是否暂停
         */


        isGamePaused() {
          return this.currentState === GameState.PAUSED;
        }
        /**
         * 注册状态变化回调
         */


        onStateChange(state, callback) {
          var callbacks = this.stateChangeCallbacks.get(state);

          if (callbacks) {
            callbacks.push(callback);
          }
        }
        /**
         * 移除状态变化回调
         */


        offStateChange(state, callback) {
          var callbacks = this.stateChangeCallbacks.get(state);

          if (callbacks) {
            var index = callbacks.indexOf(callback);

            if (index > -1) {
              callbacks.splice(index, 1);
            }
          }
        }
        /**
         * 触发状态变化回调
         */


        triggerStateCallbacks(state) {
          var callbacks = this.stateChangeCallbacks.get(state);

          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback();
              } catch (error) {
                console.error("\u274C \u72B6\u6001\u56DE\u8C03\u6267\u884C\u51FA\u9519: " + error);
              }
            });
          }
        }
        /**
         * 获取游戏进度百分比
         */


        getGameProgress() {
          if (this.gameData.targetScore <= 0) return 0;
          return Math.min(100, this.gameData.currentScore / this.gameData.targetScore * 100);
        }
        /**
         * 获取游戏效率评级
         */


        getEfficiencyRating() {
          if (this.gameData.moveCount === 0) return "未开始";
          var avgScore = this.gameData.currentScore / this.gameData.moveCount;
          if (avgScore >= 20) return "优秀";
          if (avgScore >= 10) return "良好";
          if (avgScore >= 5) return "一般";
          return "需要改进";
        }
        /**
         * 保存游戏统计到本地存储
         */


        saveGameStatistics() {
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


        loadGameStatistics() {
          try {
            if (typeof localStorage !== 'undefined') {
              var saved = localStorage.getItem('starElimination_statistics');

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
          console.log("  \u5F53\u524D\u72B6\u6001: " + this.currentState);
          console.log("  \u4E0A\u4E00\u72B6\u6001: " + this.previousState);
          console.log("  \u6E38\u620F\u6570\u636E:", this.gameData);
          console.log("  \u6E38\u620F\u7EDF\u8BA1:", this.gameStatistics);
          console.log("  \u6E38\u620F\u8FDB\u5EA6: " + this.getGameProgress().toFixed(1) + "%");
          console.log("  \u6548\u7387\u8BC4\u7EA7: " + this.getEfficiencyRating());
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=aa8918f43d512f5bf76324dc2da6c7ad336f2722.js.map