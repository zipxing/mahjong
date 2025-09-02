/**
 * 得分管理器
 * 负责处理游戏得分计算，包括消除得分和奖励得分
 */

export class ScoreManager {
    private targetScore: number = 1000;
    private currentScore: number = 0;
    
    /**
     * 初始化得分管理器
     */
    init(targetScore: number) {
        this.targetScore = targetScore;
        this.currentScore = 0;
        
        console.log(`✅ 得分管理器初始化完成，目标分数: ${this.targetScore}`);
    }
    
    /**
     * 计算消除得分
     * 公式：(n-2)²，其中n是消除的方块数量
     */
    calculateEliminationScore(blockCount: number): number {
        if (blockCount < 2) {
            return 0;  // 少于2个方块不能消除
        }
        
        const score = Math.pow(blockCount - 2, 2);
        
        console.log(`💰 消除 ${blockCount} 个方块，得分: ${score}`);
        return score;
    }
    
    /**
     * 计算剩余方块奖励得分
     * 当剩余方块数量 ≤ 10 时：奖励分数 = (10 - 剩余数) × 10
     * 当剩余方块数量 = 0 时：额外奖励 200 分
     */
    calculateBonusScore(remainingBlocks: number): number {
        let bonusScore = 0;
        
        if (remainingBlocks <= 10) {
            bonusScore = (10 - remainingBlocks) * 10;
            
            // 全清额外奖励
            if (remainingBlocks === 0) {
                bonusScore += 200;
                console.log(`🎉 全清奖励！额外获得 200 分`);
            }
            
            console.log(`🎁 剩余方块奖励: 剩余 ${remainingBlocks} 个，奖励 ${bonusScore} 分`);
        } else {
            console.log(`📊 剩余方块: ${remainingBlocks} 个，无奖励`);
        }
        
        return bonusScore;
    }
    
    /**
     * 获取消除得分的详细说明
     */
    getEliminationScoreBreakdown(blockCount: number): {
        blockCount: number,
        formula: string,
        score: number,
        examples: string[]
    } {
        const score = this.calculateEliminationScore(blockCount);
        
        return {
            blockCount: blockCount,
            formula: `(${blockCount} - 2)² = ${score}`,
            score: score,
            examples: [
                "消除 2 个: (2-2)² = 0 分",
                "消除 3 个: (3-2)² = 1 分",
                "消除 4 个: (4-2)² = 4 分",
                "消除 5 个: (5-2)² = 9 分",
                "消除 10 个: (10-2)² = 64 分"
            ]
        };
    }
    
    /**
     * 获取奖励得分的详细说明
     */
    getBonusScoreBreakdown(remainingBlocks: number): {
        remainingBlocks: number,
        formula: string,
        bonusScore: number,
        description: string
    } {
        const bonusScore = this.calculateBonusScore(remainingBlocks);
        let formula = "";
        let description = "";
        
        if (remainingBlocks > 10) {
            formula = "无奖励";
            description = "剩余方块超过10个，无奖励";
        } else if (remainingBlocks === 0) {
            formula = "(10 - 0) × 10 + 200 = 300";
            description = "全清：基础奖励100分 + 全清奖励200分";
        } else {
            formula = `(10 - ${remainingBlocks}) × 10 = ${bonusScore}`;
            description = `剩余${remainingBlocks}个方块，获得奖励`;
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
    calculateRequiredBlocksForTarget(currentScore: number): {
        remainingScore: number,
        possibleMoves: {blockCount: number, score: number, movesNeeded: number}[]
    } {
        const remainingScore = this.targetScore - currentScore;
        
        if (remainingScore <= 0) {
            return {
                remainingScore: 0,
                possibleMoves: []
            };
        }
        
        const possibleMoves: {blockCount: number, score: number, movesNeeded: number}[] = [];
        
        // 计算不同消除数量的情况
        for (let blockCount = 2; blockCount <= 20; blockCount++) {
            const score = this.calculateEliminationScore(blockCount);
            if (score > 0) {
                const movesNeeded = Math.ceil(remainingScore / score);
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
    evaluatePerformance(currentScore: number, movesCount: number): {
        rating: string,
        description: string,
        efficiency: number
    } {
        const targetScore = this.targetScore;
        const scoreRatio = currentScore / targetScore;
        const avgScorePerMove = movesCount > 0 ? currentScore / movesCount : 0;
        
        let rating = "";
        let description = "";
        
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
    getTargetScore(): number {
        return this.targetScore;
    }
    
    /**
     * 设置目标分数
     */
    setTargetScore(targetScore: number) {
        this.targetScore = targetScore;
        console.log(`🎯 目标分数设置为: ${this.targetScore}`);
    }
    
    /**
     * 获取建议的消除策略
     */
    getEliminationStrategy(): {
        title: string,
        tips: string[]
    } {
        return {
            title: "消除策略建议",
            tips: [
                "优先寻找大的连通区域（5+个方块）",
                "避免过早消除小区域（2-3个方块）",
                "观察消除后的连锁反应",
                "保持棋盘的连通性",
                "计划多步消除序列",
                "在后期注意剩余方块奖励"
            ]
        };
    }
    
    /**
     * 调试：打印得分信息
     */
    debugPrintScoreInfo(currentScore: number, movesCount: number) {
        console.log('📊 得分信息:');
        console.log(`  当前分数: ${currentScore}`);
        console.log(`  目标分数: ${this.targetScore}`);
        console.log(`  完成度: ${((currentScore / this.targetScore) * 100).toFixed(1)}%`);
        console.log(`  移动次数: ${movesCount}`);
        console.log(`  平均每次得分: ${movesCount > 0 ? (currentScore / movesCount).toFixed(1) : 0}`);
        
        const required = this.calculateRequiredBlocksForTarget(currentScore);
        console.log(`  还需得分: ${required.remainingScore}`);
    }
}
