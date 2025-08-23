# 麻将连连看 - 分步创建指南

## 🧹 已完成：清理工作
✅ 删除了所有旧的场景、脚本文件
✅ 清理了缓存目录
✅ 项目现在是干净的状态

## 📋 接下来的步骤

### 🎯 步骤1：在Cocos Creator中创建场景
1. 打开Cocos Creator 3.8.7
2. 打开MahjongWuShuang项目
3. 在资源管理器中右键点击`scenes`文件夹
4. 选择"新建" → "场景"
5. 命名为`GameScene`
6. 双击打开新创建的场景

### 🎯 步骤2：创建GameManager脚本
1. 在资源管理器中右键点击`scripts`文件夹
2. 选择"新建" → "TypeScript"
3. 命名为`GameManager`
4. 双击打开脚本文件

### 🎯 步骤3：复制GameManager代码
请将以下代码复制到GameManager.ts文件中：

```typescript
import { _decorator, Component, Node, Vec3, Color, Label, Sprite, UITransform, input, Input, EventTouch, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 麻将连连看游戏管理器
 * 简化版本，专注核心功能
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    @property(Node)
    gameBoard: Node = null!;
    
    // 游戏配置
    private boardSize: number = 6;  // 6x6棋盘，便于测试
    private tileTypes: string[] = ['🀄', '🀅', '🀆'];  // 3种麻将类型
    private tileSize: number = 80;
    private tileGap: number = 10;
    
    // 游戏状态
    private board: (TileData | null)[][] = [];
    private tileNodes: (Node | null)[][] = [];
    private selectedTile: {row: number, col: number} | null = null;
    
    onLoad() {
        console.log('GameManager onLoad');
        this.init();
    }
    
    start() {
        console.log('GameManager start');
        // 注册触摸事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    onDestroy() {
        // 移除触摸事件
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    /**
     * 初始化游戏
     */
    private init() {
        console.log('开始初始化游戏...');
        
        if (!this.gameBoard) {
            console.error('GameBoard节点未设置！');
            return;
        }
        
        this.createBoard();
        this.generateSimplePairs();
        this.renderBoard();
        
        console.log('游戏初始化完成！');
    }
    
    /**
     * 创建空白棋盘
     */
    private createBoard() {
        this.board = [];
        this.tileNodes = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            this.tileNodes[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
                this.tileNodes[i][j] = null;
            }
        }
        console.log(`创建了 ${this.boardSize}x${this.boardSize} 的棋盘`);
    }
    
    /**
     * 生成简单的配对麻将
     */
    private generateSimplePairs() {
        const tiles: TileData[] = [];
        
        // 为每种类型生成足够的配对
        const tilesPerType = Math.floor((this.boardSize * this.boardSize) / (this.tileTypes.length * 2)) * 2;
        
        for (let i = 0; i < this.tileTypes.length; i++) {
            for (let j = 0; j < tilesPerType; j++) {
                tiles.push({
                    type: i,
                    symbol: this.tileTypes[i],
                    id: `${i}-${j}`
                });
            }
        }
        
        // 简单洗牌
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        
        // 填充到棋盘
        let tileIndex = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (tileIndex < tiles.length) {
                    this.board[row][col] = tiles[tileIndex++];
                }
            }
        }
        
        console.log(`生成了 ${tiles.length} 个麻将`);
    }
    
    /**
     * 渲染棋盘
     */
    private renderBoard() {
        console.log('开始渲染棋盘...');
        
        // 清空现有节点
        this.gameBoard.removeAllChildren();
        
        // 计算起始位置
        const boardWidth = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const boardHeight = this.boardSize * this.tileSize + (this.boardSize - 1) * this.tileGap;
        const startX = -boardWidth / 2 + this.tileSize / 2;
        const startY = boardHeight / 2 - this.tileSize / 2;
        
        let tilesCreated = 0;
        
        // 创建麻将节点
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile) {
                    const tileNode = this.createTileNode(tile, row, col);
                    
                    // 设置位置
                    const x = startX + col * (this.tileSize + this.tileGap);
                    const y = startY - row * (this.tileSize + this.tileGap);
                    tileNode.setPosition(x, y, 0);
                    
                    // 添加到场景
                    this.gameBoard.addChild(tileNode);
                    this.tileNodes[row][col] = tileNode;
                    tilesCreated++;
                }
            }
        }
        
        console.log(`渲染完成，创建了 ${tilesCreated} 个麻将节点`);
    }
    
    /**
     * 创建麻将节点
     */
    private createTileNode(tileData: TileData, row: number, col: number): Node {
        const tileNode = new Node(`Tile_${row}_${col}`);
        
        // 添加UITransform
        const transform = tileNode.addComponent(UITransform);
        transform.setContentSize(this.tileSize, this.tileSize);
        
        // 添加背景Sprite
        const sprite = tileNode.addComponent(Sprite);
        sprite.color = new Color(240, 240, 240, 255); // 浅灰色背景
        
        // 创建文字标签
        const labelNode = new Node('Label');
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(this.tileSize, this.tileSize);
        
        const label = labelNode.addComponent(Label);
        label.string = tileData.symbol;
        label.fontSize = 36;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 设置颜色
        const colors = [
            new Color(229, 62, 62),   // 红色
            new Color(56, 161, 105),  // 绿色
            new Color(49, 130, 206),  // 蓝色
        ];
        
        if (tileData.type < colors.length) {
            label.color = colors[tileData.type];
        }
        
        tileNode.addChild(labelNode);
        
        // 存储数据
        (tileNode as any).tileData = tileData;
        (tileNode as any).gridRow = row;
        (tileNode as any).gridCol = col;
        
        return tileNode;
    }
    
    /**
     * 触摸事件处理
     */
    private onTouchStart(event: EventTouch) {
        console.log('触摸事件:', event.getUILocation());
        // 这里可以添加触摸逻辑
    }
    
    /**
     * 重新开始游戏
     */
    public restart() {
        console.log('重新开始游戏');
        this.selectedTile = null;
        this.init();
    }
}

/**
 * 麻将数据接口
 */
interface TileData {
    type: number;
    symbol: string;
    id: string;
}
```

### 🎯 步骤4：保存并编译脚本
1. 保存GameManager.ts文件 (Ctrl+S 或 Cmd+S)
2. 等待Cocos Creator自动编译脚本
3. 检查控制台是否有编译错误

### 🎯 步骤5：在场景中设置节点
1. 确保GameScene场景已打开
2. 在层级管理器中，你应该看到：
   ```
   Canvas
   ├── Camera
   ```
3. 右键点击Canvas，选择"创建" → "创建空节点"
4. 将新节点重命名为"GameManager"
5. 再创建一个空节点，重命名为"GameBoard"

### 🎯 步骤6：添加GameManager组件
1. 选中"GameManager"节点
2. 在属性检查器中点击"添加组件"
3. 选择"自定义脚本" → "GameManager"
4. 在GameManager组件的属性中：
   - 将"Game Board"字段拖拽设置为"GameBoard"节点

### 🎯 步骤7：设置为启动场景
1. 在菜单栏选择"项目" → "项目设置"
2. 在"启动场景"中选择"GameScene"

### 🎯 步骤8：运行测试
1. 点击顶部的"运行"按钮
2. 选择浏览器预览
3. 应该看到6x6的麻将棋盘显示

## 🔍 预期结果
- 控制台显示初始化日志
- 屏幕显示6x6的麻将网格
- 每个麻将显示不同的符号和颜色
- 点击屏幕时控制台显示触摸日志

## ❓ 如果遇到问题
1. **脚本编译错误**: 检查代码是否完全复制正确
2. **节点引用错误**: 确保GameBoard节点正确拖拽到GameManager组件
3. **场景不显示**: 检查启动场景设置是否正确

---

请按照这些步骤操作，每完成一步告诉我结果，我会指导您继续下一步！
