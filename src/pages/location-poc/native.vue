<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <navigator url="/pages/my/my" class="text-area">
      <text class="title">{{ title }}</text>
    </navigator>
	<button @click="start">持续定位</button>
	<button @click="stop">停止定位</button>
	<button @click="destory">销毁定位</button>
	<button @click="permission">检测权限</button>
	<text>{{count }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('插件定位')
const count = ref(0)

// #ifdef APP-PLUS
const wxp_Amap = uni.requireNativePlugin("WXP-Amap");
function permission() {
	wxp_Amap.permission(result => {
		console.log(JSON.stringify(result));
	});
}
function start() {
  // 如果出现需要先调用updatePrivacyShow,updatePrivacyAgree提示，需要先调用uni.getLocation({type: 'gcj02'})即可
	console.log("老铁，给点力好不好？");
	// 持续定位
	wxp_Amap.start({  // {} 大括号内参数说明见下方
	    setInterval: 5000, // 定位间隔，单位 ms，不是必须的，默认 2000ms
	    cacheEnable: true // 是否允许缓存，默认为true，既当位置不变时返回最后一次定位的地址，不是必须的
	}, result => {
	    // 处理回调结果
	    // result 为回调结果 见下方 start() 回调结果
		console.log(JSON.stringify(result));
		count.value++;
	})
}
function stop() {
	wxp_Amap.stop(result => console.log(JSON.stringify(result)));
}
function destory() {
	wxp_Amap.destroy();
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
