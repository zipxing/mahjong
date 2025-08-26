import { _decorator, Component, sp, Label, Node, log } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ShareGiftAnimationView")
export class ShareGiftAnimationView extends Component {
    @property(sp.Skeleton)
    public spineAnimation = null;
    @property(Label)
    public lableGiftContent = null;
    @property(Node)
    public nodeContent = null;

    onLoad() {
        this.nodeContent.active = false;
    }

    start() {
        this.spineAnimation.setStartListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log("[track %s][animation %s] start.", trackEntry.trackIndex, animationName);
        });
        this.spineAnimation.setInterruptListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log("[track %s][animation %s] interrupt.", trackEntry.trackIndex, animationName);
        });
        this.spineAnimation.setEndListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log("[track %s][animation %s] end.", trackEntry.trackIndex, animationName);
        });
        this.spineAnimation.setDisposeListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log("[track %s][animation %s] will be disposed.", trackEntry.trackIndex, animationName);
        });
        this.spineAnimation.setCompleteListener((trackEntry, loopCount) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log("[track %s][animation %s] complete: %s", trackEntry.trackIndex, animationName, loopCount);
            this.showContent();
        });
        this.spineAnimation.setEventListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            log(
                "[track %s][animation %s] event: %s, %s, %s, %s",
                trackEntry.trackIndex,
                animationName,
                event.data.name,
                event.intValue,
                event.floatValue,
                event.stringValue
            );
        });
    }

    showContent() {
        this.nodeContent.active = true;
    }

    init(str_content: any) {
        this.lableGiftContent.string = str_content;
    }

    show() {
        this.node.active = true;
        this.nodeContent.active = true;
    }

    hide() {
        this.node.active = false;
        this.nodeContent.active = false;
    }
}
