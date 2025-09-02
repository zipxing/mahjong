System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, tween, PhysicsManager, _crd;

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


        async rearrangeBoard(boardManager, blockManager) {
          console.log('🌊 开始棋盘重排：下落 + 左移'); // 第一步：方块下落

          await this.dropBlocks(boardManager); // 第二步：列左移

          await this.shiftColumnsLeft(boardManager);
          console.log('✅ 棋盘重排完成');
        }
        /**
         * 方块下落效果
         */


        async dropBlocks(boardManager) {
          console.log('⬇️ 执行方块下落');
          const boardData = boardManager.getBoardData();
          const boardSize = boardData.length;
          const animationPromises = []; // 遍历每一列

          for (let col = 0; col < boardSize; col++) {
            // 获取当前列的所有方块（从上到下，忽略空位）
            const columnBlocks = boardManager.getColumnBlocks(col);
            if (columnBlocks.length === 0) continue; // 计算每个方块应该下落到的新位置

            let targetRow = boardSize - 1; // 从底部开始放置
            // 从下往上处理方块

            for (let i = columnBlocks.length - 1; i >= 0; i--) {
              const blockInfo = columnBlocks[i];
              const currentRow = blockInfo.row;

              if (currentRow !== targetRow) {
                // 需要移动方块
                console.log(`📦 方块下落: (${currentRow}, ${col}) -> (${targetRow}, ${col})`); // 更新数据

                boardData[targetRow][col] = blockInfo.data;
                boardData[currentRow][col] = {
                  type: -1,
                  node: null
                }; // 创建下落动画

                if (blockInfo.data.node) {
                  const blockNode = blockInfo.data.node;
                  const newPos = boardManager.gridToLocal(targetRow, col);
                  blockNode.name = `Block_${targetRow}_${col}`;
                  const animationPromise = new Promise(resolve => {
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
            }
          } // 等待所有下落动画完成


          if (animationPromises.length > 0) {
            await Promise.all(animationPromises);
            console.log(`✅ ${animationPromises.length} 个方块下落动画完成`);
          }
        }
        /**
         * 列左移效果
         */


        async shiftColumnsLeft(boardManager) {
          console.log('⬅️ 执行列左移');
          const boardData = boardManager.getBoardData();
          const boardSize = boardData.length;
          const animationPromises = []; // 找到需要移动的列

          const columnsToMove = [];
          let targetCol = 0;

          for (let col = 0; col < boardSize; col++) {
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


          for (const move of columnsToMove) {
            console.log(`📂 列左移: ${move.from} -> ${move.to}`); // 移动整列的数据和节点

            for (let row = 0; row < boardSize; row++) {
              const sourceData = boardData[row][move.from];

              if (sourceData.type !== -1) {
                // 移动数据
                boardData[row][move.to] = sourceData;
                boardData[row][move.from] = {
                  type: -1,
                  node: null
                }; // 移动节点

                if (sourceData.node) {
                  const blockNode = sourceData.node;
                  const newPos = boardManager.gridToLocal(row, move.to);
                  blockNode.name = `Block_${row}_${move.to}`;
                  const animationPromise = new Promise(resolve => {
                    tween(blockNode).to(0.4, {
                      position: newPos
                    }, {
                      easing: 'quartOut'
                    }).call(() => resolve()).start();
                  });
                  animationPromises.push(animationPromise);
                }
              }
            }
          } // 等待所有左移动画完成


          if (animationPromises.length > 0) {
            await Promise.all(animationPromises);
            console.log(`✅ ${animationPromises.length} 个方块左移动画完成`);
          }
        }
        /**
         * 预览下落效果（不实际移动，返回预览信息）
         */


        previewDropEffect(boardManager) {
          const boardData = boardManager.getBoardData();
          const boardSize = boardData.length;
          const moves = [];

          for (let col = 0; col < boardSize; col++) {
            const columnBlocks = boardManager.getColumnBlocks(col);
            let targetRow = boardSize - 1;

            for (let i = columnBlocks.length - 1; i >= 0; i--) {
              const blockInfo = columnBlocks[i];

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
          const boardSize = boardManager.getBoardData().length;
          const moves = [];
          let targetCol = 0;

          for (let col = 0; col < boardSize; col++) {
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
          const dropMoves = this.previewDropEffect(boardManager);

          if (dropMoves.length > 0) {
            return true;
          } // 检查是否有列需要左移


          const shiftMoves = this.previewShiftEffect(boardManager);

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
          const boardData = boardManager.getBoardData();
          const boardSize = boardData.length; // 即时下落

          for (let col = 0; col < boardSize; col++) {
            const columnBlocks = boardManager.getColumnBlocks(col);
            let targetRow = boardSize - 1;

            for (let i = columnBlocks.length - 1; i >= 0; i--) {
              const blockInfo = columnBlocks[i];
              const currentRow = blockInfo.row;

              if (currentRow !== targetRow) {
                // 移动数据
                boardData[targetRow][col] = blockInfo.data;
                boardData[currentRow][col] = {
                  type: -1,
                  node: null
                }; // 移动节点

                if (blockInfo.data.node) {
                  const blockNode = blockInfo.data.node;
                  const newPos = boardManager.gridToLocal(targetRow, col);
                  blockNode.setPosition(newPos);
                  blockNode.name = `Block_${targetRow}_${col}`;
                }
              }

              targetRow--;
            }
          } // 即时左移


          let targetCol = 0;

          for (let col = 0; col < boardSize; col++) {
            if (!boardManager.isColumnEmpty(col)) {
              if (col !== targetCol) {
                // 移动整列
                for (let row = 0; row < boardSize; row++) {
                  const sourceData = boardData[row][col];

                  if (sourceData.type !== -1) {
                    boardData[row][targetCol] = sourceData;
                    boardData[row][col] = {
                      type: -1,
                      node: null
                    };

                    if (sourceData.node) {
                      const blockNode = sourceData.node;
                      const newPos = boardManager.gridToLocal(row, targetCol);
                      blockNode.setPosition(newPos);
                      blockNode.name = `Block_${row}_${targetCol}`;
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
          const dropMoves = this.previewDropEffect(boardManager);
          const shiftMoves = this.previewShiftEffect(boardManager);
          console.log('🔍 重排预览:');
          console.log(`  下落移动: ${dropMoves.length} 个`);
          dropMoves.forEach(move => {
            console.log(`    (${move.from.row}, ${move.from.col}) -> (${move.to.row}, ${move.to.col})`);
          });
          console.log(`  左移移动: ${shiftMoves.length} 个`);
          shiftMoves.forEach(move => {
            console.log(`    列 ${move.from} -> 列 ${move.to}`);
          });
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b3c39dadba1ae182183092850fa0f79d94fd2e9c.js.map