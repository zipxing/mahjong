export class ElsUtils {
    constructor() { }

    /**
     * * 函数描述
     * @param params Object
     *        params.wisper_ming string 悄悄话 明文
     *        params.wisper_an string 悄悄话 暗文
     *        params.heard_url string 玩家头像
     *        params.size size 尺寸
     *        params.bg string 背景图片
     *        params.success function 成功回调
     *        params.fail function 失败回调
     * 流程:
     * 1. 创建离屏canvas
     * 2. 绘制背景
     * 3. 绘制头像
     * 4. 绘制文本
     * 5. 截屏保存到本地
     * 6. 将本地图片保存到相册
     * @author lu ning
     * @date 11:31 2018/7/5
     * @return {Object} 返回值描述
     */
    static createAndSaveImg2WXAlbum(params) {
        // let tmp_canvas = wx.createCanvas();
        // tmp_canvas.height = params.size.height;
        // tmp_canvas.width = params.size.width;
        // let self = this;

        // let tmp_context = tmp_canvas.getContext('2d');
        // //! 绘制背景
        // let bg_img = wx.createImage();
        // let bg_x = 0;
        // let bg_y = 0;
        // let bg_w = params.size.width;
        // let bg_h = params.size.height;

        // bg_img.src = params.bg;
        // bg_img.onload = ()=>{
        //     tmp_context.drawImage(bg_img,bg_x,bg_y,bg_w,bg_h);
        //     //! 绘制head
        //     var h_w = 90;
        //     var h_h = 90;
        //     var user_head_img = wx.createImage();
        //     user_head_img.src = params.user_heard_url;
        //     user_head_img.onload = function() {
        //       var h_x = 240;
        //       var h_y = 260;
        //       tmp_context.save();
        //       tmp_context.translate(70, -50);
        //       tmp_context.rotate(13 * Math.PI / 180);
        //       tmp_context.drawImage(user_head_img, h_x, h_y, h_w, h_h);
        //       tmp_context.restore();
        //       var head_img = wx.createImage();
        //       head_img.src = params.heard_url;
        //       head_img.onload = function() {
        //         var h_x = 129;
        //         var h_y = 229;
        //         tmp_context.drawImage(head_img, h_x, h_y, h_w, h_h);

        //         //! 绘制悄悄话
        //         let str_content = params.wisper_ming;
        //         let f_x = 190;
        //         let f_y = 542;
        //         // tmp_context.save();
        //         // tmp_context.rotate(7 * Math.PI / 180);

        //         tmp_context.fillStyle="#461500";
        //         tmp_context.font = "50px Arial";
        //          tmp_context.fillText(str_content, f_x + 15 , f_y);
        //         str_content = params.wisper_an;
        //         f_y = 680;
        //         tmp_context.font = "50px Arial";
        //         tmp_context.fillText(str_content, f_x + 70 , f_y);
        //         // tmp_context.restore();
        //         //! 截屏,保存到本地
        //         tmp_canvas.toTempFilePath({
        //             x: 0,
        //             y: 0,
        //             width: params.size.width,
        //             height: params.size.height,
        //             destWidth: params.size.width,
        //             destHeight: params.size.height,
        //             fileType: 'png',
        //             quality: 1.0,
        //             success: (res)=>{
        //                 self.saveImage2PhoneByUrl(res.tempFilePath,params.success,params.fail);
        //             },
        //             fail: (res)=>{
        //                 console.log(`createWisperShareImgWithContent failed ${res} .`);
        //                 if(params.fail){
        //                     params.fail();
        //                 }
        //             },
        //         });
        //     };
        // };
        //     };
    }

    static saveImage2PhoneByUrl(url, cb_success, cb_fail) {
        //     let saveImg2Phone = ()=>{
        //         if(!wx.saveImageToPhotosAlbum){
        //             cb_fail();
        //             return;
        //         }

        //         wx.saveImageToPhotosAlbum({
        //             filePath: url,
        //             success: (res)=>{
        //                 cb_success();
        //             },
        //             fail: (res)=>{
        //                 cb_fail();
        //             }
        //         });
        //     };
        //     wx.getSetting({
        //         success: (res)=>{
        //             if (!res.authSetting['scope.writePhotosAlbum']) {
        //                 wx.authorize({
        //                     scope : "scope.writePhotosAlbum",
        //                     success : function () {
        //                         saveImg2Phone();
        //                     },
        //                     fail:function () {
        //                         // wx.showModal({
        //                         //     title: '提示',
        //                         //     content: '这是一个模态弹窗',
        //                         //     success: function(res) {
        //                         //       if (res.confirm) {
        //                         //         console.log('用户点击确定');
        //                         //       } else if (res.cancel) {
        //                         //         console.log('用户点击取消');
        //                         //       }
        //                         //     }
        //                         //   });
        //                         // let button = wx.createOpenSettingButton({
        //                         //     type: 'text',
        //                         //     text: '打开设置页面',
        //                         //     style: {
        //                         //         left: 10,
        //                         //         top: 76,
        //                         //         width: 200,
        //                         //         height: 40,
        //                         //         lineHeight: 40,
        //                         //         backgroundColor: '#ff0000',
        //                         //         color: '#ffffff',
        //                         //         textAlign: 'center',
        //                         //         fontSize: 16,
        //                         //         borderRadius: 4
        //                         //     }
        //                         // });
        //                         // button.onTap((res)=>{
        //                         //     button.destroy();
        //                         //     console.log('button click callback ',res);
        //                         // });

        //                         if(wx.openSetting){
        //                             wx.openSetting({
        //                                 success: (res)=>{
        //                                     console.log('success',res);
        //                                     if(res.authSetting['scope.writePhotosAlbum']){
        //                                         saveImg2Phone();
        //                                     }
        //                                     else{
        //                                         cb_fail();
        //                                     }
        //                                 },
        //                                 fail: (res)=>{
        //                                     console.log('fail',res);
        //                                     cb_fail();
        //                                 }
        //                             });
        //                         }
        //                         else{
        //                             cb_fail();
        //                         }
        //                     },
        //                     complete:function () {
        //                     }
        //                 });
        //             }
        //             else{
        //                 saveImg2Phone();
        //             }
        //         },
        //         fail: (res)=>{
        //             cb_fail();
        //         }
        //     });
    }
}

