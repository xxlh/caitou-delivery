<template>
	<view v-if="deals.length" class="content">
		<uni-card class="order-card" v-for="item in list" :key="item.id" title="基础卡片" extra="额外信息">
			<text>这是一个基础卡片示例，此示例展示了一个标题加标题额外信息的标准卡片。</text>
			<view class="actions">
				<button type="primary" size="mini" @tap="toOrderDetail">送达</button>
				<button type="primary" size="mini" plain="true" @tap="aa">原生</button>
			</view>
		</uni-card>
	</view>
	<view v-else-if="!isLogin" mode="order" icon="http://cdn.uviewui.com/uview/empty/car.png">
		<uni-icons type="paperplane" size="30"></uni-icons>
		<uni-badge text="2" type="success" @click="bindClick"></uni-badge>
		<text>请先登陆！</text>
	</view>
	<view v-else mode="order" icon="http://cdn.uviewui.com/uview/empty/car.png">
		<uni-icons type="paperplane" size="30"></uni-icons>
		<uni-badge text="2" type="success" @click="bindClick"></uni-badge>
		<text>目前没有配送单</text>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useStore, mapState } from 'vuex'
import {get, post, request} from '@/common/request';
import Tracking from '@/common/tracking'
import { onPullDownRefresh } from '@dcloudio/uni-app';
const store = useStore()
const deals = reactive([])

let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})

if (isLogin.value) {
	uni.startPullDownRefresh({});

	// 追踪实时定位
	const tracking = new Tracking({
		interval: 300,
		onChange(res) {
			request({
				url: 'auth/location',
				data: res,
				method: 'patch',
			});
		}
	});
	tracking.init();
}

onPullDownRefresh(async () => {
	const res = await get('auth/deals');
	console.log(res);
	
	deals.values = res.data;
	uni.stopPullDownRefresh();
})

function toOrderDetail() {
	uni.navigateTo({url: "/pages/location-poc/web"});
}
function aa() {
	uni.navigateTo({url: "/pages/location-poc/native"});
}

</script>

<style lang="scss">
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.order-card {
	.actions {
		display: flex;
	}
}

</style>
