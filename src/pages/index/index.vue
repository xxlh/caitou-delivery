<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" @tap="aa" />
    <navigator url="/pages/my/my" class="text-area">
      <text class="title">{{ title }}</text>
    </navigator>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello2')
function aa() {
  alert(11)
}

// #ifdef APP-PLUS
// const wxp_Amap = uni.requireNativePlugin("WXP-Amap");
// // 插件内置方法使用
// wxp_Amap.permission(); // 用于申请定位权限，
// // 持续定位
// wxp_Amap.start({  // {} 大括号内参数说明见下方
//     setInterval: 5000, // 定位间隔，单位 ms，不是必须的，默认 2000ms
//     cacheEnable: true // 是否允许缓存，默认为true，既当位置不变时返回最后一次定位的地址，不是必须的
// }, result => {
//     // 处理回调结果
//     // result 为回调结果 见下方 start() 回调结果
//     console.log(JSON.stringify(result));
// })
// #endif

// #ifdef APP-PLUS || H5
let time = setInterval(function() {  
	console.log(0)
    uni.getLocation({ 
        type: 'gcj02',
        success: function(res) {  
            // uni.setStorageSync('userLocation', JSON.stringify(res));  
            console.log(11, res)
            uni.showToast({  
                title: JSON.stringify(res),  
                icon: 'none'  
            }); 
        },  
        fail: function(e) {  
          console.log(22, e);
          
            uni.showToast({  
                title: '获取位置失败',  
                icon: 'none'  
            });  
        },
    });  
}, 3000);  
// #endif
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
