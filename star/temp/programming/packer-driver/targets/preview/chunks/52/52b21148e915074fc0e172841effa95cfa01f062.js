System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Vec3, UITransform, BoardManager, _crd;

  function _reportPossibleCrUseOfBlockManager(extras) {
    _reporterNs.report("BlockManager", "./BlockManager", _context.meta, extras);
  }

  _export("BoardManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Vec3 = _cc.Vec3;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "44933BSq8dFBYUCamMksATi", "BoardManager", undefined);
      /**
       * 棋盘管理器
       * 负责管理10x10的游戏棋盘，包括棋盘数据结构、坐标转换、方块布局等功能
       */


      __checkObsolete__(['Node', 'Vec3', 'UITransform', 'director']);

      _export("BoardManager", BoardManager = class BoardManager {
        constructor() {
          this.gameBoardNode = null;
          this.boardData = [];
          this.boardSize = 10;
          this.blockSize = 60;
          this.blockSpacing = 5;
        }

        /**
         * 初始化棋盘管理器
         */
        init(gameBoardNode, boardSize, blockSize, blockSpacing) {
          this.gameBoardNode = gameBoardNode;
          this.boardSize = boardSize; // 动态适配屏幕尺寸

          this.adaptToScreenSize(blockSize, blockSpacing); // 初始化棋盘数据

          this.initBoardData();
          console.log("\u2705 \u68CB\u76D8\u7BA1\u7406\u5668\u521D\u59CB\u5316\u5B8C\u6210 " + boardSize + "x" + boardSize);
          console.log("\uD83D\uDCCF \u6700\u7EC8\u65B9\u5757\u5C3A\u5BF8: " + this.blockSize + "px, \u95F4\u8DDD: " + this.blockSpacing + "px");
          console.log("\uD83D\uDCD0 \u68CB\u76D8\u603B\u5C3A\u5BF8: " + this.getTotalBoardSize() + "px");
        }
        /**
         * 动态适配屏幕尺寸
         */


        adaptToScreenSize(defaultBlockSize, defaultBlockSpacing) {
          console.log("\uD83D\uDD27 \u4F7F\u7528\u56FA\u5B9A\u914D\u7F6E\uFF0C\u786E\u4FDD\u4E25\u683C10\xD710\u65B9\u5757"); // 修复间距问题：使用合理的方块尺寸和间距比例

          this.blockSize = 40; // 缩小方块到40px

          this.blockSpacing = 6; // 增大间距到6px (15%的方块尺寸)

          var totalSize = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing; // 10×40 + 9×6 = 400 + 54 = 454px

          console.log("\uD83D\uDCD0 \u56FA\u5B9A\u914D\u7F6E\u7ED3\u679C:");
          console.log("   - \u65B9\u5757\u5927\u5C0F: " + this.blockSize + "px");
          console.log("   - \u65B9\u5757\u95F4\u8DDD: " + this.blockSpacing + "px");
          console.log("   - \u68CB\u76D8\u603B\u5C3A\u5BF8: " + totalSize + "\xD7" + totalSize + "px");
          console.log("   - \u4E25\u683C\u63A7\u5236: " + this.boardSize + "\xD7" + this.boardSize + " = " + this.boardSize * this.boardSize + "\u4E2A\u65B9\u5757");
        }
        /**
         * 获取棋盘总尺寸
         */


        getTotalBoardSize() {
          var totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          var totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          return {
            width: totalWidth,
            height: totalHeight
          };
        }
        /**
         * 初始化棋盘数据结构
         */


        initBoardData() {
          this.boardData = [];

          for (var row = 0; row < this.boardSize; row++) {
            this.boardData[row] = [];

            for (var col = 0; col < this.boardSize; col++) {
              this.boardData[row][col] = {
                type: -1,
                // 初始为空
                node: null
              };
            }
          }
        }
        /**
         * 生成游戏棋盘
         */


        generateBoard(blockManager) {
          var _this$gameBoardNode$g, _this$gameBoardNode$g2;

          console.log('🎲 生成新的游戏棋盘'); // 打印布局信息

          var totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          var totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          console.log("\uD83D\uDCCA \u68CB\u76D8\u5E03\u5C40\u4FE1\u606F:");
          console.log("   - \u7F51\u683C\u5927\u5C0F: " + this.boardSize + " \xD7 " + this.boardSize);
          console.log("   - \u65B9\u5757\u5C3A\u5BF8: " + this.blockSize + " \xD7 " + this.blockSize + "px");
          console.log("   - \u65B9\u5757\u95F4\u8DDD: " + this.blockSpacing + "px");
          console.log("   - \u68CB\u76D8\u603B\u5C3A\u5BF8: " + totalWidth + " \xD7 " + totalHeight + "px");
          console.log("   - GameBoard\u8282\u70B9: " + this.gameBoardNode.name); // 检查GameBoard节点的Transform设置

          var gameBoardTransform = this.gameBoardNode.getComponent(UITransform);

          if (gameBoardTransform) {
            var contentSize = gameBoardTransform.contentSize;
            var anchorPoint = gameBoardTransform.anchorPoint;
            console.log("\uD83D\uDCD0 GameBoard UITransform:");
            console.log("   - ContentSize: " + contentSize.width + " \xD7 " + contentSize.height);
            console.log("   - AnchorPoint: (" + anchorPoint.x + ", " + anchorPoint.y + ")");
            console.log("   - \u4E16\u754C\u4F4D\u7F6E: (" + this.gameBoardNode.worldPosition.x.toFixed(1) + ", " + this.gameBoardNode.worldPosition.y.toFixed(1) + ")"); // 强制设置GameBoard为固定尺寸 (454×454)

            var requiredSize = 454; // 10×40 + 9×6 = 454

            console.log("\uD83D\uDD27 \u5F3A\u5236\u8BBE\u7F6EGameBoard ContentSize\u4E3A: " + requiredSize + " \xD7 " + requiredSize);
            gameBoardTransform.setContentSize(requiredSize, requiredSize); // 验证设置

            var finalContentSize = gameBoardTransform.contentSize;
            console.log("\u2705 GameBoard\u6700\u7EC8\u5C3A\u5BF8: " + finalContentSize.width + " \xD7 " + finalContentSize.height);

            if (anchorPoint.x !== 0.5 || anchorPoint.y !== 0.5) {
              console.warn("\u26A0\uFE0F \u81EA\u52A8\u8BBE\u7F6EGameBoard AnchorPoint\u4E3A: (0.5, 0.5)");
              gameBoardTransform.setAnchorPoint(0.5, 0.5);
              console.log("\u2705 \u5DF2\u81EA\u52A8\u8BBE\u7F6EGameBoard AnchorPoint\u4E3A: (0.5, 0.5)");
            } // 检查GameBoard位置是否合理 (应该在Canvas中心附近)


            var worldPos = this.gameBoardNode.worldPosition;

            if (Math.abs(worldPos.x - 360) > 50 || Math.abs(worldPos.y - 640) > 200) {
              console.warn("\u26A0\uFE0F GameBoard\u4F4D\u7F6E\u53EF\u80FD\u4E0D\u5408\u7406: (" + worldPos.x.toFixed(1) + ", " + worldPos.y.toFixed(1) + ")");
              console.log("\uD83D\uDCA1 \u5EFA\u8BAE\u5728Cocos Creator\u7F16\u8F91\u5668\u4E2D\u8C03\u6574GameBoard\u4F4D\u7F6E\u5230\u5C4F\u5E55\u4E2D\u5FC3");
            }
          } else {
            console.warn("\u26A0\uFE0F GameBoard\u8282\u70B9\u7F3A\u5C11UITransform\u7EC4\u4EF6");
          } // 清空现有棋盘


          this.clearBoard(); // 严格生成10×10方块，绝不超出

          console.log("\uD83C\uDFAF \u5F00\u59CB\u4E25\u683C\u521B\u5EFA " + this.boardSize + "\xD7" + this.boardSize + " = " + this.boardSize * this.boardSize + " \u4E2A\u65B9\u5757");
          var createdCount = 0;

          for (var row = 0; row < 10; row++) {
            for (var col = 0; col < 10; col++) {
              var blockType = Math.floor(Math.random() * blockManager.getBlockTypeCount()); // 添加随机数调试

              if (row < 2 && col < 5) {
                console.log("\uD83C\uDFB2 \u65B9\u5757[" + row + "][" + col + "] \u968F\u673A\u7C7B\u578B: " + blockType + " (\u5171" + blockManager.getBlockTypeCount() + "\u79CD)");
              } // 创建方块节点（传递动态计算的方块尺寸）


              var blockNode = blockManager.createBlockNode(blockType, this.blockSize);

              if (blockNode) {
                // 设置父节点
                blockNode.setParent(this.gameBoardNode); // 验证方块节点确实被创建（在设置父节点后）

                if (row === 0 && col === 0) {
                  var _blockNode$parent;

                  console.log("\u2705 \u7B2C\u4E00\u4E2A\u65B9\u5757\u521B\u5EFA\u6210\u529F: " + blockNode.name + ", \u5C3A\u5BF8: " + this.blockSize + "\xD7" + this.blockSize);
                  console.log("   \u65B9\u5757\u6FC0\u6D3B\u72B6\u6001: " + blockNode.active);
                  console.log("   \u65B9\u5757\u7236\u8282\u70B9: " + ((_blockNode$parent = blockNode.parent) == null ? void 0 : _blockNode$parent.name));
                  console.log("   GameBoard\u6FC0\u6D3B\u72B6\u6001: " + this.gameBoardNode.active);
                  console.log("   GameBoard\u5B50\u8282\u70B9\u6570: " + this.gameBoardNode.children.length);
                } // 设置位置


                var localPos = this.gridToLocal(row, col);
                blockNode.setPosition(localPos); // 设置名称便于调试

                blockNode.name = "Block_" + row + "_" + col; // 添加位置调试信息（简化版本）

                if (row < 3 && col < 3) {
                  console.log("\uD83D\uDCCD \u65B9\u5757[" + row + "][" + col + "] \u4F4D\u7F6E: (" + localPos.x.toFixed(1) + ", " + localPos.y.toFixed(1) + ")");
                } // 更新数据


                this.boardData[row][col] = {
                  type: blockType,
                  node: blockNode
                };
                createdCount++;
              } else {
                console.error("\u274C \u65B9\u5757[" + row + "][" + col + "]\u521B\u5EFA\u5931\u8D25\uFF01");
              }
            }
          }

          console.log("\uD83C\uDFAF \u65B9\u5757\u521B\u5EFA\u5B8C\u6210: \u5B9E\u9645\u521B\u5EFA " + createdCount + " \u4E2A\uFF0C\u9884\u671F 100 \u4E2A");

          if (createdCount !== 100) {
            console.error("\u274C \u65B9\u5757\u6570\u91CF\u4E0D\u6B63\u786E\uFF01\u9884\u671F100\u4E2A\uFF0C\u5B9E\u9645" + createdCount + "\u4E2A");
          } // 验证GameBoard状态


          console.log("\uD83D\uDD0D \u6700\u7EC8GameBoard\u72B6\u6001\u68C0\u67E5:");
          console.log("   - GameBoard\u6FC0\u6D3B: " + this.gameBoardNode.active);
          console.log("   - GameBoard\u5B50\u8282\u70B9\u603B\u6570: " + this.gameBoardNode.children.length);
          console.log("   - GameBoard ContentSize: " + ((_this$gameBoardNode$g = this.gameBoardNode.getComponent(UITransform)) == null ? void 0 : _this$gameBoardNode$g.contentSize.width) + "\xD7" + ((_this$gameBoardNode$g2 = this.gameBoardNode.getComponent(UITransform)) == null ? void 0 : _this$gameBoardNode$g2.contentSize.height)); // 检查前几个子节点

          for (var i = 0; i < Math.min(3, this.gameBoardNode.children.length); i++) {
            var child = this.gameBoardNode.children[i];
            console.log("   - \u5B50\u8282\u70B9[" + i + "]: " + child.name + ", \u6FC0\u6D3B: " + child.active + ", \u4F4D\u7F6E: (" + child.position.x.toFixed(1) + ", " + child.position.y.toFixed(1) + ")");
          } // 显示诊断完成，移除测试方块避免干扰


          console.log("\u2705 \u663E\u793A\u7CFB\u7EDF\u6B63\u5E38\uFF0C\u5DF2\u6DFB\u52A0\u767D\u8272\u8FB9\u6846\u5E2E\u52A9\u8BC6\u522B\u65B9\u5757\u8FB9\u754C"); // 统计实际创建的方块数量

          var totalBlocks = 0;
          var typeStats = {};

          for (var _row = 0; _row < this.boardSize; _row++) {
            for (var _col = 0; _col < this.boardSize; _col++) {
              var blockData = this.boardData[_row][_col];

              if (blockData && blockData.node) {
                totalBlocks++;
                typeStats[blockData.type] = (typeStats[blockData.type] || 0) + 1;
              }
            }
          }

          console.log("\u2705 \u68CB\u76D8\u751F\u6210\u5B8C\u6210 - \u603B\u8BA1 " + totalBlocks + " \u4E2A\u65B9\u5757");
          console.log("\uD83D\uDCCA \u65B9\u5757\u7C7B\u578B\u5206\u5E03:", typeStats); // 检查是否有方块没有正确显示

          if (totalBlocks < this.boardSize * this.boardSize) {
            console.warn("\u26A0\uFE0F \u65B9\u5757\u6570\u91CF\u4E0D\u8DB3\uFF01\u9884\u671F " + this.boardSize * this.boardSize + " \u4E2A\uFF0C\u5B9E\u9645 " + totalBlocks + " \u4E2A");
          }
        }
        /**
         * 清空棋盘
         */


        clearBoard() {
          for (var row = 0; row < this.boardSize; row++) {
            for (var col = 0; col < this.boardSize; col++) {
              var _this$boardData$row$c;

              if ((_this$boardData$row$c = this.boardData[row][col]) != null && _this$boardData$row$c.node) {
                this.boardData[row][col].node.removeFromParent();
              }

              this.boardData[row][col] = {
                type: -1,
                node: null
              };
            }
          }
        }
        /**
         * 网格坐标转换为本地坐标
         */


        gridToLocal(row, col) {
          // 计算棋盘的总尺寸
          var totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          var totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing; // 计算起始偏移（让棋盘居中）

          var startX = -totalWidth / 2 + this.blockSize / 2;
          var startY = totalHeight / 2 - this.blockSize / 2; // 计算具体位置

          var x = startX + col * (this.blockSize + this.blockSpacing);
          var y = startY - row * (this.blockSize + this.blockSpacing); // 添加详细调试信息（前几个方块）

          if (row === 0 && col < 3 || col === 0 && row < 3) {
            console.log("\uD83D\uDD0D \u7F51\u683C\u8F6C\u6362\u8BE6\u60C5 [" + row + "][" + col + "]:");
            console.log("   \u68CB\u76D8\u603B\u5C3A\u5BF8: " + totalWidth + " \xD7 " + totalHeight);
            console.log("   \u8D77\u59CB\u4F4D\u7F6E: (" + startX.toFixed(1) + ", " + startY.toFixed(1) + ")");
            console.log("   \u65B9\u5757\u5C3A\u5BF8: " + this.blockSize + "px, \u95F4\u8DDD: " + this.blockSpacing + "px");
            console.log("   \u6B65\u957F\u8BA1\u7B97: col=" + col + " \xD7 (" + this.blockSize + "+" + this.blockSpacing + ") = " + col * (this.blockSize + this.blockSpacing));
            console.log("   \u6700\u7EC8\u4F4D\u7F6E: (" + x.toFixed(1) + ", " + y.toFixed(1) + ")"); // 验证相邻方块间距

            if (col === 1 && row === 0) {
              var prevX = startX + 0 * (this.blockSize + this.blockSpacing);
              var distance = x - prevX;
              console.log("   \uD83D\uDD0D \u4E0E\u524D\u4E00\u65B9\u5757\u8DDD\u79BB: " + distance + "px (\u9884\u671F: " + (this.blockSize + this.blockSpacing) + "px)");

              if (Math.abs(distance - (this.blockSize + this.blockSpacing)) > 0.1) {
                console.warn("   \u26A0\uFE0F \u95F4\u8DDD\u5F02\u5E38\uFF01");
              }
            }
          }

          return new Vec3(x, y, 0);
        }
        /**
         * 屏幕坐标转换为网格坐标
         */


        screenToGridPosition(screenPos) {
          console.log("\n\uD83D\uDD04 ===== \u5750\u6807\u8F6C\u6362\u5F00\u59CB =====");
          console.log("\uD83D\uDCCD \u8F93\u5165\u4E16\u754C\u5750\u6807: (" + screenPos.x.toFixed(1) + ", " + screenPos.y.toFixed(1) + ")"); // 获取棋盘节点的世界坐标

          var boardWorldPos = this.gameBoardNode.getWorldPosition();
          console.log("\uD83C\uDFAE \u68CB\u76D8\u4E16\u754C\u5750\u6807: (" + boardWorldPos.x.toFixed(1) + ", " + boardWorldPos.y.toFixed(1) + ")"); // 转换为相对于棋盘中心的坐标

          var relativeX = screenPos.x - boardWorldPos.x;
          var relativeY = screenPos.y - boardWorldPos.y;
          console.log("\uD83D\uDCD0 \u76F8\u5BF9\u5750\u6807: (" + relativeX.toFixed(1) + ", " + relativeY.toFixed(1) + ")"); // 计算网格参数

          var totalWidth = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          var totalHeight = this.boardSize * this.blockSize + (this.boardSize - 1) * this.blockSpacing;
          console.log("\uD83D\uDCCF \u68CB\u76D8\u603B\u5C3A\u5BF8: " + totalWidth + " x " + totalHeight); // 网格布局：棋盘中心为原点，向左右上下扩展

          var startX = -totalWidth / 2 + this.blockSize / 2; // 第一个方块的中心X

          var startY = totalHeight / 2 - this.blockSize / 2; // 第一个方块的中心Y

          console.log("\uD83C\uDFC1 \u7B2C\u4E00\u4E2A\u65B9\u5757\u4E2D\u5FC3: (" + startX.toFixed(1) + ", " + startY.toFixed(1) + ")"); // 计算点击位置相对于第一个方块的偏移

          var offsetX = relativeX - startX;
          var offsetY = startY - relativeY; // Y轴向下为正

          console.log("\uD83D\uDCCF \u76F8\u5BF9\u7B2C\u4E00\u4E2A\u65B9\u5757\u504F\u79FB: (" + offsetX.toFixed(1) + ", " + offsetY.toFixed(1) + ")"); // 计算网格坐标

          var blockStep = this.blockSize + this.blockSpacing;
          var rawCol = offsetX / blockStep;
          var rawRow = offsetY / blockStep;
          console.log("\uD83E\uDDEE \u539F\u59CB\u7F51\u683C\u5750\u6807: (" + rawRow.toFixed(2) + ", " + rawCol.toFixed(2) + ")"); // 取整并限制范围

          var col = Math.max(0, Math.min(this.boardSize - 1, Math.floor(rawCol + 0.5))); // +0.5 进行四舍五入

          var row = Math.max(0, Math.min(this.boardSize - 1, Math.floor(rawRow + 0.5)));
          console.log("\uD83C\uDFAF \u6700\u7EC8\u7F51\u683C\u5750\u6807: (" + row + ", " + col + ")"); // 验证：计算该网格位置的实际世界坐标

          var verifyPos = this.gridToLocal(row, col);
          var verifyWorldPos = new Vec3(verifyPos.x + boardWorldPos.x, verifyPos.y + boardWorldPos.y, 0);
          console.log("\u2705 \u9A8C\u8BC1\uFF1A\u7F51\u683C(" + row + ", " + col + ") \u5BF9\u5E94\u4E16\u754C\u5750\u6807 (" + verifyWorldPos.x.toFixed(1) + ", " + verifyWorldPos.y.toFixed(1) + ")"); // 计算点击误差

          var errorX = Math.abs(screenPos.x - verifyWorldPos.x);
          var errorY = Math.abs(screenPos.y - verifyWorldPos.y);
          console.log("\uD83D\uDCCF \u70B9\u51FB\u8BEF\u5DEE: X=" + errorX.toFixed(1) + ", Y=" + errorY.toFixed(1));

          if (errorX > this.blockSize || errorY > this.blockSize) {
            console.warn("\u26A0\uFE0F \u70B9\u51FB\u8BEF\u5DEE\u8FC7\u5927\uFF0C\u53EF\u80FD\u5B58\u5728\u5750\u6807\u7CFB\u95EE\u9898");
          }

          console.log("\uD83D\uDD04 ===== \u5750\u6807\u8F6C\u6362\u7ED3\u675F =====\n");
          return {
            row,
            col
          };
        }
        /**
         * 获取指定位置的方块数据
         */


        getBlockAt(row, col) {
          if (this.isValidPosition(row, col)) {
            return this.boardData[row][col];
          }

          return null;
        }
        /**
         * 获取指定位置的方块节点
         */


        getBlockNodeAt(row, col) {
          var blockData = this.getBlockAt(row, col);
          return blockData ? blockData.node : null;
        }
        /**
         * 检查位置是否有效
         */


        isValidPosition(row, col) {
          return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
        }
        /**
         * 检查位置是否为空
         */


        isEmpty(row, col) {
          if (!this.isValidPosition(row, col)) return false;
          return this.boardData[row][col].type === -1;
        }
        /**
         * 移除指定的方块
         */


        removeBlocks(blocks) {
          blocks.forEach(_ref => {
            var {
              row,
              col
            } = _ref;

            if (this.isValidPosition(row, col)) {
              // 注意：节点已在动画中移除，这里只清理数据
              this.boardData[row][col] = {
                type: -1,
                node: null
              };
            }
          });
        }
        /**
         * 移动方块到新位置
         */


        moveBlock(fromRow, fromCol, toRow, toCol) {
          if (!this.isValidPosition(fromRow, fromCol) || !this.isValidPosition(toRow, toCol)) {
            return false;
          }

          if (this.isEmpty(fromRow, fromCol) || !this.isEmpty(toRow, toCol)) {
            return false;
          } // 移动数据


          this.boardData[toRow][toCol] = this.boardData[fromRow][fromCol];
          this.boardData[fromRow][fromCol] = {
            type: -1,
            node: null
          }; // 更新节点位置

          var blockNode = this.boardData[toRow][toCol].node;

          if (blockNode) {
            var newPos = this.gridToLocal(toRow, toCol);
            blockNode.setPosition(newPos);
            blockNode.name = "Block_" + toRow + "_" + toCol;
          }

          return true;
        }
        /**
         * 获取整个棋盘数据
         */


        getBoardData() {
          return this.boardData;
        }
        /**
         * 计算剩余方块数量
         */


        countRemainingBlocks() {
          var count = 0;

          for (var row = 0; row < this.boardSize; row++) {
            for (var col = 0; col < this.boardSize; col++) {
              if (!this.isEmpty(row, col)) {
                count++;
              }
            }
          }

          return count;
        }
        /**
         * 获取指定列的空位数量（从底部开始计算）
         */


        getEmptySpacesInColumn(col) {
          var emptyCount = 0;

          for (var row = this.boardSize - 1; row >= 0; row--) {
            if (this.isEmpty(row, col)) {
              emptyCount++;
            } else {
              break;
            }
          }

          return emptyCount;
        }
        /**
         * 获取指定列的方块列表（从上到下，忽略空位）
         */


        getColumnBlocks(col) {
          var blocks = [];

          for (var row = 0; row < this.boardSize; row++) {
            if (!this.isEmpty(row, col)) {
              blocks.push({
                row: row,
                data: this.boardData[row][col]
              });
            }
          }

          return blocks;
        }
        /**
         * 检查列是否完全为空
         */


        isColumnEmpty(col) {
          for (var row = 0; row < this.boardSize; row++) {
            if (!this.isEmpty(row, col)) {
              return false;
            }
          }

          return true;
        }
        /**
         * 获取最右侧非空列的索引
         */


        getRightmostNonEmptyColumn() {
          for (var col = this.boardSize - 1; col >= 0; col--) {
            if (!this.isColumnEmpty(col)) {
              return col;
            }
          }

          return -1; // 所有列都为空
        }
        /**
         * 调试：打印棋盘状态
         */


        debugPrintBoard() {
          console.log('📋 当前棋盘状态:');

          for (var row = 0; row < this.boardSize; row++) {
            var rowStr = '';

            for (var col = 0; col < this.boardSize; col++) {
              var type = this.boardData[row][col].type;
              rowStr += (type === -1 ? '.' : type.toString()) + ' ';
            }

            console.log(rowStr);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=52b21148e915074fc0e172841effa95cfa01f062.js.map