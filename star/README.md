# 消灭星星 (Star Elimination)

基于 Cocos Creator 开发的经典消灭星星游戏

## 🎮 游戏规则

### 基础玩法
- 10×10 彩色方块阵列
- 点击 2 个或以上相连的同色方块进行消除
- 消除后方块自然下落，列向左移动保持紧凑

### 得分规则
- **消除得分**：`(n-2)²`，其中 n 为同时消除的方块数量
  - 消除 2 个：0 分
  - 消除 3 个：1 分  
  - 消除 4 个：4 分
  - 消除 10 个：64 分
- **剩余奖励**：当无法继续消除时
  - 剩余 ≤ 10 个方块：`(10-剩余数)×10` 分奖励
  - 全清：额外 200 分奖励

## 🏗️ 技术架构

### 核心管理器
- **GameManager**: 游戏主控制器
- **BoardManager**: 棋盘数据和坐标管理
- **BlockManager**: 方块创建和外观管理
- **EliminationManager**: 连通区域检测和消除逻辑
- **PhysicsManager**: 下落和重排物理效果
- **ScoreManager**: 得分计算和奖励系统
- **InputManager**: 触摸输入和交互处理

### 设计特点
- 模块化架构，职责分离
- 异步动画系统
- 完善的错误处理
- 丰富的调试信息

## 🔧 开发环境

- **引擎版本**: Cocos Creator 3.8.7
- **语言**: TypeScript
- **目标平台**: Web / 移动端

## 📁 项目结构

```
star/
├── assets/
│   ├── scenes/          # 游戏场景
│   └── scripts/         # TypeScript 脚本
│       ├── GameManager.ts       # 游戏主管理器
│       ├── BoardManager.ts      # 棋盘管理器
│       ├── BlockManager.ts      # 方块管理器
│       ├── EliminationManager.ts # 消除管理器
│       ├── PhysicsManager.ts     # 物理管理器
│       ├── ScoreManager.ts       # 得分管理器
│       └── InputManager.ts      # 输入管理器
├── package.json         # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 说明文档
```

## 🎯 核心算法

### 连通区域检测 (BFS)
使用广度优先搜索算法检测相连的同色方块：

```typescript
// 四方向搜索：上、下、左、右
const directions = [
    {dr: -1, dc: 0},  // 上
    {dr: 1, dc: 0},   // 下  
    {dr: 0, dc: -1},  // 左
    {dr: 0, dc: 1}    // 右
];
```

### 物理重排系统
1. **下落阶段**: 方块按重力下落填补空隙
2. **左移阶段**: 空列消失，右侧列向左移动

### 得分优化策略
- 优先消除大连通区域 (5+ 方块)
- 避免过早消除小区域 (2-3 方块)  
- 计划连锁消除序列
- 关注剩余方块奖励时机

## 🚀 快速开始

1. 在 Cocos Creator 中打开项目
2. 设置 GameManager 组件引用：
   - gameBoard: 棋盘根节点
   - blockAtlas: 方块图集 (可选)
   - scoreLabel: 分数显示标签
   - gameOverPanel: 游戏结束面板
3. 配置游戏参数：
   - boardSize: 棋盘大小 (默认 10)
   - blockTypes: 方块类型数 (默认 5)
   - targetScore: 目标分数 (默认 1000)
4. 运行游戏

## 🎨 美术资源

### 方块图集格式
如果使用自定义图集，sprite frame 命名规则：
- `block_0`: 第一种颜色方块
- `block_1`: 第二种颜色方块
- ...以此类推

### 备用方案  
如未设置图集，将使用内置纯色方块：
- 红色、绿色、蓝色、黄色、紫色等

## 📊 调试功能

各管理器提供丰富的调试信息：
- `debugPrintBoard()`: 打印棋盘状态
- `debugPrintScoreInfo()`: 打印得分信息  
- `debugPrintConnectedRegions()`: 打印连通区域统计
- `debugPrintRearrangementPreview()`: 打印重排预览

## 🔮 扩展功能

- [ ] 关卡系统
- [ ] 道具系统 (炸弹、彩虹等)
- [ ] 成就系统
- [ ] 排行榜
- [ ] 音效和粒子特效
- [ ] 多种游戏模式

## 📝 更新日志

### v1.0.0 (2025-01-11)
- 完成核心架构设计
- 实现基础游戏逻辑
- 添加得分系统和物理效果
- 支持触摸输入和动画
