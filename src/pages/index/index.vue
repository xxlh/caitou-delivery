<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" @tap="aa" />
    <navigator url="/pages/my/my" class="text-area">
      <text class="title">{{ title }}</text>
    </navigator>
	<button @click="getLocation">获取定位</button>
	<button @click="permission">检测权限</button>
	<text>{{count }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('uni定位')

// #ifdef H5 || APP-PLUS
// let time = setInterval(function() {  
// 	console.log(0)
function getLocation() {
    uni.getLocation({ 
        // type: 'gcj02',
        type: 'wgs84',
        geocode: true,
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
}
// }, 3000);  
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
