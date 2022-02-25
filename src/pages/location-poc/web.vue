<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" @tap="aa" />
    <navigator url="/pages/my/my" class="text-area">
      <text class="title">{{ title }}</text>
    </navigator>
	<button @click="getLocation('gcj02')">获取gcj02定位</button>
	<button @click="getLocation('wgs84')">获取wgs84定位</button>
	<button @click="clearGetLocation">停止定位</button>
	<text>{{count }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('uni定位')
const count = ref(0)
const timer = ref(0)

function aa() {
  console.log(count.value);
  count.value+=10
  alert(11)
}
function getLocation(type:string) {
// #ifdef H5 || APP-PLUS
  timer.value = setInterval(function() {  
    console.log(0)
    uni.getLocation({ 
        // type: 'gcj02',  // 不知道为什么，先调用这个，Amap插件就可以正常运作
        // type: 'wgs84',
        type: type || 'gcj02',
        geocode: true,
        success: function(res) {  
            // uni.setStorageSync('userLocation', JSON.stringify(res));  
            console.log(11, res)
            uni.showToast({  
                title: JSON.stringify(res),  
                icon: 'none'  
            }); 
            count.value++;
        },  
        fail: function(e) {  
          console.log(22, e);
          
            uni.showToast({  
                title: '获取位置失败',  
                icon: 'none'  
            });  
        },
    });  
  }, 5000);  
}
function clearGetLocation() {
  clearInterval(timer.value);
}
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
