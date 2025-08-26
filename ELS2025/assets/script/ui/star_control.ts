// Learn Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

import { NodePool, Prefab, instantiate, Vec2, Vec3, resources, Node } from "cc";
import { Star } from "./star";

export class StarControl {
    static nodepool: NodePool;
    static curNodeArray: any[];
    static isAniPlay: boolean;
    static prefabStar: any;
    static getnum: any;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    public static init() {
        this.nodepool = new NodePool();
        var self = this;
        this.curNodeArray = [];
        console.log("--------init--------------------");
        this.isAniPlay = false;
        this.prefabStar = null;

        resources.load("prefab/starnode", Prefab, function (err, prefab) {
            console.log("load prefab sucess ++++++++++++++++ ");
            if (prefab instanceof Prefab) {
                for (var i = 10; i >= 0; --i) {
                    var newNode = instantiate(prefab);
                    self.nodepool.put(newNode);
                }
                self.prefabStar = prefab;
            }
        });
    }

    static createStars(node: Node, starnum, getnum, startype) {
        if (!node) return;
        if (node.children.length > 0) return;
        if (!starnum || starnum > 1000) return;
        if (!getnum) getnum = 0;

        if (this.nodepool.size() === 0) return;
        this.isAniPlay = false;
        console.log("fengbing", " *-*-*- create stars *-*-*- " + starnum + "  getnum  " + getnum);

        this.clearNodes();
        this.getnum = getnum;
        var width = startype === 0 ? 23 : 46 + 32;
        var totalwidth = (starnum - 0.5) * (width + 14);

        for (var i = 0; i < starnum; i++) {
            var star = this.nodepool.get();
            //var star = instantiate(this.prefabStar);
            var jsstar = star.getComponent(Star);
            //@ts-ignore
            jsstar.init(startype, getnum > i ? 1 : 0);
            star.setPosition(new Vec3(-totalwidth * 0.5 + i * (width + 14), 0, 0));
            this.curNodeArray.push(star);
            node.addChild(star);
        }
        console.log("fengbing", " *-*-*- create stars *-*-*- end");
    }

    static playAddStarAni() {
        if (this.isAniPlay || this.curNodeArray.length == 0) return;

        if (this.getnum <= 0) return;
        this.isAniPlay = true;
        var node = this.curNodeArray[this.getnum - 1];
        var jsstar = node.getComponent(Star);
        // console.log("fengbing", " -*-*-*- play add star ani *-*-*-*-");
        jsstar.playAniAdd();
    }

    static playDelStarAni() {
        if (this.isAniPlay || this.curNodeArray.length == 0) return;

        if (this.getnum >= this.curNodeArray.length) return;
        this.isAniPlay = true;
        var node = this.curNodeArray[this.getnum];
        if (node) {
            console.log("fengbing", " -*-*-*- play del star ani *-*-*-*-");
            var jsstar = node.getComponent(Star);
            jsstar.playAnidel();
        }
    }

    static clearNodes() {
        var self = this;
        this.getnum = -1;
        this.isAniPlay = false;
        while (this.curNodeArray.length > 0) {
            var node = this.curNodeArray.shift();
            node.removeFromParent();
            self.nodepool.put(node);
        }
    }

    // update (dt) {},
}
let tywx = window["tywx"] || {};
tywx["StarControl"] = StarControl;
