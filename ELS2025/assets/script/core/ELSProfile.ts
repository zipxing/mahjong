/*
 * @Date: 2023-08-25 10:23:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-08-28 16:06:31
 */
/**
 * 管理俄罗斯方块本地存储数据
 * create by luning.
 */
export class ELSProfile {
    keyvalues: {};
    static _instance: ELSProfile;
    public static KEYS = {
        MUSIC_MUTE: "music_mute", //! 是否静音
        BLOCK_IDX: "block_idx", //! 皮肤id
        SHARE_TIME_STAMP: "share_time_stamp", //! 群分享时间戳
    };
    constructor() {
        this.keyvalues = {};

        this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE] = false;
        this.keyvalues[ELSProfile.KEYS.BLOCK_IDX] = 0;
        this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP] = 0;
    }
    static getInstance() {
        if (!ELSProfile._instance) {
            ELSProfile._instance = new ELSProfile();
            ELSProfile._instance.load();
        }
        return ELSProfile._instance;
    }

    load() {
        console.log("Profile load start");
        //this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE] = wx.getStorageSync(ELSProfile.KEYS.MUSIC_MUTE);
        if (this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE] === "") {
            this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE] = false;
        }

        //this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP] = wx.getStorageSync(ELSProfile.KEYS.SHARE_TIME_STAMP);
        if (this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP] === "") {
            this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP] = this.currentTimeMillis();
        }
        console.log(
            this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP],
            typeof this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP]
        );
        console.log("Profile load end");
        this.save();
    }

    save() {
        // for(var key in this.keyvalues){
        //     wx.setStorage({
        //         key: key,
        //         data: this.keyvalues[key]
        //     });
        // }
    }

    getValueByKey(key) {
        return this.keyvalues[key];
    }
    setValueByKey(key, value) {
        this.keyvalues[key] = value;
        this.save();
    }

    getIsMusicMute() {
        return this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE];
    }
    setIsMusicMute(is_mute) {
        this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE] = is_mute;

        this.save();
    }
    switchMusicMute() {
        this.setIsMusicMute(!this.keyvalues[ELSProfile.KEYS.MUSIC_MUTE]);
    }

    setShareTimeStamp() {
        this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP] = this.currentTimeMillis();
        this.save();
    }
    getLastShareTimeStamp() {
        return this.keyvalues[ELSProfile.KEYS.SHARE_TIME_STAMP];
    }

    isShowRank() {
        let min_wait = 28800000; // 8 * 60 * 60 * 1000
        if (this.currentTimeMillis() - this.getValueByKey(ELSProfile.KEYS.SHARE_TIME_STAMP) >= min_wait) {
            return true;
        }
        return false;
    }

    currentTimeMillis() {
        let ret = 0;
        let date = new Date();
        ret = date.getTime();
        return ret;
    }
}
