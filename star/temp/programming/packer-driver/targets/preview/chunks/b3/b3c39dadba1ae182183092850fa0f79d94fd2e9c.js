System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, tween, PhysicsManager, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfBoardManager(extras) {
    _reporterNs.report("BoardManager", "./BoardManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBlockManager(extras) {
    _reporterNs.report("BlockManager", "./BlockManager", _context.meta, extras);
  }

  _export("PhysicsManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      tween = _cc.tween;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "aecaamssDFBmbgK+gsH59Nc", "PhysicsManager", undefined);
      /**
       * 物理管理器
       * 负责处理方块的下落和左移重排效果
       */


      __checkObsolete__(['tween', 'Vec3']);

      _export("PhysicsManager", PhysicsManager = class PhysicsManager {
        /**
         * 初始化物理管理器
         */
        init() {
          console.log('✅ 物理管理器初始化完成');
        }
        /**
         * 重新排列棋盘（下落 + 左移）
         */


        rearrangeBoard(boardManager, blockManager) {
          var _this = this;

          return _asyncToGenerator(function* () {
            console.log('🌊 开始棋盘重排：下落 + 左移'); // 第一步：方块下落

            yield _this.dropBlocks(boardManager); // 第二步：列左移

            yield _this.shiftColumnsLeft(boardManager);
            console.log('✅ 棋盘重排完成');
          })();
        }
        /**
         * 方块下落效果
         */


        dropBlocks(boardManager) {
          return _asyncToGenerator(function* () {
            console.log('⬇️ 执行方块下落');
            var boardData = boardManager.getBoardData();
            var boardSize = boardData.length;
            var animationPromises = []; // 遍历每一列

            for (var col = 0; col < boardSize; col++) {
              // 获取当前列的所有方块（从上到下，忽略空位）
              var columnBlocks = boardManager.getColumnBlocks(col);
              if (columnBlocks.length === 0) continue; // 计算每个方块应该下落到的新位置

              var targetRow = boardSize - 1; // 从底部开始放置
              // 从下往上处理方块

              var _loop = function* _loop() {
                var blockInfo = columnBlocks[i];
                var currentRow = blockInfo.row;

                if (currentRow !== targetRow) {
                  // 需要移动方块
                  console.log("\uD83D\uDCE6 \u65B9\u5757\u4E0B\u843D: (" + currentRow + ", " + col + ") -> (" + targetRow + ", " + col + ")"); // 更新数据

                  boardData[targetRow][col] = blockInfo.data;
                  boardData[currentRow][col] = {
                    type: -1,
                    node: null
                  }; // 创建下落动画

                  if (blockInfo.data.node) {
                    var blockNode = blockInfo.data.node;
                    var newPos = boardManager.gridToLocal(targetRow, col);
                    blockNode.name = "Block_" + targetRow + "_" + col;
                    var animationPromise = new Promise(resolve => {
                      tween(blockNode).to(0.3, {
                        position: newPos
                      }, {
                        easing: 'bounceOut'
                      }).call(() => resolve()).start();
                    });
                    animationPromises.push(animationPromise);
                  }
                }

                targetRow--;
              };

              for (var i = columnBlocks.length - 1; i >= 0; i--) {
                yield* _loop();
              }
            } // 等待所有下落动画完成


            if (animationPromises.length > 0) {
              yield Promise.all(animationPromises);
              console.log("\u2705 " + animationPromises.length + " \u4E2A\u65B9\u5757\u4E0B\u843D\u52A8\u753B\u5B8C\u6210");
            }
          })();
        }
        /**
         * 列左移效果
         */


        shiftColumnsLeft(boardManager) {
          return _asyncToGenerator(function* () {
            console.log('⬅️ 执行列左移');
            var boardData = boardManager.getBoardData();
            var boardSize = boardData.length;
            var animationPromises = []; // 找到需要移动的列

            var columnsToMove = [];
            var targetCol = 0;

            for (var col = 0; col < boardSize; col++) {
              if (!boardManager.isColumnEmpty(col)) {
                if (col !== targetCol) {
                  columnsToMove.push({
                    from: col,
                    to: targetCol
                  });
                }

                targetCol++;
              }
            } // 执行列移动


            for (var move of columnsToMove) {
              console.log("\uD83D\uDCC2 \u5217\u5DE6\u79FB: " + move.from + " -> " + move.to); // 移动整列的数据和节点

              var _loop2 = function* _loop2() {
                var sourceData = boardData[row][move.from];

                if (sourceData.type !== -1) {
                  // 移动数据
                  boardData[row][move.to] = sourceData;
                  boardData[row][move.from] = {
                    type: -1,
                    node: null
                  }; // 移动节点

                  if (sourceData.node) {
                    var blockNode = sourceData.node;
                    var newPos = boardManager.gridToLocal(row, move.to);
                    blockNode.name = "Block_" + row + "_" + move.to;
                    var animationPromise = new Promise(resolve => {
                      tween(blockNode).to(0.4, {
                        position: newPos
                      }, {
                        easing: 'quartOut'
                      }).call(() => resolve()).start();
                    });
                    animationPromises.push(animationPromise);
                  }
                }
              };

              for (var row = 0; row < boardSize; row++) {
                yield* _loop2();
              }
            } // 等待所有左移动画完成


            if (animationPromises.length > 0) {
              yield Promise.all(animationPromises);
              console.log("\u2705 " + animationPromises.length + " \u4E2A\u65B9\u5757\u5DE6\u79FB\u52A8\u753B\u5B8C\u6210");
            }
          })();
        }
        /**
         * 预览下落效果（不实际移动，返回预览信息）
         */


        previewDropEffect(boardManager) {
          var boardData = boardManager.getBoardData();
          var boardSize = boardData.length;
          var moves = [];

          for (var col = 0; col < boardSize; col++) {
            var columnBlocks = boardManager.getColumnBlocks(col);
            var targetRow = boardSize - 1;

            for (var i = columnBlocks.length - 1; i >= 0; i--) {
              var blockInfo = columnBlocks[i];

              if (blockInfo.row !== targetRow) {
                moves.push({
                  from: {
                    row: blockInfo.row,
                    col: col
                  },
                  to: {
                    row: targetRow,
                    col: col
                  }
                });
              }

              targetRow--;
            }
          }

          return moves;
        }
        /**
         * 预览左移效果（不实际移动，返回预览信息）
         */


        previewShiftEffect(boardManager) {
          var boardSize = boardManager.getBoardData().length;
          var moves = [];
          var targetCol = 0;

          for (var col = 0; col < boardSize; col++) {
            if (!boardManager.isColumnEmpty(col)) {
              if (col !== targetCol) {
                moves.push({
                  from: col,
                  to: targetCol
                });
              }

              targetCol++;
            }
          }

          return moves;
        }
        /**
         * 检查是否需要重排
         */


        needsRearrangement(boardManager) {
          // 检查是否有方块需要下落
          var dropMoves = this.previewDropEffect(boardManager);

          if (dropMoves.length > 0) {
            return true;
          } // 检查是否有列需要左移


          var shiftMoves = this.previewShiftEffect(boardManager);

          if (shiftMoves.length > 0) {
            return true;
          }

          return false;
        }
        /**
         * 即时重排（无动画，用于初始化或快速操作）
         */


        instantRearrange(boardManager) {
          console.log('⚡ 执行即时重排（无动画）');
          var boardData = boardManager.getBoardData();
          var boardSize = boardData.length; // 即时下落

          for (var col = 0; col < boardSize; col++) {
            var columnBlocks = boardManager.getColumnBlocks(col);
            var targetRow = boardSize - 1;

            for (var i = columnBlocks.length - 1; i >= 0; i--) {
              var blockInfo = columnBlocks[i];
              var currentRow = blockInfo.row;

              if (currentRow !== targetRow) {
                // 移动数据
                boardData[targetRow][col] = blockInfo.data;
                boardData[currentRow][col] = {
                  type: -1,
                  node: null
                }; // 移动节点

                if (blockInfo.data.node) {
                  var blockNode = blockInfo.data.node;
                  var newPos = boardManager.gridToLocal(targetRow, col);
                  blockNode.setPosition(newPos);
                  blockNode.name = "Block_" + targetRow + "_" + col;
                }
              }

              targetRow--;
            }
          } // 即时左移


          var targetCol = 0;

          for (var _col = 0; _col < boardSize; _col++) {
            if (!boardManager.isColumnEmpty(_col)) {
              if (_col !== targetCol) {
                // 移动整列
                for (var row = 0; row < boardSize; row++) {
                  var sourceData = boardData[row][_col];

                  if (sourceData.type !== -1) {
                    boardData[row][targetCol] = sourceData;
                    boardData[row][_col] = {
                      type: -1,
                      node: null
                    };

                    if (sourceData.node) {
                      var _blockNode = sourceData.node;

                      var _newPos = boardManager.gridToLocal(row, targetCol);

                      _blockNode.setPosition(_newPos);

                      _blockNode.name = "Block_" + row + "_" + targetCol;
                    }
                  }
                }
              }

              targetCol++;
            }
          }

          console.log('✅ 即时重排完成');
        }
        /**
         * 调试：打印重排预览信息
         */


        debugPrintRearrangementPreview(boardManager) {
          var dropMoves = this.previewDropEffect(boardManager);
          var shiftMoves = this.previewShiftEffect(boardManager);
          console.log('🔍 重排预览:');
          console.log("  \u4E0B\u843D\u79FB\u52A8: " + dropMoves.length + " \u4E2A");
          dropMoves.forEach(move => {
            console.log("    (" + move.from.row + ", " + move.from.col + ") -> (" + move.to.row + ", " + move.to.col + ")");
          });
          console.log("  \u5DE6\u79FB\u79FB\u52A8: " + shiftMoves.length + " \u4E2A");
          shiftMoves.forEach(move => {
            console.log("    \u5217 " + move.from + " -> \u5217 " + move.to);
          });
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b3c39dadba1ae182183092850fa0f79d94fd2e9c.js.map