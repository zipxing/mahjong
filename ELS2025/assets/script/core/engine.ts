export namespace nge {
    export class Point {
        public x: number;
        public y: number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }
    export class Model {}
    export class Render {
        draw() {
            //console.log("Must implement!");
        }
    }
    export const framehz = 30;
    export class Timer {
        private timers: any;
        constructor() {
            this.timers = {};
        }
        setup(name, time, cancel_cb) {
            this.timers[name] = {
                time_init: Math.ceil(time * framehz),
                time: 0,
                cancel_cb: cancel_cb,
                exdata: 0,
                firstRender: false,
            };
            console.log("TIMER", name, this.timers[name].time_init);
        }
        getFirstRenderFlag(name) {
            var ff = this.timers[name] && this.timers[name].firstRender;
            return ff;
        }
        resetFirstRenderFlag(name) {
            if (this.timers[name]) this.timers[name].firstRender = false;
        }
        trigger(name, exdata) {
            //console.log("Trigger..."+name);
            this.timers[name].firstRender = true;
            this.timers[name]["time"] = this.timers[name]["time_init"];
            this.timers[name]["exdata"] = exdata;
        }
        cancel(name) {
            this.timers[name]["time"] = 0;
            this.timers[name].firstRender = false;
            if (this.timers[name]["cancel_cb"]) this.timers[name]["cancel_cb"]();
        }
        getstat(name) {
            //console.error("getstat..."+name+".."+this.timers[name]["time"]);
            return this.timers[name]["time"];
        }
        getexdata(name) {
            return this.timers[name]["exdata"];
        }
        update() {
            for (var t in this.timers) {
                if (this.timers[t]["time"] > 0) {
                    this.timers[t]["time"]--;
                    if (this.timers[t]["time"] == 0) {
                        this.cancel(t);
                    }
                }
            }
        }
    }
    //Node Game Engine, by zipxing...
    export class Game {
        model: any;
        render: any;
        mstage: number;
        timeoauto: number;
        timeoai: number;
        useract: any[];
        gameover: number;
        //   var _Canvas = canvas;
        //   var _Context = canvas.getContext('2d')
        //console.log("NGE..."+_Context+".."+_Canvas);

        constructor(model, render) {
            this.model = model;
            this.render = render;
            this.render.game = this;
            this.mstage = 0;
            this.timeoauto = 0.0;
            this.timeoai = 0.0;
            this.useract = [];
            this.gameover = 0;
        }
        initGame(gameNode, bmp, seed) {
            //console.log("Must implement!");
        }
        restartGame() {}
        playUserAction(dt) {
            //console.log("Must implement!");
        }
        playAutoAction(dt) {
            //console.log("Must implement!");
        }
        playAiAction(dt) {
            //console.log("Must implement!");
        }
        playActionBase(index, act) {
            //console.log("Must implement!");
        }
        scheduleUpdate(dt) {
            console.log("循环");
            this.playUserAction(dt);
            this.playAutoAction(dt);
            this.playAiAction(dt);
            this.render.draw();
        }
        regKeyAction(kd) {
            var that = this;
        }
    }
    export class ngeImp {
        _frameHz: number;
        _tickLengthMs: number;
        _previousTick: number;
        _actualTicks: number;

        constructor() {
            this._frameHz = framehz;
            this._tickLengthMs = 1000.0 / this._frameHz;
            this._previousTick = Date.now();
            this._actualTicks = 0;
        }
        _gameLoop(g) {
            var now = Date.now();
            this._actualTicks++;
            if (this._previousTick + this._tickLengthMs <= now) {
                var delta = now - this._previousTick;
                this._previousTick = now;
                g.scheduleUpdate(delta);
                this._actualTicks = 0;
            }
            //setTimeout(function(){_gameLoop(g);} _tickLengthMs);
        }

        //通用clone方法，不支持function，速度较快
        _clone2(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        //通用clone方法
        _clone(obj) {
            var o;
            if (typeof obj == "object") {
                if (obj === null) {
                    o = null;
                } else {
                    if (obj instanceof Array) {
                        o = [];
                        for (var i = 0, len = obj.length; i < len; i++) {
                            o.push(this._clone(obj[i]));
                        }
                    } else {
                        o = {};
                        for (var j in obj) {
                            o[j] = this._clone(obj[j]);
                        }
                    }
                }
            } else {
                o = obj;
            }
            return o;
        }

        mNext = 0;

        _srand(seed) {
            this.mNext = seed >>> 0;
        }

        //采用Microsoft的LCG,c代码和javascript代码生成随机序列可以方便的对上
        _rand() {
            this.mNext = (this.mNext * 214013 + 2531011) & 0x7fffffff;
            return (this.mNext >> 16) & 0x7fff;
        }
        run(g) {
            var now = Date.now();
            this._actualTicks++;
            if (this._previousTick + this._tickLengthMs <= now) {
                var delta = now - this._previousTick;
                this._previousTick = now;
                g.scheduleUpdate(delta);
                this._actualTicks = 0;
            }
            //setTimeout(function(){_gameLoop(g);}, _tickLengthMs);
        }
    }
    export const nge = new ngeImp();
}
