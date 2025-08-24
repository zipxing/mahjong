/**
 * 拖拽虚影对象池管理器
 * 
 * 职责：
 * - 按麻将类型预先创建虚影节点
 * - 管理虚影节点的获取和归还
 * - 支持SpriteAtlas和Label两种渲染模式
 * - 避免拖拽时的创建和配置开销
 */

import { _decorator, Node, Vec3, Color, Label, UITransform, UIOpacity, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
const { ccclass } = _decorator;

@ccclass('ShadowPool')
export class ShadowPool {
    
    // ==================== 配置常量 ====================
    private readonly POOL_SIZE_PER_TYPE = 8;  // 每种麻将类型的对象池大小
    private tileSize: number = 80;  // 麻将大小：80x80像素
    private tileTypes: string[] = [
        '🀄', '🀅', '🀆', '🀇',  // 中、发、白、一万
        '🀈', '🀉', '🀊', '🀋'   // 二万、三万、四万、五万
    ];
    
    // ==================== 对象池系统 ====================
    private shadowPoolByType: Map<number, Node[]> = new Map();  // 按麻将类型分类的虚影对象池
    
    // ==================== 组件引用 ====================
    private mahjongAtlas: SpriteAtlas = null!;  // 麻将图集（用于DrawCall合批）
    private parentNode: Node = null!;  // 虚影节点的父节点
    
    /**
     * 初始化虚影对象池
     * （从GameManager.initShadowPool()直接复制）
     * 
     * 功能：
     * - 按麻将类型预先创建虚影节点
     * - 每种类型预创建足够数量，内容完全配置好
     * - 支持SpriteAtlas和Label两种渲染模式
     * - 避免拖拽时的任何创建和配置开销
     */
    init(mahjongAtlas: SpriteAtlas, parentNode: Node) {
        this.mahjongAtlas = mahjongAtlas;
        this.parentNode = parentNode;
        
        const renderMode = this.mahjongAtlas ? 'SpriteAtlas' : 'Label';
        console.log(`🎨 初始化按类型分类的虚影对象池 (渲染模式: ${renderMode})...`);
        
        // 清空现有对象池
        this.shadowPoolByType.forEach(pool => {
            pool.forEach(node => node.destroy());
        });
        this.shadowPoolByType.clear();
        
        // 为每种麻将类型创建对象池
        for (let tileType = 0; tileType < this.tileTypes.length; tileType++) {
            const typePool: Node[] = [];
            
            // 为每种类型预创建指定数量的虚影节点
            for (let i = 0; i < this.POOL_SIZE_PER_TYPE; i++) {
                const shadowNode = this.createShadowNodeForType(tileType);
                shadowNode.active = false; // 初始状态为隐藏
                shadowNode.setParent(this.parentNode);
                typePool.push(shadowNode);
            }
            
            this.shadowPoolByType.set(tileType, typePool);
        }
        
        // 统计渲染模式使用情况
        let spriteCount = 0;
        let labelCount = 0;
        this.shadowPoolByType.forEach(pool => {
            pool.forEach(node => {
                if ((node as any).renderMode === 'Sprite') {
                    spriteCount++;
                } else {
                    labelCount++;
                }
            });
        });
        
        const totalNodes = this.tileTypes.length * this.POOL_SIZE_PER_TYPE;
        console.log(`✅ 虚影对象池初始化完成！`);
        console.log(`   📊 总节点数: ${totalNodes} (${this.tileTypes.length}种类型 × ${this.POOL_SIZE_PER_TYPE}个/类型)`);
        console.log(`   🎨 渲染统计: Sprite=${spriteCount}, Label=${labelCount}`);
        console.log(`   ⚡ DrawCall优化: ${spriteCount > 0 ? '已启用' : '未启用 (需配置SpriteAtlas)'}`);
    }
    
    /**
     * 为指定麻将类型创建完全配置好的虚影节点
     * （从GameManager.createShadowNodeForType()直接复制）
     * 
     * @param tileType 麻将类型索引
     */
    private createShadowNodeForType(tileType: number): Node {
        const shadowNode = new Node(`Shadow_${tileType}_${this.tileTypes[tileType]}`);
        
        // 设置节点大小
        const transform = shadowNode.addComponent(UITransform);
        transform.setContentSize(this.tileSize, this.tileSize);
        
        // 添加透明度组件（用于半透明效果）
        const opacity = shadowNode.addComponent(UIOpacity);
        opacity.opacity = 150; // 半透明（与原版一致）
        
        // 尝试使用Sprite模式（DrawCall优化）
        if (this.mahjongAtlas && this.createSpriteBasedShadow(shadowNode, tileType)) {
            (shadowNode as any).renderMode = 'Sprite';
        } else {
            // 回退到Label模式
            this.createLabelBasedShadow(shadowNode, tileType);
            (shadowNode as any).renderMode = 'Label';
        }
        
        // 存储麻将类型信息
        (shadowNode as any).tileType = tileType;
        (shadowNode as any).tileSymbol = this.tileTypes[tileType];
        
        return shadowNode;
    }
    
    /**
     * 为虚影节点创建基于Sprite的渲染
     * （从GameManager.createSpriteBasedShadow()直接复制）
     * 
     * @param shadowNode 虚影节点
     * @param tileType 麻将类型索引
     * @returns 是否创建成功
     */
    private createSpriteBasedShadow(shadowNode: Node, tileType: number): boolean {
        try {
            const sprite = shadowNode.addComponent(Sprite);
            const spriteFrameName = this.getSpriteFrameName(tileType);
            const spriteFrame = this.mahjongAtlas.getSpriteFrame(spriteFrameName);
            
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                return true;
            }
        } catch (error) {
            console.warn(`创建Sprite虚影失败 (类型 ${tileType}):`, error);
        }
        return false;
    }
    
    /**
     * 为虚影节点创建基于Label的渲染
     * （从GameManager.createLabelBasedShadow()直接复制）
     * 
     * @param shadowNode 虚影节点
     * @param tileType 麻将类型索引
     */
    private createLabelBasedShadow(shadowNode: Node, tileType: number): void {
        // 添加Label子节点并完全配置
        const labelNode = new Node('Label');
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(this.tileSize, this.tileSize);
        const label = labelNode.addComponent(Label);
        
        // 完全配置Label内容
        label.string = this.tileTypes[tileType];
        label.fontSize = 32;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        // 设置对应类型的颜色
        const colors = [
            new Color(229, 62, 62),   // 🀄 中 - 红色
            new Color(56, 161, 105),  // 🀅 发 - 绿色  
            new Color(49, 130, 206),  // 🀆 白 - 蓝色
            new Color(214, 158, 46),  // 🀇 一万 - 黄色
            new Color(128, 90, 213),  // 🀈 二万 - 紫色
            new Color(221, 107, 32),  // 🀉 三万 - 橙色
            new Color(49, 151, 149),  // 🀊 四万 - 青色
            new Color(236, 72, 153),  // 🀋 五万 - 粉色
        ];
        
        if (tileType < colors.length) {
            label.color = colors[tileType];
        }
        
        shadowNode.addChild(labelNode);
    }
    
    /**
     * 获取Sprite图片名称
     * （从GameManager.getSpriteFrameName()直接复制）
     */
    private getSpriteFrameName(tileType: number): string {
        // 根据麻将类型返回对应的图片名称
        // 这里需要根据实际的SpriteAtlas中的图片名称来调整
        const typeNames = [
            'zhong',    // 🀄 中
            'fa',       // 🀅 发  
            'bai',      // 🀆 白
            'yi_wan',   // 🀇 一万
            'er_wan',   // 🀈 二万
            'san_wan',  // 🀉 三万
            'si_wan',   // 🀊 四万
            'wu_wan'    // 🀋 五万
        ];
        
        return typeNames[tileType] || 'zhong';
    }
    
    /**
     * 从对象池获取指定类型的虚影节点
     * （从GameManager.getShadowFromPool()直接复制）
     * 
     * @param tileType 麻将类型索引
     */
    getShadowFromPool(tileType: number): Node | null {
        const typePool = this.shadowPoolByType.get(tileType);
        if (!typePool) {
            console.warn(`未找到类型 ${tileType} 的对象池`);
            return null;
        }
        
        // 查找可用的虚影节点
        for (const shadowNode of typePool) {
            if (!shadowNode.active) {
                shadowNode.active = true;
                return shadowNode;
            }
        }
        
        console.warn(`类型 ${tileType} 的对象池已满，创建临时节点`);
        // 如果池子满了，创建临时节点
        const tempShadow = this.createShadowNodeForType(tileType);
        tempShadow.setParent(this.parentNode);
        return tempShadow;
    }
    
    /**
     * 归还虚影节点到对应类型的对象池
     * （从GameManager.returnShadowToPool()直接复制）
     */
    returnShadowToPool(shadowNode: Node) {
        const tileType = (shadowNode as any).tileType;
        
        // 检查是否是对象池中的节点
        let isPoolNode = false;
        if (typeof tileType === 'number') {
            const typePool = this.shadowPoolByType.get(tileType);
            if (typePool) {
                for (const poolNode of typePool) {
                    if (poolNode === shadowNode) {
                        isPoolNode = true;
                        break;
                    }
                }
            }
        }
        
        if (isPoolNode) {
            // 对象池节点：隐藏并重置
            shadowNode.active = false;
            shadowNode.setPosition(Vec3.ZERO);
            shadowNode.setScale(Vec3.ONE);
        } else {
            // 临时节点：直接销毁
            shadowNode.destroy();
        }
    }
    
    /**
     * 清除所有虚影节点
     */
    clearAllShadows() {
        this.shadowPoolByType.forEach(pool => {
            pool.forEach(shadowNode => {
                if (shadowNode.active) {
                    this.returnShadowToPool(shadowNode);
                }
            });
        });
    }
    
    /**
     * 销毁对象池
     */
    destroy() {
        this.shadowPoolByType.forEach(pool => {
            pool.forEach(node => {
                if (node.isValid) {
                    node.destroy();
                }
            });
        });
        this.shadowPoolByType.clear();
    }
    
    // ==================== Getter方法 ====================
    
    getPoolSizePerType(): number {
        return this.POOL_SIZE_PER_TYPE;
    }
    
    getTotalPoolSize(): number {
        return this.tileTypes.length * this.POOL_SIZE_PER_TYPE;
    }
    
    getActiveCount(): number {
        let count = 0;
        this.shadowPoolByType.forEach(pool => {
            pool.forEach(node => {
                if (node.active) count++;
            });
        });
        return count;
    }
    
    getPoolStats(): { total: number, active: number, available: number } {
        const total = this.getTotalPoolSize();
        const active = this.getActiveCount();
        return {
            total,
            active,
            available: total - active
        };
    }
}
