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
          console.log("\u2705 \u65B9\u5757\u7BA1\u7406\u5668\u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u65B9\u5757\u7C7B\u578B\u6570: " + this.blockTypeCount);

          if (!this.blockAtlas) {
            console.log('⚠️ 未设置方块图集，将使用纯色方块');
          }
        }
        /**
         * 创建指定类型的方块节点
         */


        createBlockNode(blockType, blockSize) {
          if (blockSize === void 0) {
            blockSize = 60;
          }

          if (blockType < 0 || blockType >= this.blockTypeCount) {
            console.error("\u274C \u65E0\u6548\u7684\u65B9\u5757\u7C7B\u578B: " + blockType);
            return null;
          } // 创建新节点


          var blockNode = new Node("Block_Type_" + blockType); // 添加UITransform组件

          var transform = blockNode.addComponent(UITransform);
          transform.setContentSize(blockSize, blockSize); // 使用动态方块大小
          // 添加Sprite组件

          var sprite = blockNode.addComponent(Sprite); // 设置方块外观

          this.setupBlockAppearance(sprite, blockType, blockSize);
          return blockNode;
        }
        /**
         * 设置方块外观
         */


        setupBlockAppearance(sprite, blockType, blockSize) {
          console.log("\uD83C\uDFA8 \u5F00\u59CB\u8BBE\u7F6E\u65B9\u5757\u5916\u89C2: Type " + blockType + ", Size " + blockSize + "px");

          try {
            if (this.blockAtlas) {
              // 使用图集中的sprite frame
              var spriteFrameName = "block_" + blockType;
              var spriteFrame = this.blockAtlas.getSpriteFrame(spriteFrameName);

              if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                console.log("\uD83C\uDFA8 \u4F7F\u7528\u56FE\u96C6sprite: " + spriteFrameName);
              } else {
                console.warn("\u26A0\uFE0F \u56FE\u96C6\u4E2D\u672A\u627E\u5230 " + spriteFrameName + "\uFF0C\u4F7F\u7528\u7EAF\u8272\u65B9\u5757");
                this.setupColorBlock(sprite, blockType, blockSize);
              }
            } else {
              // 使用纯色方块
              console.log("\uD83C\uDFA8 \u4F7F\u7528\u7EAF\u8272\u65B9\u5757\u6A21\u5F0F");
              this.setupColorBlock(sprite, blockType, blockSize);
            }

            console.log("\u2705 \u65B9\u5757\u5916\u89C2\u8BBE\u7F6E\u5B8C\u6210");
          } catch (error) {
            console.error("\u274C \u8BBE\u7F6E\u65B9\u5757\u5916\u89C2\u65F6\u51FA\u9519:", error); // 简单的回退方案：只设置颜色，不使用SpriteFrame

            try {
              sprite.color = this.blockColors[blockType] || this.blockColors[0];
              console.log("\uD83D\uDD27 \u4F7F\u7528\u7B80\u5355\u989C\u8272\u56DE\u9000\u65B9\u6848: " + sprite.color.toHEX());
            } catch (fallbackError) {
              console.error("\u274C \u56DE\u9000\u65B9\u6848\u4E5F\u5931\u8D25:", fallbackError);
            }
          }
        }
        /**
         * 设置纯色方块
         */


        setupColorBlock(sprite, blockType, blockSize) {
          console.log("\uD83C\uDFA8 \u5F00\u59CB\u8BBE\u7F6E\u7EAF\u8272\u65B9\u5757: Type " + blockType + ", Size " + blockSize + "px");

          try {
            // 创建与方块尺寸匹配的纹理
            console.log("\uD83D\uDD27 \u521B\u5EFASpriteFrame...");
            this.createDefaultSpriteFrame(sprite, blockSize); // 设置颜色

            if (blockType < this.blockColors.length) {
              sprite.color = this.blockColors[blockType];
              console.log("\uD83C\uDFA8 \u8BBE\u7F6E\u65B9\u5757\u989C\u8272: Type " + blockType + " -> " + this.blockColors[blockType].toHEX());
            } else {
              console.warn("\u26A0\uFE0F \u65B9\u5757\u7C7B\u578B\u8D85\u51FA\u8303\u56F4: " + blockType + "\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u989C\u8272");
              sprite.color = this.blockColors[0];
            }

            console.log("\u2705 \u7EAF\u8272\u65B9\u5757\u8BBE\u7F6E\u5B8C\u6210");
          } catch (error) {
            console.error("\u274C \u8BBE\u7F6E\u7EAF\u8272\u65B9\u5757\u65F6\u51FA\u9519:", error);
            console.log("\uD83D\uDD27 \u5C1D\u8BD5\u6700\u7B80\u5355\u7684\u989C\u8272\u8BBE\u7F6E...");
            sprite.color = this.blockColors[0]; // 红色作为回退
          }
        }
        /**
         * 创建与UITransform尺寸匹配的SpriteFrame
         */


        createDefaultSpriteFrame(sprite, size) {
          if (size === void 0) {
            size = 40;
          }

          // 使用与UITransform相同的尺寸，带1px白边框
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d'); // 填充白色背景（边框）

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size); // 填充内部区域（留出1px边框）

          ctx.fillStyle = 'gray'; // 灰色内部，颜色会被Sprite.color覆盖

          ctx.fillRect(1, 1, size - 2, size - 2); // 创建纹理

          var texture = new Texture2D();
          var imageAsset = new ImageAsset();
          imageAsset._nativeAsset = canvas;
          texture.image = imageAsset; // 创建SpriteFrame

          var spriteFrame = new SpriteFrame();
          spriteFrame.texture = texture;
          spriteFrame.rect = new Rect(0, 0, size, size);
          sprite.spriteFrame = spriteFrame;
          console.log("\u2705 \u521B\u5EFA\u5C3A\u5BF8\u5339\u914D\u7684SpriteFrame\u6210\u529F: " + size + "\xD7" + size + "px");
        }
        /**
         * 创建方块的复制品（用于动画等）
         */


        cloneBlockNode(originalNode) {
          if (!originalNode) return null;
          var clonedNode = instantiate(originalNode);
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
          var sprite = blockNode.getComponent(Sprite);

          if (sprite) {
            var color = sprite.color.clone();
            color.a = opacity;
            sprite.color = color;
          }
        }
        /**
         * 设置方块的高亮效果
         */


        setBlockHighlight(blockNode, highlight) {
          var sprite = blockNode.getComponent(Sprite);

          if (sprite) {
            if (highlight) {
              // 高亮：增加亮度
              var color = sprite.color.clone();
              color.r = Math.min(255, color.r * 1.2);
              color.g = Math.min(255, color.g * 1.2);
              color.b = Math.min(255, color.b * 1.2);
              sprite.color = color;
            } else {
              // 恢复原色：需要知道原始类型
              // 这里简化处理，实际项目中可能需要存储原始颜色
              var blockName = blockNode.name;
              var typeMatch = blockName.match(/Block_Type_(\d+)/);

              if (typeMatch) {
                var blockType = parseInt(typeMatch[1]);
                this.setupBlockAppearance(sprite, blockType);
              }
            }
          }
        }
        /**
         * 获取方块类型（从节点名称解析）
         */


        getBlockTypeFromNode(blockNode) {
          var blockName = blockNode.name;
          var typeMatch = blockName.match(/Block_Type_(\d+)/);

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
          var blockType = this.getBlockTypeFromNode(blockNode);
          var sprite = blockNode.getComponent(Sprite);
          var color = sprite ? sprite.color : null;
          console.log("\uD83D\uDD0D \u65B9\u5757\u4FE1\u606F: " + blockNode.name + ", Type: " + blockType + ", Color: " + (color == null ? void 0 : color.toHEX()));
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=84987ce4a6098cae29d2dc0cb15ec56695e48b03.js.map