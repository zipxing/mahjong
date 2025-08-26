export abstract class Singleton {

    static getInstance<T extends {}>(this: new () => T): T {
        if(!(<any>this).instance){
            (<any>this).instance = new this();
        }
        return (<any>this).instance;
    }

    /**
     * 实例化单例调用
     */
    public abstract Init();
   
    /**
     * 卸载单例调用
     */
    public abstract UnInit();
   
}