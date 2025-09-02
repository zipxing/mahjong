System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EliminationManager, _crd;

  function _reportPossibleCrUseOfBlockData(extras) {
    _reporterNs.report("BlockData", "./BoardManager", _context.meta, extras);
  }

  _export("EliminationManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "07179Dk4zVJe7dJ0iy4dBiB", "EliminationManager", undefined);
      /**
       * 消除管理器
       * 负责处理方块的连通区域检测和消除逻辑
       */


      _export("EliminationManager", EliminationManager = class EliminationManager {
        /**
         * 初始化消除管理器
         */
        init() {
          console.log('✅ 消除管理器初始化完成');
        }
        /**
         * 查找从指定位置开始的连通同色方块
         * 使用广度优先搜索(BFS)算法
         */


        findConnectedBlocks(boardData, startRow, startCol) {
          console.log("\n\uD83D\uDD0D ===== BFS\u8FDE\u901A\u641C\u7D22\u5F00\u59CB =====");
          console.log("\uD83C\uDFAF \u8D77\u59CB\u4F4D\u7F6E: (" + startRow + ", " + startCol + ")");
          var boardSize = boardData.length;
          console.log("\uD83D\uDCCF \u68CB\u76D8\u5927\u5C0F: " + boardSize + "x" + boardSize); // 检查起始位置

          if (!this.isValidPosition(startRow, startCol, boardSize)) {
            console.log("\u274C \u8D77\u59CB\u4F4D\u7F6E\u65E0\u6548\uFF0C\u8D85\u51FA\u68CB\u76D8\u8303\u56F4");
            return [];
          }

          if (boardData[startRow][startCol].type === -1) {
            console.log("\u274C \u8D77\u59CB\u4F4D\u7F6E\u662F\u7A7A\u4F4D\uFF0C\u7C7B\u578B\u4E3A -1");
            return [];
          }

          var targetType = boardData[startRow][startCol].type;
          console.log("\uD83C\uDFA8 \u76EE\u6807\u65B9\u5757\u7C7B\u578B: " + targetType);
          var visited = [];
          var connectedBlocks = []; // 初始化访问标记

          for (var i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
          }

          console.log("\u2705 \u8BBF\u95EE\u6807\u8BB0\u6570\u7EC4\u521D\u59CB\u5316\u5B8C\u6210"); // BFS队列

          var queue = [{
            row: startRow,
            col: startCol
          }];
          visited[startRow][startCol] = true;
          connectedBlocks.push({
            row: startRow,
            col: startCol
          });
          console.log("\uD83D\uDE80 BFS\u961F\u5217\u521D\u59CB\u5316\uFF0C\u8D77\u59CB\u65B9\u5757\u5DF2\u52A0\u5165"); // 四个方向：上、下、左、右

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
          var step = 0;

          while (queue.length > 0) {
            step++;
            var current = queue.shift();
            console.log("\uD83D\uDD04 \u6B65\u9AA4 " + step + ": \u5904\u7406\u65B9\u5757 (" + current.row + ", " + current.col + "), \u961F\u5217\u5269\u4F59: " + queue.length); // 检查四个方向的邻接方块

            for (var _i = 0; _i < directions.length; _i++) {
              var dir = directions[_i];
              var dirName = ['上', '下', '左', '右'][_i];
              var newRow = current.row + dir.dr;
              var newCol = current.col + dir.dc;
              console.log("  \uD83D\uDC40 \u68C0\u67E5" + dirName + "\u65B9\u5411: (" + newRow + ", " + newCol + ")"); // 检查位置有效性

              if (!this.isValidPosition(newRow, newCol, boardSize)) {
                console.log("    \u274C \u4F4D\u7F6E\u65E0\u6548\uFF0C\u8D85\u51FA\u8FB9\u754C");
                continue;
              } // 检查是否已访问


              if (visited[newRow][newCol]) {
                console.log("    \u274C \u5DF2\u8BBF\u95EE\u8FC7");
                continue;
              }

              var neighborType = boardData[newRow][newCol].type;
              console.log("    \uD83C\uDFA8 \u90BB\u5C45\u65B9\u5757\u7C7B\u578B: " + neighborType + " (\u76EE\u6807: " + targetType + ")"); // 检查是否为相同类型的方块

              if (neighborType === targetType) {
                visited[newRow][newCol] = true;
                queue.push({
                  row: newRow,
                  col: newCol
                });
                connectedBlocks.push({
                  row: newRow,
                  col: newCol
                });
                console.log("    \u2705 \u5339\u914D\uFF01\u52A0\u5165\u8FDE\u901A\u533A\u57DF\uFF0C\u5F53\u524D\u603B\u6570: " + connectedBlocks.length);
              } else {
                console.log("    \u274C \u7C7B\u578B\u4E0D\u5339\u914D");
              }
            }
          }

          console.log("\uD83D\uDD0D BFS\u641C\u7D22\u5B8C\u6210\uFF01\u627E\u5230 " + connectedBlocks.length + " \u4E2A\u8FDE\u901A\u7684\u7C7B\u578B " + targetType + " \u65B9\u5757:");
          connectedBlocks.forEach((block, index) => {
            console.log("  " + (index + 1) + ". (" + block.row + ", " + block.col + ")");
          });
          console.log("\uD83D\uDD0D ===== BFS\u8FDE\u901A\u641C\u7D22\u7ED3\u675F =====\n");
          return connectedBlocks;
        }
        /**
         * 检查位置是否有效
         */


        isValidPosition(row, col, boardSize) {
          return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
        }
        /**
         * 检查是否还有可消除的连通区域（2个或以上相连的同色方块）
         */


        hasValidMoves(boardData) {
          var boardSize = boardData.length;
          var visited = []; // 初始化访问标记

          for (var i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
          } // 遍历整个棋盘


          for (var _row = 0; _row < boardSize; _row++) {
            for (var _col = 0; _col < boardSize; _col++) {
              // 跳过空位和已访问的位置
              if (boardData[_row][_col].type === -1 || visited[_row][_col]) {
                continue;
              } // 查找连通区域


              var connectedBlocks = this.findConnectedBlocksWithVisited(boardData, _row, _col, visited); // 如果找到2个或以上的连通方块，说明还有有效移动

              if (connectedBlocks.length >= 2) {
                console.log("\u2705 \u627E\u5230\u6709\u6548\u79FB\u52A8: " + connectedBlocks.length + " \u4E2A\u8FDE\u901A\u65B9\u5757");
                return true;
              }
            }
          }

          console.log('❌ 没有找到有效移动');
          return false;
        }
        /**
         * 查找连通方块（带访问标记的版本，用于hasValidMoves）
         */


        findConnectedBlocksWithVisited(boardData, startRow, startCol, globalVisited) {
          var boardSize = boardData.length;

          if (!this.isValidPosition(startRow, startCol, boardSize) || boardData[startRow][startCol].type === -1 || globalVisited[startRow][startCol]) {
            return [];
          }

          var targetType = boardData[startRow][startCol].type;
          var connectedBlocks = [];
          var queue = [{
            row: startRow,
            col: startCol
          }];
          globalVisited[startRow][startCol] = true;
          connectedBlocks.push({
            row: startRow,
            col: startCol
          });
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

              if (!this.isValidPosition(newRow, newCol, boardSize) || globalVisited[newRow][newCol] || boardData[newRow][newCol].type !== targetType) {
                continue;
              }

              globalVisited[newRow][newCol] = true;
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
         * 高亮显示连通区域（用于预览）
         */


        highlightConnectedBlocks(boardData, startRow, startCol, highlightCallback) {
          var connectedBlocks = this.findConnectedBlocks(boardData, startRow, startCol); // 只有2个或以上的方块才进行高亮

          if (connectedBlocks.length >= 2) {
            connectedBlocks.forEach(_ref => {
              var {
                row,
                col
              } = _ref;
              highlightCallback(row, col, true);
            });
          }

          return connectedBlocks;
        }
        /**
         * 清除高亮显示
         */


        clearHighlight(blocks, highlightCallback) {
          blocks.forEach(_ref2 => {
            var {
              row,
              col
            } = _ref2;
            highlightCallback(row, col, false);
          });
        }
        /**
         * 获取棋盘上所有连通区域的统计信息
         */


        getConnectedRegionsStats(boardData) {
          var boardSize = boardData.length;
          var visited = []; // 初始化访问标记

          for (var i = 0; i < boardSize; i++) {
            visited[i] = new Array(boardSize).fill(false);
          }

          var totalRegions = 0;
          var validRegions = 0;
          var largestRegionSize = 0;
          var blockTypeDistribution = {}; // 遍历整个棋盘

          for (var _row2 = 0; _row2 < boardSize; _row2++) {
            for (var _col2 = 0; _col2 < boardSize; _col2++) {
              // 跳过空位和已访问的位置
              if (boardData[_row2][_col2].type === -1 || visited[_row2][_col2]) {
                continue;
              }

              var blockType = boardData[_row2][_col2].type; // 查找连通区域

              var connectedBlocks = this.findConnectedBlocksWithVisited(boardData, _row2, _col2, visited);

              if (connectedBlocks.length > 0) {
                totalRegions++;

                if (connectedBlocks.length >= 2) {
                  validRegions++;
                }

                largestRegionSize = Math.max(largestRegionSize, connectedBlocks.length); // 统计方块类型分布

                if (!blockTypeDistribution[blockType]) {
                  blockTypeDistribution[blockType] = 0;
                }

                blockTypeDistribution[blockType] += connectedBlocks.length;
              }
            }
          }

          return {
            totalRegions,
            validRegions,
            largestRegionSize,
            blockTypeDistribution
          };
        }
        /**
         * 调试：打印连通区域信息
         */


        debugPrintConnectedRegions(boardData) {
          var stats = this.getConnectedRegionsStats(boardData);
          console.log('📊 连通区域统计:');
          console.log("  \u603B\u533A\u57DF\u6570: " + stats.totalRegions);
          console.log("  \u53EF\u6D88\u9664\u533A\u57DF\u6570: " + stats.validRegions);
          console.log("  \u6700\u5927\u533A\u57DF\u5927\u5C0F: " + stats.largestRegionSize);
          console.log("  \u65B9\u5757\u7C7B\u578B\u5206\u5E03:", stats.blockTypeDistribution);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8a2f055581233666d8308eb59c7d5eae17499834.js.map