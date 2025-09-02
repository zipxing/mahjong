# 消灭星星游戏 - 安装配置指南


## 🚀 快速开始

### 1. 环境要求
- **Cocos Creator**: 3.8.7 或更高版本
- **Node.js**: 16.x 或更高版本
- **TypeScript**: 内置支持

### 2. 项目导入
1. 打开 Cocos Creator
2. 选择 "导入项目"
3. 选择 `star` 文件夹
4. 等待项目加载完成

### 3. 场景配置

#### 3.1 创建基础场景结构
在 `GameScene.scene` 中创建以下节点层级：

```
Canvas
├── GameBoard (Node)           # 游戏棋盘容器
├── UI (Node)                  # UI容器
│   ├── ScorePanel (Node)      # 分数面板
│   │   ├── ScoreLabel (Label) # 当前分数
│   │   └── TargetLabel (Label)# 目标分数
│   ├── GameOverPanel (Node)   # 游戏结束面板
│   │   ├── ResultTitle (Label)# 结果标题
│   │   ├── FinalScore (Label) # 最终分数
│   │   └── RestartBtn (Button)# 重新开始按钮
│   └── ControlPanel (Node)    # 控制面板
│       ├── HintBtn (Button)   # 提示按钮
│       └── PauseBtn (Button)  # 暂停按钮
└── GameManager (Node)         # 游戏管理器节点
```

#### 3.2 GameManager 组件配置
在 `GameManager` 节点上添加 `GameManager` 组件，并设置以下属性：

**基础引用：**
- `gameBoard`: 拖拽 GameBoard 节点
- `blockAtlas`: (可选) 方块图集资源
- `scoreLabel`: 拖拽 ScoreLabel 节点的 Label 组件
- `targetScoreLabel`: 拖拽 TargetLabel 节点的 Label 组件
- `gameOverPanel`: 拖拽 GameOverPanel 节点
- `finalScoreLabel`: 拖拽 FinalScore 节点的 Label 组件

**游戏参数：**
- `boardSize`: 10 (棋盘大小)
- `blockTypes`: 5 (方块类型数量)
- `targetScore`: 1000 (目标分数)
- `blockSize`: 60 (方块大小)
- `blockSpacing`: 5 (方块间距)

### 4. 资源准备

#### 4.1 方块图集 (可选)
如果需要使用自定义方块图片：

1. 创建图集资源 (`SpriteAtlas`)
2. 添加方块图片，命名规则：
   - `block_0.png` - 第一种颜色
   - `block_1.png` - 第二种颜色
   - `block_2.png` - 第三种颜色
   - `block_3.png` - 第四种颜色
   - `block_4.png` - 第五种颜色

3. 将图集拖拽到 GameManager 的 `blockAtlas` 属性

#### 4.2 UI 样式
- **字体**: 建议使用清晰的中文字体
- **颜色方案**: 
  - 背景：深色 (#2C3E50)
  - 方块：明亮色彩 (红、绿、蓝、黄、紫)
  - UI文字：白色 (#FFFFFF)
  - 按钮：渐变色

### 5. 按钮事件设置

在对应的按钮上设置点击事件：

**重新开始按钮：**
- Target: GameManager 节点
- Component: GameManager
- Handler: restartGame

**提示按钮和暂停按钮：**
这些按钮的事件已在 UIManager 中自动处理，无需手动设置。

### 6. 构建配置

#### 6.1 Web 平台
```json
{
  "platform": "web-mobile",
  "buildPath": "build/web-mobile",
  "debug": false,
  "sourceMaps": false
}
```

#### 6.2 移动平台
```json
{
  "platform": "android/ios",
  "orientation": "portrait",
  "targetApiLevel": 30
}
```

## 🎮 游戏玩法说明

### 基础规则
1. 点击 2 个或以上相连的同色方块进行消除
2. 消除后方块自动下落和左移
3. 达到目标分数即可过关

### 得分规则
- **消除得分**: `(n-2)²`，n 为消除的方块数
- **剩余奖励**: 剩余 ≤ 10 个方块时获得奖励
- **全清奖励**: 额外 200 分

### 操作说明
- **点击**: 消除连通方块
- **提示**: 显示最佳消除选择
- **暂停**: 暂停/恢复游戏
- **重新开始**: 开始新游戏

## 🔧 自定义配置

### 游戏难度调整
在 GameManager 中修改以下参数：

```typescript
// 简单模式
boardSize = 8;      // 8x8 棋盘
blockTypes = 4;     // 4 种颜色
targetScore = 500;  // 目标分数

// 困难模式  
boardSize = 12;     // 12x12 棋盘
blockTypes = 6;     // 6 种颜色
targetScore = 2000; // 目标分数
```

### 方块颜色自定义
在 `BlockManager.ts` 中修改 `blockColors` 数组：

```typescript
private blockColors: Color[] = [
    new Color(255, 100, 100, 255),  // 红色
    new Color(100, 255, 100, 255),  // 绿色
    new Color(100, 100, 255, 255),  // 蓝色
    // 添加更多颜色...
];
```

### 动画效果调整
在各管理器中修改 tween 动画参数：

```typescript
// 消除动画
tween(blockNode)
    .to(0.3, { scale: new Vec3(0, 0, 1) }, { easing: 'backIn' })
    .start();

// 下落动画
tween(blockNode)
    .to(0.3, { position: newPos }, { easing: 'bounceOut' })
    .start();
```

## 🐛 常见问题

### Q: 方块不显示
**A**: 检查以下项目：
1. GameBoard 节点是否正确设置
2. blockAtlas 是否正确配置（或设为 null 使用纯色）
3. 控制台是否有错误信息

### Q: 点击无响应
**A**: 检查以下项目：
1. InputManager 是否正确初始化
2. Canvas 是否有 GraphicRaycaster 组件
3. GameManager 组件是否正确挂载

### Q: 动画卡顿
**A**: 优化建议：
1. 减少同时播放的动画数量
2. 使用对象池管理方块节点
3. 降低动画精度或时长

### Q: 编译错误
**A**: 检查以下项目：
1. TypeScript 版本兼容性
2. 所有 import 路径是否正确
3. Cocos Creator 版本是否支持

## 📊 性能优化

### 1. 对象池
当前已实现基础的节点管理，可进一步优化：

```typescript
// 在 BlockManager 中实现节点复用
private blockPool: Node[] = [];

createBlockNode(blockType: number): Node {
    let blockNode = this.blockPool.pop();
    if (!blockNode) {
        blockNode = new Node();
        // 初始化组件...
    }
    // 配置方块...
    return blockNode;
}
```

### 2. 批量操作
```typescript
// 批量处理动画
const promises = blocks.map(block => this.animateBlock(block));
await Promise.all(promises);
```

### 3. 内存管理
```typescript
// 及时清理无用节点
blockNode.removeFromParent();
blockNode.destroy();
```

## 🚀 扩展功能

### 1. 关卡系统
```typescript
interface Level {
    id: number;
    boardSize: number;
    blockTypes: number;
    targetScore: number;
    timeLimit?: number;
}
```

### 2. 道具系统
```typescript
enum PowerUpType {
    Bomb,       // 炸弹：消除周围方块
    Rainbow,    // 彩虹：消除同色方块
    Hammer,     // 锤子：消除单个方块
}
```

### 3. 音效系统
```typescript
// 在各个操作中添加音效
playSound(soundName: string) {
    AudioEngine.playEffect(soundName, false);
}
```

---

## 📞 技术支持

如遇到问题，请查看：
1. 控制台错误信息
2. README.md 详细说明
3. 各管理器类的 debug 方法

游戏开发愉快！🎮
