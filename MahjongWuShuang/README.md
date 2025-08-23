# 麻将连连看 - Cocos Creator版本

这是一个使用Cocos Creator 3.8.7开发的麻将连连看游戏，移植自Web版本。

## 游戏特性

### 🎮 核心玩法
- **点击消除**: 点击相同类型的麻将进行消除
- **拖拽移动**: 拖拽麻将进行移动，创造消除机会
- **智能虚影**: 拖拽时显示半透明虚影，直观显示移动效果
- **约束移动**: 虚影根据拖拽方向约束移动（横向/纵向）

### 🎯 游戏规则
1. 相邻的相同麻将可以直接消除
2. 同行或同列且中间无阻挡的相同麻将可以消除
3. 拖动麻将移动后，必须有消除机会，否则会自动回退
4. 目标是消除所有麻将

### ✨ 技术特性
- **TypeScript开发**: 使用TypeScript确保代码质量
- **组件化架构**: 清晰的组件分离和职责划分
- **动画效果**: 丰富的动画反馈和视觉效果
- **触摸支持**: 完整的触摸交互支持
- **状态管理**: 完善的游戏状态管理和历史记录

## 项目结构

```
MahjongWuShuang/
├── assets/
│   ├── scenes/                 # 游戏场景
│   │   ├── GameScene.scene     # 基础游戏场景
│   │   └── CompleteGameScene.scene # 完整游戏场景
│   ├── scripts/                # 游戏脚本
│   │   ├── GameManager.ts      # 游戏管理器（核心逻辑）
│   │   ├── MahjongTile.ts      # 麻将棋子组件
│   │   └── UIManager.ts        # UI管理器
│   ├── prefabs/                # 预制体
│   │   └── MahjongTile.prefab  # 麻将棋子预制体
│   ├── textures/               # 纹理资源
│   └── audio/                  # 音频资源
├── library/                    # Cocos Creator库文件
├── settings/                   # 项目设置
├── temp/                       # 临时文件
├── package.json               # 项目配置
└── README.md                  # 项目说明
```

## 核心组件说明

### GameManager.ts
游戏的核心管理器，负责：
- 游戏逻辑控制
- 棋盘生成和管理
- 拖拽交互处理
- 虚影系统管理
- 消除逻辑判断
- 移动和回退机制

### MahjongTile.ts
单个麻将棋子组件，负责：
- 麻将显示和样式
- 选中状态管理
- 动画效果播放
- 交互反馈

### UIManager.ts
UI界面管理器，负责：
- 分数和状态显示
- 按钮交互处理
- 游戏面板管理
- 提示信息显示

## 开发环境要求

- **Cocos Creator**: 3.8.7 或更高版本
- **Node.js**: 14.x 或更高版本
- **TypeScript**: 支持ES2020+

## 如何运行

1. **打开项目**
   ```bash
   # 使用Cocos Creator打开项目目录
   # 或者在Cocos Creator中选择"打开项目"并选择MahjongWuShuang文件夹
   ```

2. **配置场景**
   - 在资源管理器中找到 `assets/scenes/CompleteGameScene.scene`
   - 双击打开场景
   - 确保GameManager组件已正确配置：
     - tilePrefab: 指向 `assets/prefabs/MahjongTile.prefab`
     - gameBoard: 指向场景中的GameBoard节点
     - uiPanel: 指向场景中的UIPanel节点

3. **运行游戏**
   - 点击Cocos Creator顶部的"运行"按钮
   - 选择浏览器预览或其他平台

## 自定义配置

### 修改游戏参数
在 `GameManager.ts` 中可以调整以下参数：

```typescript
// 游戏配置
private boardSize: number = 8;                    // 棋盘大小
private tileTypes: string[] = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋']; // 麻将类型
private tileSize: number = 80;                    // 麻将大小
private tileGap: number = 5;                      // 麻将间隙
```

### 添加新的麻将类型
1. 在 `tileTypes` 数组中添加新的麻将符号
2. 在 `MahjongTile.ts` 的颜色配置中添加对应颜色

### 自定义动画效果
在 `MahjongTile.ts` 中修改各种动画方法：
- `setSelected()`: 选中动画
- `setHighlight()`: 高亮动画
- `playEliminateAnimation()`: 消除动画
- `playMoveFailedAnimation()`: 移动失败动画

## 构建发布

1. **Web平台**
   - 在Cocos Creator中选择"项目" -> "构建发布"
   - 选择"Web Mobile"或"Web Desktop"
   - 配置发布参数并构建

2. **移动平台**
   - 选择对应的移动平台（Android/iOS）
   - 配置平台相关设置
   - 构建并导出到对应的开发环境

## 技术亮点

### 拖拽虚影系统
- **方向约束**: 根据拖拽方向约束虚影移动
- **相对位置**: 保持麻将组的相对位置关系
- **实时更新**: 虚影位置实时跟随鼠标移动
- **视觉反馈**: 半透明效果提供清晰的视觉反馈

### 智能消除检测
- **相邻消除**: 检测相邻的相同麻将
- **直线消除**: 检测同行/同列的可消除麻将
- **路径检测**: 确保消除路径无阻挡
- **自动回退**: 无消除机会时自动回退移动

### 组件化设计
- **职责分离**: 每个组件职责明确
- **松耦合**: 组件间通过接口通信
- **可扩展**: 易于添加新功能和组件
- **可维护**: 代码结构清晰，易于维护

## 扩展建议

1. **音效系统**: 添加背景音乐和音效反馈
2. **粒子效果**: 为消除和移动添加粒子特效
3. **关卡系统**: 设计多个难度级别和关卡
4. **成就系统**: 添加游戏成就和统计
5. **网络功能**: 支持在线排行榜和多人对战

## 许可证

本项目基于原Web版本麻将连连看游戏移植而来，仅供学习和参考使用。

---

**开发者**: 基于Web版本移植  
**版本**: 1.0.0  
**引擎**: Cocos Creator 3.8.7  
**语言**: TypeScript
