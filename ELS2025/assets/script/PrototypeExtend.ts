import { UIOpacity } from "cc";
import { Node } from "cc";

declare module "cc" {
    interface Node {
        opacity: (op: number) => void;
    }
}
/*
 * @Date: 2023-08-28 17:33:01
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 17:40:28
 */
Node.prototype.opacity = function (op) {
    let opacity = this.getComponent(UIOpacity);
    if (!opacity) {
        opacity = this.addComponent(UIOpacity);
    }
    opacity.opacity = op;
};
