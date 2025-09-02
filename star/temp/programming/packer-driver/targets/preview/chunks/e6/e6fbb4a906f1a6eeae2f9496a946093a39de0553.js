System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Button, Vec3, tween, Color, _decorator, UIManager, _crd, ccclass, property;

  _export("UIManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Button = _cc.Button;
      Vec3 = _cc.Vec3;
      tween = _cc.tween;
      Color = _cc.Color;
      _decorator = _cc._decorator;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "276f2YsfL1JIYWlN9bZfuUS", "UIManager", undefined);
      /**
       * UI管理器
       * 负责管理游戏界面的显示和交互
       */


      __checkObsolete__(['Node', 'Label', 'Button', 'Vec3', 'tween', 'Color', '_decorator']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("UIManager", UIManager = class UIManager {
        constructor() {
          // UI节点引用
          this.scoreLabel = null;
          this.targetScoreLabel = null;
          this.moveCountLabel = null;
          this.gameOverPanel = null;
          this.finalScoreLabel = null;
          this.resultTitleLabel = null;
          this.restartButton = null;
          this.hintButton = null;
          this.pauseButton = null;
          // 回调接口
          this.onRestartCallback = null;
          this.onHintCallback = null;
          this.onPauseCallback = null;
          // UI状态
          this.isUIInitialized = false;
          this.currentScore = 0;
          this.targetScore = 1000;
          this.moveCount = 0;
        }

        /**
         * 初始化UI管理器
         */
        init(uiReferences) {
          // 设置UI引用
          this.scoreLabel = uiReferences.scoreLabel || null;
          this.targetScoreLabel = uiReferences.targetScoreLabel || null;
          this.moveCountLabel = uiReferences.moveCountLabel || null;
          this.gameOverPanel = uiReferences.gameOverPanel || null;
          this.finalScoreLabel = uiReferences.finalScoreLabel || null;
          this.resultTitleLabel = uiReferences.resultTitleLabel || null;
          this.restartButton = uiReferences.restartButton || null;
          this.hintButton = uiReferences.hintButton || null;
          this.pauseButton = uiReferences.pauseButton || null; // 设置按钮事件

          this.setupButtonEvents(); // 初始化UI显示

          this.initializeUI();
          this.isUIInitialized = true;
          console.log('✅ UI管理器初始化完成');
        }
        /**
         * 设置按钮事件
         */


        setupButtonEvents() {
          if (this.restartButton) {
            this.restartButton.node.on(Button.EventType.CLICK, this.onRestartButtonClick, this);
          }

          if (this.hintButton) {
            this.hintButton.node.on(Button.EventType.CLICK, this.onHintButtonClick, this);
          }

          if (this.pauseButton) {
            this.pauseButton.node.on(Button.EventType.CLICK, this.onPauseButtonClick, this);
          }
        }
        /**
         * 初始化UI显示
         */


        initializeUI() {
          this.updateScoreDisplay();
          this.updateMoveCountDisplay();
          this.hideGameOverPanel();
        }
        /**
         * 更新游戏状态显示
         */


        updateGameState(gameState) {
          this.currentScore = gameState.score;
          this.targetScore = gameState.targetScore;
          this.moveCount = gameState.moveCount;
          this.updateScoreDisplay();
          this.updateMoveCountDisplay();

          if (gameState.isGameOver) {
            this.showGameOverPanel(gameState);
          }
        }
        /**
         * 更新分数显示
         */


        updateScoreDisplay() {
          if (this.scoreLabel) {
            this.scoreLabel.string = "\u5206\u6570: " + this.currentScore; // 分数变化动画

            this.animateScoreChange();
          }

          if (this.targetScoreLabel) {
            this.targetScoreLabel.string = "\u76EE\u6807: " + this.targetScore; // 根据完成度改变颜色

            var progress = this.currentScore / this.targetScore;

            if (progress >= 1.0) {
              this.targetScoreLabel.color = new Color(0, 255, 0, 255); // 绿色
            } else if (progress >= 0.8) {
              this.targetScoreLabel.color = new Color(255, 165, 0, 255); // 橙色
            } else {
              this.targetScoreLabel.color = new Color(255, 255, 255, 255); // 白色
            }
          }
        }
        /**
         * 更新移动次数显示
         */


        updateMoveCountDisplay() {
          if (this.moveCountLabel) {
            this.moveCountLabel.string = "\u79FB\u52A8: " + this.moveCount;
          }
        }
        /**
         * 分数变化动画
         */


        animateScoreChange() {
          if (!this.scoreLabel) return;
          var labelNode = this.scoreLabel.node; // 缩放动画

          tween(labelNode).to(0.1, {
            scale: new Vec3(1.2, 1.2, 1)
          }).to(0.1, {
            scale: new Vec3(1, 1, 1)
          }).start();
        }
        /**
         * 显示游戏结束面板
         */


        showGameOverPanel(gameState) {
          if (!this.gameOverPanel) return; // 显示面板

          this.gameOverPanel.active = true; // 设置结果文本

          var isSuccess = gameState.score >= gameState.targetScore;

          if (this.resultTitleLabel) {
            this.resultTitleLabel.string = isSuccess ? "🎉 恭喜过关！" : "😔 游戏结束";
            this.resultTitleLabel.color = isSuccess ? new Color(0, 255, 0, 255) : // 绿色
            new Color(255, 100, 100, 255); // 红色
          }

          if (this.finalScoreLabel) {
            var efficiency = gameState.moveCount > 0 ? Math.round(gameState.score / gameState.moveCount * 100) / 100 : 0;
            this.finalScoreLabel.string = "\u6700\u7EC8\u5F97\u5206: " + gameState.score + "\n" + ("\u76EE\u6807\u5F97\u5206: " + gameState.targetScore + "\n") + ("\u79FB\u52A8\u6B21\u6570: " + gameState.moveCount + "\n") + ("\u5E73\u5747\u6548\u7387: " + efficiency + " \u5206/\u6B21\n") + ("\u5269\u4F59\u65B9\u5757: " + gameState.remainingBlocks + " \u4E2A");
          } // 面板出现动画


          this.animateGameOverPanel();
        }
        /**
         * 隐藏游戏结束面板
         */


        hideGameOverPanel() {
          if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
          }
        }
        /**
         * 游戏结束面板出现动画
         */


        animateGameOverPanel() {
          if (!this.gameOverPanel) return; // 初始状态：缩放为0

          this.gameOverPanel.setScale(new Vec3(0, 0, 1)); // 弹出动画

          tween(this.gameOverPanel).to(0.3, {
            scale: new Vec3(1, 1, 1)
          }, {
            easing: 'backOut'
          }).start();
        }
        /**
         * 显示得分增加动画
         */


        showScoreIncrease(scoreIncrease, position) {
          if (!this.scoreLabel || scoreIncrease <= 0) return; // 创建临时分数增加提示
          // 注意：这里需要在实际项目中创建一个临时节点来显示

          console.log("\uD83D\uDCB0 +" + scoreIncrease + " \u5206\uFF01"); // 更新分数显示

          this.updateScoreDisplay();
        }
        /**
         * 显示连击效果
         */


        showComboEffect(comboCount) {
          if (comboCount <= 1) return;
          console.log("\uD83D\uDD25 " + comboCount + "\u8FDE\u51FB\uFF01"); // 在实际项目中，这里可以显示连击特效
          // 比如创建临时文字节点，播放粒子效果等
        }
        /**
         * 设置按钮可用性
         */


        setButtonEnabled(buttonType, enabled) {
          var button = null;

          switch (buttonType) {
            case 'hint':
              button = this.hintButton;
              break;

            case 'pause':
              button = this.pauseButton;
              break;

            case 'restart':
              button = this.restartButton;
              break;
          }

          if (button) {
            button.enabled = enabled;
            button.node.opacity = enabled ? 255 : 128;
          }
        }
        /**
         * 显示提示信息
         */


        showHint(message, duration) {
          if (duration === void 0) {
            duration = 2.0;
          }

          console.log("\uD83D\uDCA1 \u63D0\u793A: " + message); // 在实际项目中，这里可以显示临时提示文字
          // 比如创建一个飘浮的文字节点
        }
        /**
         * 重新开始按钮点击
         */


        onRestartButtonClick() {
          console.log('🔄 点击重新开始按钮');

          if (this.onRestartCallback) {
            this.onRestartCallback();
          }

          this.hideGameOverPanel();
        }
        /**
         * 提示按钮点击
         */


        onHintButtonClick() {
          console.log('💡 点击提示按钮');

          if (this.onHintCallback) {
            this.onHintCallback();
          }
        }
        /**
         * 暂停按钮点击
         */


        onPauseButtonClick() {
          console.log('⏸️ 点击暂停按钮');

          if (this.onPauseCallback) {
            this.onPauseCallback();
          }
        }
        /**
         * 设置回调函数
         */


        setCallbacks(callbacks) {
          this.onRestartCallback = callbacks.onRestart || null;
          this.onHintCallback = callbacks.onHint || null;
          this.onPauseCallback = callbacks.onPause || null;
        }
        /**
         * 显示加载界面
         */


        showLoading(message) {
          if (message === void 0) {
            message = "加载中...";
          }

          console.log("\u23F3 " + message); // 在实际项目中显示加载动画
        }
        /**
         * 隐藏加载界面
         */


        hideLoading() {
          console.log('✅ 加载完成'); // 隐藏加载动画
        }
        /**
         * 获取当前UI状态
         */


        getUIState() {
          return {
            isGameOverPanelVisible: this.gameOverPanel ? this.gameOverPanel.active : false,
            currentScore: this.currentScore,
            targetScore: this.targetScore,
            moveCount: this.moveCount
          };
        }
        /**
         * 销毁UI管理器
         */


        destroy() {
          // 移除按钮事件监听
          if (this.restartButton) {
            this.restartButton.node.off(Button.EventType.CLICK, this.onRestartButtonClick, this);
          }

          if (this.hintButton) {
            this.hintButton.node.off(Button.EventType.CLICK, this.onHintButtonClick, this);
          }

          if (this.pauseButton) {
            this.pauseButton.node.off(Button.EventType.CLICK, this.onPauseButtonClick, this);
          } // 清空回调


          this.onRestartCallback = null;
          this.onHintCallback = null;
          this.onPauseCallback = null;
          console.log('🗑️ UI管理器已销毁');
        }
        /**
         * 调试：打印UI状态
         */


        debugPrintUIState() {
          console.log('🖥️ UI状态:');
          console.log("  \u521D\u59CB\u5316\u72B6\u6001: " + this.isUIInitialized);
          console.log("  \u5F53\u524D\u5206\u6570: " + this.currentScore);
          console.log("  \u76EE\u6807\u5206\u6570: " + this.targetScore);
          console.log("  \u79FB\u52A8\u6B21\u6570: " + this.moveCount);
          console.log("  \u6E38\u620F\u7ED3\u675F\u9762\u677F: " + (this.gameOverPanel ? this.gameOverPanel.active : 'null'));
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e6fbb4a906f1a6eeae2f9496a946093a39de0553.js.map