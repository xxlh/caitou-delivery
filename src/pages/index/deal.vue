<template>
	<view v-if="deals.length" class="content">
		<uni-swipe-action>
			<uni-swipe-action-item v-for="deal in deals" :key="deal.id" :right-options="itemActions" @click="actionClick(item)">
				<uni-card class="deal-card" :title="'送往: '+deal.address.address" :extra="moment(deal.expect_delivery_earliest)>moment() ? '还剩: '+moment(deal.expect_delivery_earliest).fromNow() : '超时: '+moment(deal.expect_delivery_earliest).fromNow()" @tap="goto(`deal-detail?id=${deal.id}`)">
					<template v-slot:title v-if="moment(deal.expect_delivery_earliest) < moment()">
						<view class="deal-title">
							<text>送往: {{deal.address.address}}</text>
							<view class="extra">
								<uni-icons type="warning" size="20"></uni-icons> <text>超时: </text>{{moment(deal.expect_delivery_earliest).fromNow()}}
							</view>
						</view>
					</template>
					<view>下单时间：{{moment(deal.created_at).format('YYYY-MM-DD HH:mm:ss')}}</view>
					<view>期望送达：{{moment(deal.expect_delivery_earliest).format('YYYY-MM-DD HH:mm:ss')}}</view>
					<scroll-view class="items-preview" scroll-x>
						<image v-for="item in deal.items" :key="item.product_id+item.sku_name" :src="item.image" :title="item.title" mode="aspectFill" />
					</scroll-view>
				</uni-card>
			</uni-swipe-action-item>
		</uni-swipe-action>
		<navigator v-if="!props.history" url="deal-history" class="history-entry">
			<text>查看历史配送单</text>
		</navigator>
	</view>
	<view v-else-if="isLoading" class="loading">
		<image src="@/static/img/loading.gif"></image>
	</view>
	<view v-else-if="!isLogin" mode="order" class="empty">
		<image src="@/static/img/noorder.png"></image>
		<text>请先登陆！</text>
	</view>
	<view v-else mode="order" class="empty">
		<image src="@/static/img/noorder.png"></image>
		<text>目前没有配送单</text>
		<navigator v-if="!props.history" url="deal-history" class="history-entry">
			<text>查看历史配送单</text>
		</navigator>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useStore, mapState } from 'vuex'
import {get, post, request} from '@/common/request';
import Tracking from '@/common/tracking'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import moment from 'moment/min/moment-with-locales'
moment.locale('zh-cn');

const store = useStore()
const deals = reactive([])
const isLoading = ref(true)
const props = defineProps({
	history: Boolean,
})

let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})

if (isLogin.value && !props.history) {
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

onShow(() => {
	if (isLogin.value) {
		uni.startPullDownRefresh({});
	}
})

onPullDownRefresh(async () => {
	isLoading.value = true;
	const res = await get('auth/deals' + (props.history?'?is_history=1':''));
	deals.length = 0;
	deals.push(...res.data);
	uni.stopPullDownRefresh();
	isLoading.value = false;
})

const goto = (url:string) => {
	uni.navigateTo({url})
}

/* 配送单操作 */
const itemActions = [{
	text: '转单',
	style: {
		backgroundColor: 'orange'
	}
}];
const actionClick = (item) => {
	uni.showModal({
		title: "转单功能尚未支持",
		showCancel: false,
	});
}

</script>

<style lang="scss">
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.deal-card {
	width: 90vw;
	.deal-title {
		display: flex;
		justify-content: space-between;
		padding: 20upx;
		color: #3a3a3a;
		border-bottom: 1px #EBEEF5 solid;
		.extra {
			font-size: 28upx;
			color: #999;
			text {
				color: red;
			}
		}
	}
	.actions {
		display: flex;
	}
	.items-preview {
		width: 100%;
		white-space: nowrap;
		image {
			display: inline-block;
			margin: 10upx;
			width: 100upx;
			height: 100upx;
		}
	}
}

.history-entry {
	margin-top: 30upx;
	text {
		color: #999;
	}
}
</style>
