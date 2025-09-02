System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, Sprite, SpriteFrame, instantiate, UITransform, Color, _decorator, Texture2D, ImageAsset, Rect, BlockManager, _crd, ccclass, property;

  _export("BlockManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      instantiate = _cc.instantiate;
      UITransform = _cc.UITransform;
      Color = _cc.Color;
      _decorator = _cc._decorator;
      Texture2D = _cc.Texture2D;
      ImageAsset = _cc.ImageAsset;
      Rect = _cc.Rect;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9132eXgdGdH87ylNY4WHLhb", "BlockManager", undefined);
      /**
       * 方块管理器
       * 负责管理彩色方块的创建、显示和类型管理
       */


      __checkObsolete__(['Node', 'SpriteAtlas', 'Sprite', 'SpriteFrame', 'instantiate', 'UITransform', 'Color', '_decorator', 'Texture2D', 'ImageAsset', 'Rect']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BlockManager", BlockManager = class BlockManager {
        constructor() {
          this.blockAtlas = null;
          this.blockTypeCount = 5;
          // 预定义的颜色方案（如果没有图集的话）
          this.blockColors = [new Color(255, 100, 100, 255), // 红色
          new Color(100, 255, 100, 255), // 绿色
          new Color(100, 100, 255, 255), // 蓝色
          new Color(255, 255, 100, 255), // 黄色
          new Color(255, 100, 255, 255), // 紫色
          new Color(100, 255, 255, 255), // 青色
          new Color(255, 150, 100, 255), // 橙色
          new Color(150, 150, 150, 255) // 灰色
          ];
        }

        /**
         * 初始化方块管理器
         */
        init(blockAtlas, blockTypeCount) {
          this.blockAtlas = blockAtlas;
          this.blockTypeCount = Math.min(blockTypeCount, this.blockColors.length);
          console.log(`✅ 方块管理器初始化完成，方块类型数: ${this.blockTypeCount}`);

          if (!this.blockAtlas) {
            console.log('⚠️ 未设置方块图集，将使用纯色方块');
          }
        }
        /**
         * 创建指定类型的方块节点
         */


        createBlockNode(blockType, blockSize = 60) {
          if (blockType < 0 || blockType >= this.blockTypeCount) {
            console.error(`❌ 无效的方块类型: ${blockType}`);
            return null;
          } // 创建新节点


          const blockNode = new Node(`Block_Type_${blockType}`); // 添加UITransform组件

          const transform = blockNode.addComponent(UITransform);
          transform.setContentSize(blockSize, blockSize); // 使用动态方块大小
          // 添加Sprite组件

          const sprite = blockNode.addComponent(Sprite); // 设置方块外观

          this.setupBlockAppearance(sprite, blockType, blockSize);
          return blockNode;
        }
        /**
         * 设置方块外观
         */


        setupBlockAppearance(sprite, blockType, blockSize) {
          console.log(`🎨 开始设置方块外观: Type ${blockType}, Size ${blockSize}px`);

          try {
            if (this.blockAtlas) {
              // 使用图集中的sprite frame
              const spriteFrameName = `block_${blockType}`;
              const spriteFrame = this.blockAtlas.getSpriteFrame(spriteFrameName);

              if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                console.log(`🎨 使用图集sprite: ${spriteFrameName}`);
              } else {
                console.warn(`⚠️ 图集中未找到 ${spriteFrameName}，使用纯色方块`);
                this.setupColorBlock(sprite, blockType, blockSize);
              }
            } else {
              // 使用纯色方块
              console.log(`🎨 使用纯色方块模式`);
              this.setupColorBlock(sprite, blockType, blockSize);
            }

            console.log(`✅ 方块外观设置完成`);
          } catch (error) {
            console.error(`❌ 设置方块外观时出错:`, error); // 简单的回退方案：只设置颜色，不使用SpriteFrame

            try {
              sprite.color = this.blockColors[blockType] || this.blockColors[0];
              console.log(`🔧 使用简单颜色回退方案: ${sprite.color.toHEX()}`);
            } catch (fallbackError) {
              console.error(`❌ 回退方案也失败:`, fallbackError);
            }
          }
        }
        /**
         * 设置纯色方块
         */


        setupColorBlock(sprite, blockType, blockSize) {
          console.log(`🎨 开始设置纯色方块: Type ${blockType}, Size ${blockSize}px`);

          try {
            // 创建与方块尺寸匹配的纹理
            console.log(`🔧 创建SpriteFrame...`);
            this.createDefaultSpriteFrame(sprite, blockSize); // 设置颜色

            if (blockType < this.blockColors.length) {
              sprite.color = this.blockColors[blockType];
              console.log(`🎨 设置方块颜色: Type ${blockType} -> ${this.blockColors[blockType].toHEX()}`);
            } else {
              console.warn(`⚠️ 方块类型超出范围: ${blockType}，使用默认颜色`);
              sprite.color = this.blockColors[0];
            }

            console.log(`✅ 纯色方块设置完成`);
          } catch (error) {
            console.error(`❌ 设置纯色方块时出错:`, error);
            console.log(`🔧 尝试最简单的颜色设置...`);
            sprite.color = this.blockColors[0]; // 红色作为回退
          }
        }
        /**
         * 创建与UITransform尺寸匹配的SpriteFrame
         */


        createDefaultSpriteFrame(sprite, size = 40) {
          // 使用与UITransform相同的尺寸，带1px白边框
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d'); // 填充白色背景（边框）

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size); // 填充内部区域（留出1px边框）

          ctx.fillStyle = 'gray'; // 灰色内部，颜色会被Sprite.color覆盖

          ctx.fillRect(1, 1, size - 2, size - 2); // 创建纹理

          const texture = new Texture2D();
          const imageAsset = new ImageAsset();
          imageAsset._nativeAsset = canvas;
          texture.image = imageAsset; // 创建SpriteFrame

          const spriteFrame = new SpriteFrame();
          spriteFrame.texture = texture;
          spriteFrame.rect = new Rect(0, 0, size, size);
          sprite.spriteFrame = spriteFrame;
          console.log(`✅ 创建尺寸匹配的SpriteFrame成功: ${size}×${size}px`);
        }
        /**
         * 创建方块的复制品（用于动画等）
         */


        cloneBlockNode(originalNode) {
          if (!originalNode) return null;
          const clonedNode = instantiate(originalNode);
          clonedNode.name = originalNode.name + '_Clone';
          return clonedNode;
        }
        /**
         * 获取方块类型数量
         */


        getBlockTypeCount() {
          return this.blockTypeCount;
        }
        /**
         * 获取方块颜色
         */


        getBlockColor(blockType) {
          if (blockType >= 0 && blockType < this.blockColors.length) {
            return this.blockColors[blockType];
          }

          return Color.WHITE;
        }
        /**
         * 设置方块的透明度
         */


        setBlockOpacity(blockNode, opacity) {
          const sprite = blockNode.getComponent(Sprite);

          if (sprite) {
            const color = sprite.color.clone();
            color.a = opacity;
            sprite.color = color;
          }
        }
        /**
         * 设置方块的高亮效果
         */


        setBlockHighlight(blockNode, highlight) {
          const sprite = blockNode.getComponent(Sprite);

          if (sprite) {
            if (highlight) {
              // 高亮：增加亮度
              const color = sprite.color.clone();
              color.r = Math.min(255, color.r * 1.2);
              color.g = Math.min(255, color.g * 1.2);
              color.b = Math.min(255, color.b * 1.2);
              sprite.color = color;
            } else {
              // 恢复原色：需要知道原始类型
              // 这里简化处理，实际项目中可能需要存储原始颜色
              const blockName = blockNode.name;
              const typeMatch = blockName.match(/Block_Type_(\d+)/);

              if (typeMatch) {
                const blockType = parseInt(typeMatch[1]);
                this.setupBlockAppearance(sprite, blockType);
              }
            }
          }
        }
        /**
         * 获取方块类型（从节点名称解析）
         */


        getBlockTypeFromNode(blockNode) {
          const blockName = blockNode.name;
          const typeMatch = blockName.match(/Block_Type_(\d+)/);

          if (typeMatch) {
            return parseInt(typeMatch[1]);
          }

          return -1;
        }
        /**
         * 验证方块类型是否有效
         */


        isValidBlockType(blockType) {
          return blockType >= 0 && blockType < this.blockTypeCount;
        }
        /**
         * 获取随机方块类型
         */


        getRandomBlockType() {
          return Math.floor(Math.random() * this.blockTypeCount);
        }
        /**
         * 调试：打印方块信息
         */


        debugPrintBlockInfo(blockNode) {
          const blockType = this.getBlockTypeFromNode(blockNode);
          const sprite = blockNode.getComponent(Sprite);
          const color = sprite ? sprite.color : null;
          console.log(`🔍 方块信息: ${blockNode.name}, Type: ${blockType}, Color: ${color == null ? void 0 : color.toHEX()}`);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=84987ce4a6098cae29d2dc0cb15ec56695e48b03.js.map