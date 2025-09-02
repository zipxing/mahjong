System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Vec3, input, Input, UITransform, ccFind, InputManager, _crd;

  function _reportPossibleCrUseOfBlockData(extras) {
    _reporterNs.report("BlockData", "./BoardManager", _context.meta, extras);
  }

  _export("InputManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Vec3 = _cc.Vec3;
      input = _cc.input;
      Input = _cc.Input;
      UITransform = _cc.UITransform;
      ccFind = _cc.find;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bc46cYImD9Ac50UQ5Azqunq", "InputManager", undefined);
      /**
       * 输入管理器
       * 负责处理触摸输入和点击事件
       */


      __checkObsolete__(['Node', 'Vec3', 'input', 'Input', 'EventTouch', 'Camera', 'UITransform', 'find']);

      _export("InputManager", InputManager = class InputManager {
        constructor() {
          this.inputInterface = null;
          this.isInputEnabled = true;
          // 触摸状态
          this.isMouseDown = false;
          this.lastClickTime = 0;
          this.clickDelay = 100;
          // 防止重复点击的延迟（毫秒）
          // 高亮状态
          this.highlightedBlocks = [];
          this.isHighlightActive = false;
        }

        /**
         * 初始化输入管理器
         */
        init(inputInterface) {
          this.inputInterface = inputInterface;
          this.setupInputEvents();
          console.log('✅ 输入管理器初始化完成');
        }
        /**
         * 设置输入事件监听
         */


        setupInputEvents() {
          // 监听触摸开始
          input.on(Input.EventType.TOUCH_START, this.onTouchStart, this); // 监听触摸结束

          input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this); // 监听触摸移动（用于取消高亮）

          input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this); // 监听鼠标点击（用于桌面端）

          input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
          input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
          console.log('🎮 输入事件监听已设置');
        }
        /**
         * 触摸开始事件
         */


        onTouchStart(event) {
          if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
          }

          this.isMouseDown = true;
          var touchPos = event.getUILocation();
          console.log("\uD83D\uDCF1 \u89E6\u6478UI\u5750\u6807: (" + touchPos.x + ", " + touchPos.y + ")"); // 将UI坐标转换为世界坐标

          var worldPos = this.uiToWorldPosition(touchPos);
          console.log("\uD83C\uDF0D \u8F6C\u6362\u540E\u4E16\u754C\u5750\u6807: (" + worldPos.x + ", " + worldPos.y + ")");
          this.handlePointerDown(worldPos);
        }
        /**
         * 触摸结束事件
         */


        onTouchEnd(event) {
          if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
          }

          this.isMouseDown = false;
          var touchPos = event.getUILocation();
          console.log("\uD83D\uDCF1 \u89E6\u6478UI\u5750\u6807: (" + touchPos.x + ", " + touchPos.y + ")"); // 将UI坐标转换为世界坐标

          var worldPos = this.uiToWorldPosition(touchPos);
          console.log("\uD83C\uDF0D \u8F6C\u6362\u540E\u4E16\u754C\u5750\u6807: (" + worldPos.x + ", " + worldPos.y + ")");
          this.handlePointerUp(worldPos);
        }
        /**
         * 触摸移动事件
         */


        onTouchMove(event) {
          if (!this.isInputEnabled || !this.inputInterface.isGameActive() || !this.isMouseDown) {
            return;
          } // 如果正在拖拽，清除高亮


          this.clearHighlight();
        }
        /**
         * 鼠标按下事件
         */


        onMouseDown(event) {
          if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
          }

          this.isMouseDown = true;
          var mousePos = event.getUILocation();
          console.log("\uD83D\uDDB1\uFE0F \u9F20\u6807UI\u5750\u6807: (" + mousePos.x + ", " + mousePos.y + ")"); // 将UI坐标转换为世界坐标

          var worldPos = this.uiToWorldPosition(mousePos);
          console.log("\uD83C\uDF0D \u8F6C\u6362\u540E\u4E16\u754C\u5750\u6807: (" + worldPos.x + ", " + worldPos.y + ")");
          this.handlePointerDown(worldPos);
        }
        /**
         * 鼠标释放事件
         */


        onMouseUp(event) {
          if (!this.isInputEnabled || !this.inputInterface.isGameActive()) {
            return;
          }

          this.isMouseDown = false;
          var mousePos = event.getUILocation();
          console.log("\uD83D\uDDB1\uFE0F \u9F20\u6807UI\u5750\u6807: (" + mousePos.x + ", " + mousePos.y + ")"); // 将UI坐标转换为世界坐标

          var worldPos = this.uiToWorldPosition(mousePos);
          console.log("\uD83C\uDF0D \u8F6C\u6362\u540E\u4E16\u754C\u5750\u6807: (" + worldPos.x + ", " + worldPos.y + ")");
          this.handlePointerUp(worldPos);
        }
        /**
         * 处理指针按下
         */


        handlePointerDown(worldPos) {
          console.log("\n\uD83D\uDC46 ===== \u6307\u9488\u6309\u4E0B\u4E8B\u4EF6 =====");
          console.log("\uD83D\uDCCD \u4E16\u754C\u5750\u6807: (" + worldPos.x.toFixed(1) + ", " + worldPos.y.toFixed(1) + ")");
          console.log("\uD83D\uDD0D \u8C03\u7528\u6765\u6E90\u8DDF\u8E2A:");
          console.trace();
          var gridPos = this.inputInterface.screenToGridPosition(worldPos);
          console.log("\uD83C\uDFAF \u7F51\u683C\u5750\u6807: (" + gridPos.row + ", " + gridPos.col + ")");
          var blockData = this.inputInterface.getBlockAt(gridPos.row, gridPos.col);
          console.log("\uD83D\uDCE6 \u65B9\u5757\u6570\u636E:", blockData);

          if (blockData && blockData.type !== -1) {
            console.log("\uD83D\uDC46 \u6309\u4E0B\u65B9\u5757: (" + gridPos.row + ", " + gridPos.col + "), \u7C7B\u578B: " + blockData.type); // 高亮连通区域作为预览

            this.highlightConnectedBlocks(gridPos.row, gridPos.col);
          } else {
            console.log("\u274C \u6309\u4E0B\u4E86\u7A7A\u4F4D\u7F6E\u6216\u65E0\u6548\u4F4D\u7F6E");
          }

          console.log("\uD83D\uDC46 ===== \u6307\u9488\u6309\u4E0B\u4E8B\u4EF6\u7ED3\u675F =====\n");
        }
        /**
         * 处理指针释放
         */


        handlePointerUp(worldPos) {
          console.log("\n\uD83D\uDC46 ===== \u6307\u9488\u91CA\u653E\u4E8B\u4EF6 =====");
          console.log("\uD83D\uDCCD \u4E16\u754C\u5750\u6807: (" + worldPos.x.toFixed(1) + ", " + worldPos.y.toFixed(1) + ")"); // 防止重复点击

          var currentTime = Date.now();
          console.log("\u23F0 \u5F53\u524D\u65F6\u95F4: " + currentTime + ", \u4E0A\u6B21\u70B9\u51FB: " + this.lastClickTime + ", \u95F4\u9694: " + (currentTime - this.lastClickTime) + "ms");

          if (currentTime - this.lastClickTime < this.clickDelay) {
            console.log("\u274C \u70B9\u51FB\u95F4\u9694\u592A\u77ED\uFF0C\u5FFD\u7565\u6B64\u6B21\u70B9\u51FB (< " + this.clickDelay + "ms)");
            return;
          }

          this.lastClickTime = currentTime;
          var gridPos = this.inputInterface.screenToGridPosition(worldPos);
          console.log("\uD83C\uDFAF \u7F51\u683C\u5750\u6807: (" + gridPos.row + ", " + gridPos.col + ")");
          var blockData = this.inputInterface.getBlockAt(gridPos.row, gridPos.col);
          console.log("\uD83D\uDCE6 \u65B9\u5757\u6570\u636E:", blockData);

          if (blockData && blockData.type !== -1) {
            console.log("\uD83D\uDC46 \u786E\u8BA4\u70B9\u51FB\u65B9\u5757: (" + gridPos.row + ", " + gridPos.col + "), \u7C7B\u578B: " + blockData.type); // 清除高亮

            this.clearHighlight(); // 执行点击回调

            console.log("\uD83D\uDD04 \u8C03\u7528\u6E38\u620F\u903B\u8F91\u5904\u7406\u70B9\u51FB...");
            this.inputInterface.onBlockClick(gridPos.row, gridPos.col);
          } else {
            console.log("\uD83D\uDC46 \u70B9\u51FB\u7A7A\u4F4D: (" + gridPos.row + ", " + gridPos.col + ")");
            this.clearHighlight();
          }

          console.log("\uD83D\uDC46 ===== \u6307\u9488\u91CA\u653E\u4E8B\u4EF6\u7ED3\u675F =====\n");
        }
        /**
         * 高亮连通的方块
         */


        highlightConnectedBlocks(row, col) {
          // 清除之前的高亮
          this.clearHighlight(); // 获取连通区域（简化版，实际应该调用EliminationManager）

          var connectedBlocks = this.findConnectedBlocks(row, col);

          if (connectedBlocks.length >= 2) {
            this.highlightedBlocks = connectedBlocks;
            this.isHighlightActive = true; // 实际的高亮逻辑应该通过回调接口实现

            console.log("\u2728 \u9AD8\u4EAE " + connectedBlocks.length + " \u4E2A\u8FDE\u901A\u65B9\u5757");
          }
        }
        /**
         * 简化版连通区域查找（实际应该委托给EliminationManager）
         */


        findConnectedBlocks(startRow, startCol) {
          var boardData = this.inputInterface.getBoardData();
          var boardSize = boardData.length;

          if (!this.isValidPosition(startRow, startCol, boardSize) || boardData[startRow][startCol].type === -1) {
            return [];
          }

          var targetType = boardData[startRow][startCol].type;
          var visited = [];
          var connectedBlocks = []; // 初始化访问标记

          for (var i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
          } // BFS队列


          var queue = [{
            row: startRow,
            col: startCol
          }];
          visited[startRow][startCol] = true;
          connectedBlocks.push({
            row: startRow,
            col: startCol
          }); // 四个方向

          var directions = [{
            dr: -1,
            dc: 0
          }, // 上
          {
            dr: 1,
            dc: 0
          }, // 下
          {
            dr: 0,
            dc: -1
          }, // 左
          {
            dr: 0,
            dc: 1
          } // 右
          ];

          while (queue.length > 0) {
            var current = queue.shift();

            for (var dir of directions) {
              var newRow = current.row + dir.dr;
              var newCol = current.col + dir.dc;

              if (!this.isValidPosition(newRow, newCol, boardSize) || visited[newRow][newCol] || boardData[newRow][newCol].type !== targetType) {
                continue;
              }

              visited[newRow][newCol] = true;
              queue.push({
                row: newRow,
                col: newCol
              });
              connectedBlocks.push({
                row: newRow,
                col: newCol
              });
            }
          }

          return connectedBlocks;
        }
        /**
         * 检查位置是否有效
         */


        isValidPosition(row, col, boardSize) {
          return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
        }
        /**
         * 清除高亮显示
         */


        clearHighlight() {
          if (this.isHighlightActive) {
            console.log('🧹 清除方块高亮');
            this.highlightedBlocks = [];
            this.isHighlightActive = false;
          }
        }
        /**
         * UI坐标转换为世界坐标
         */


        uiToWorldPosition(uiPos) {
          // 获取Canvas节点
          var canvas = ccFind('Canvas');

          if (!canvas) {
            console.error('❌ 找不到Canvas节点');
            return new Vec3(uiPos.x, uiPos.y, 0);
          } // 获取Canvas的UITransform


          var canvasTransform = canvas.getComponent(UITransform);

          if (!canvasTransform) {
            console.warn('⚠️ Canvas没有UITransform组件，尝试添加...');
            canvasTransform = canvas.addComponent(UITransform);

            if (!canvasTransform) {
              console.error('❌ 无法为Canvas添加UITransform组件，使用默认坐标转换'); // 使用竖屏尺寸作为后备方案

              var _worldX = uiPos.x - 360; // 假设720宽度，中心为360


              var _worldY = 1280 - uiPos.y - 640; // 假设1280高度，Y轴翻转，中心为640


              console.log("\uD83D\uDD04 \u9ED8\u8BA4\u5750\u6807\u8F6C\u6362(\u7AD6\u5C4F): UI(" + uiPos.x + ", " + uiPos.y + ") -> World(" + _worldX + ", " + _worldY + ")");
              return new Vec3(_worldX, _worldY, 0);
            }
          } // 检查Canvas尺寸，但优先使用编辑器设置


          var designSize = canvasTransform.contentSize;
          console.log("\uD83D\uDCD0 \u5F53\u524DCanvas\u5C3A\u5BF8: " + designSize.width + " x " + designSize.height); // 判断屏幕方向

          var isPortrait = designSize.height > designSize.width;
          console.log("\uD83D\uDCF1 \u5C4F\u5E55\u65B9\u5411: " + (isPortrait ? '竖屏' : '横屏'));

          if (designSize.width === 100 && designSize.height === 100) {
            // 只有在默认尺寸时才自动设置，推荐在编辑器中手动设置
            console.log('🔧 检测到默认尺寸，建议在编辑器中设置Canvas为720x1280');
            console.log('📝 临时设置为竖屏分辨率...');
            canvasTransform.setContentSize(720, 1280); // 竖屏：宽720，高1280

            designSize = canvasTransform.contentSize; // 重新获取更新后的尺寸

            console.log('✅ Canvas尺寸已临时设置为 720 x 1280 (竖屏)');
          }

          console.log("\uD83D\uDCD0 \u6700\u7EC8Canvas\u8BBE\u8BA1\u5C3A\u5BF8: " + designSize.width + " x " + designSize.height); // 将UI坐标转换为世界坐标（相对于Canvas中心）
          // 注意：Cocos Creator的UI坐标原点在左下角，世界坐标中心在Canvas中心
          // 但是鼠标/触摸坐标可能是从左上角开始的，需要Y轴翻转

          var worldX = uiPos.x - designSize.width / 2; // 检查Y轴方向：如果UI坐标很大（接近屏幕高度），说明是从上到下的坐标系

          var worldY;

          if (uiPos.y > designSize.height * 0.5) {
            // 可能是从左上角开始的坐标系，需要Y轴翻转
            worldY = designSize.height - uiPos.y - designSize.height / 2;
            console.log("\uD83D\uDD04 Y\u8F74\u7FFB\u8F6C\u6A21\u5F0F: UI_Y=" + uiPos.y + " -> Flipped_Y=" + (designSize.height - uiPos.y) + " -> World_Y=" + worldY.toFixed(1));
          } else {
            // 正常的从左下角开始的坐标系
            worldY = uiPos.y - designSize.height / 2;
            console.log("\uD83D\uDD04 Y\u8F74\u6B63\u5E38\u6A21\u5F0F: UI_Y=" + uiPos.y + " -> World_Y=" + worldY.toFixed(1));
          }

          console.log("\uD83D\uDD04 \u6700\u7EC8\u5750\u6807\u8F6C\u6362: UI(" + uiPos.x + ", " + uiPos.y + ") -> World(" + worldX + ", " + worldY + ")");
          return new Vec3(worldX, worldY, 0);
        }
        /**
         * 启用输入
         */


        enableInput() {
          this.isInputEnabled = true;
          console.log('✅ 输入已启用');
        }
        /**
         * 禁用输入
         */


        disableInput() {
          this.isInputEnabled = false;
          this.clearHighlight();
          console.log('❌ 输入已禁用');
        }
        /**
         * 获取当前高亮的方块
         */


        getHighlightedBlocks() {
          return [...this.highlightedBlocks];
        }
        /**
         * 检查是否有高亮显示
         */


        hasHighlight() {
          return this.isHighlightActive;
        }
        /**
         * 销毁输入管理器
         */


        destroy() {
          // 移除事件监听
          input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
          input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
          input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
          input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
          input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this); // 清除状态

          this.clearHighlight();
          console.log('🗑️ 输入管理器已销毁');
        }
        /**
         * 调试：打印输入状态
         */


        debugPrintInputState() {
          console.log('🎮 输入状态:');
          console.log("  \u8F93\u5165\u542F\u7528: " + this.isInputEnabled);
          console.log("  \u9F20\u6807\u6309\u4E0B: " + this.isMouseDown);
          console.log("  \u9AD8\u4EAE\u6FC0\u6D3B: " + this.isHighlightActive);
          console.log("  \u9AD8\u4EAE\u65B9\u5757\u6570: " + this.highlightedBlocks.length);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b16389902205dcb6c683b4d2cd8976eb9ce744b1.js.map