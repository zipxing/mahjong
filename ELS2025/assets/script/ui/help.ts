/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 11:06:11
 */
import { _decorator, Component } from "cc";
import { els } from "../core/els";
import { UIManager } from "./ui_manager";
const { ccclass } = _decorator;

@ccclass("Help")
export class Help extends Component {
    start() {
        var game = UIManager.game;
        var model = game.model;
        if (model.stage % 120 == 0) {
            model.playMusic(els.ELS_VOICE.HELP_MUSIC[parseInt((Math.random() * 4).toString())], false);
        }
    }

    btnCloseSelf() {
        UIManager.hideUI(els.ELS_GAME_LAYER.HELP);
    }
}
