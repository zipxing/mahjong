/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 15:23:45
 */
import { _decorator, Component, Node } from "cc";
import { Main } from "../main";
const { ccclass, property } = _decorator;

@ccclass("RankPage")
export class RankPage extends Component {
    @property(Node)
    public gameNode = null;
    game: any;
    ranknode: Node;

    start() {
        this.game = this.gameNode.getComponent(Main).game;
        this.ranknode = this.node.getChildByName("ranknode");
    }

    onrankCloseHandler(eve: any) {
        this.game.btn_rank_close_fun();
    }

    onrankCguanHandler(eve: any) {
        this.game.btn_rank_challenge_fun();
    }

    onrankJdianHandler(eve: any) {
        this.game.btn_rank_classic_fun();
    }
}
