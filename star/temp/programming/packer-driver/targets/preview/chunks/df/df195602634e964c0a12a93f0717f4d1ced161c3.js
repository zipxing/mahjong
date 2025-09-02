System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, ScoreManager, _crd;

  _export("ScoreManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8303a7wGoREs6LqjiqFoGG8", "ScoreManager", undefined);

      /**
       * 得分管理器
       * 负责处理游戏得分计算，包括消除得分和奖励得分
       */
      _export("ScoreManager", ScoreManager = class ScoreManager {
        constructor() {
          this.targetScore = 1000;
          this.currentScore = 0;
        }

        /**
         * 初始化得分管理器
         */
        init(targetScore) {
          this.targetScore = targetScore;
          this.currentScore = 0;
          console.log("\u2705 \u5F97\u5206\u7BA1\u7406\u5668\u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u76EE\u6807\u5206\u6570: " + this.targetScore);
        }
        /**
         * 计算消除得分
         * 公式：(n-2)²，其中n是消除的方块数量
         */


        calculateEliminationScore(blockCount) {
          if (blockCount < 2) {
            return 0; // 少于2个方块不能消除
          }

          var score = Math.pow(blockCount - 2, 2);
          console.log("\uD83D\uDCB0 \u6D88\u9664 " + blockCount + " \u4E2A\u65B9\u5757\uFF0C\u5F97\u5206: " + score);
          return score;
        }
        /**
         * 计算剩余方块奖励得分
         * 当剩余方块数量 ≤ 10 时：奖励分数 = (10 - 剩余数) × 10
         * 当剩余方块数量 = 0 时：额外奖励 200 分
         */


        calculateBonusScore(remainingBlocks) {
          var bonusScore = 0;

          if (remainingBlocks <= 10) {
            bonusScore = (10 - remainingBlocks) * 10; // 全清额外奖励

            if (remainingBlocks === 0) {
              bonusScore += 200;
              console.log("\uD83C\uDF89 \u5168\u6E05\u5956\u52B1\uFF01\u989D\u5916\u83B7\u5F97 200 \u5206");
            }

            console.log("\uD83C\uDF81 \u5269\u4F59\u65B9\u5757\u5956\u52B1: \u5269\u4F59 " + remainingBlocks + " \u4E2A\uFF0C\u5956\u52B1 " + bonusScore + " \u5206");
          } else {
            console.log("\uD83D\uDCCA \u5269\u4F59\u65B9\u5757: " + remainingBlocks + " \u4E2A\uFF0C\u65E0\u5956\u52B1");
          }

          return bonusScore;
        }
        /**
         * 获取消除得分的详细说明
         */


        getEliminationScoreBreakdown(blockCount) {
          var score = this.calculateEliminationScore(blockCount);
          return {
            blockCount: blockCount,
            formula: "(" + blockCount + " - 2)\xB2 = " + score,
            score: score,
            examples: ["消除 2 个: (2-2)² = 0 分", "消除 3 个: (3-2)² = 1 分", "消除 4 个: (4-2)² = 4 分", "消除 5 个: (5-2)² = 9 分", "消除 10 个: (10-2)² = 64 分"]
          };
        }
        /**
         * 获取奖励得分的详细说明
         */


        getBonusScoreBreakdown(remainingBlocks) {
          var bonusScore = this.calculateBonusScore(remainingBlocks);
          var formula = "";
          var description = "";

          if (remainingBlocks > 10) {
            formula = "无奖励";
            description = "剩余方块超过10个，无奖励";
          } else if (remainingBlocks === 0) {
            formula = "(10 - 0) × 10 + 200 = 300";
            description = "全清：基础奖励100分 + 全清奖励200分";
          } else {
            formula = "(10 - " + remainingBlocks + ") \xD7 10 = " + bonusScore;
            description = "\u5269\u4F59" + remainingBlocks + "\u4E2A\u65B9\u5757\uFF0C\u83B7\u5F97\u5956\u52B1";
          }

          return {
            remainingBlocks: remainingBlocks,
            formula: formula,
            bonusScore: bonusScore,
            description: description
          };
        }
        /**
         * 计算达到目标分数还需要的最少方块数
         */


        calculateRequiredBlocksForTarget(currentScore) {
          var remainingScore = this.targetScore - currentScore;

          if (remainingScore <= 0) {
            return {
              remainingScore: 0,
              possibleMoves: []
            };
          }

          var possibleMoves = []; // 计算不同消除数量的情况

          for (var blockCount = 2; blockCount <= 20; blockCount++) {
            var score = this.calculateEliminationScore(blockCount);

            if (score > 0) {
              var movesNeeded = Math.ceil(remainingScore / score);
              possibleMoves.push({
                blockCount: blockCount,
                score: score,
                movesNeeded: movesNeeded
              });
            }
          }

          return {
            remainingScore: remainingScore,
            possibleMoves: possibleMoves
          };
        }
        /**
         * 评估当前游戏表现
         */


        evaluatePerformance(currentScore, movesCount) {
          var targetScore = this.targetScore;
          var scoreRatio = currentScore / targetScore;
          var avgScorePerMove = movesCount > 0 ? currentScore / movesCount : 0;
          var rating = "";
          var description = "";

          if (scoreRatio >= 1.0) {
            if (avgScorePerMove >= 20) {
              rating = "完美";
              description = "出色完成目标，效率极高！";
            } else {
              rating = "优秀";
              description = "成功达到目标分数！";
            }
          } else if (scoreRatio >= 0.8) {
            rating = "良好";
            description = "接近目标，表现不错！";
          } else if (scoreRatio >= 0.6) {
            rating = "一般";
            description = "还需要努力提高效率。";
          } else {
            rating = "需要改进";
            description = "尝试寻找更大的连通区域。";
          }

          return {
            rating: rating,
            description: description,
            efficiency: Math.round(avgScorePerMove * 100) / 100
          };
        }
        /**
         * 获取目标分数
         */


        getTargetScore() {
          return this.targetScore;
        }
        /**
         * 设置目标分数
         */


        setTargetScore(targetScore) {
          this.targetScore = targetScore;
          console.log("\uD83C\uDFAF \u76EE\u6807\u5206\u6570\u8BBE\u7F6E\u4E3A: " + this.targetScore);
        }
        /**
         * 获取建议的消除策略
         */


        getEliminationStrategy() {
          return {
            title: "消除策略建议",
            tips: ["优先寻找大的连通区域（5+个方块）", "避免过早消除小区域（2-3个方块）", "观察消除后的连锁反应", "保持棋盘的连通性", "计划多步消除序列", "在后期注意剩余方块奖励"]
          };
        }
        /**
         * 调试：打印得分信息
         */


        debugPrintScoreInfo(currentScore, movesCount) {
          console.log('📊 得分信息:');
          console.log("  \u5F53\u524D\u5206\u6570: " + currentScore);
          console.log("  \u76EE\u6807\u5206\u6570: " + this.targetScore);
          console.log("  \u5B8C\u6210\u5EA6: " + (currentScore / this.targetScore * 100).toFixed(1) + "%");
          console.log("  \u79FB\u52A8\u6B21\u6570: " + movesCount);
          console.log("  \u5E73\u5747\u6BCF\u6B21\u5F97\u5206: " + (movesCount > 0 ? (currentScore / movesCount).toFixed(1) : 0));
          var required = this.calculateRequiredBlocksForTarget(currentScore);
          console.log("  \u8FD8\u9700\u5F97\u5206: " + required.remainingScore);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=df195602634e964c0a12a93f0717f4d1ced161c3.js.map