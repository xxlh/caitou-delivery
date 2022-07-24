<template>
	<view v-if="deals.length" class="content">
		<uni-card v-for="forward in forwards" :key="forward.id" class="deal-card" :title="'送往: '+forward.deal.address.address" :extra="moment(forward.deal.expect_delivery_earliest)>moment() ? '还剩: '+moment(forward.deal.expect_delivery_earliest).fromNow() : '超时: '+moment(forward.deal.expect_delivery_earliest).fromNow()" @tap="goto(`deal-detail?id=${forward.deal.id}`)">
			<template v-slot:title v-if="moment(forward.deal.expect_delivery_earliest) < moment()">
				<view class="deal-title">
					<text>送往: {{forward.deal.address.address}}</text>
					<view class="extra">
						<uni-icons type="warning" size="20"></uni-icons> <text>超时: </text>{{moment(forward.deal.expect_delivery_earliest).fromNow()}}
					</view>
				</view>
			</template>
			<view>下单时间：{{moment(forward.deal.created_at).format('YYYY-MM-DD HH:mm:ss')}}</view>
			<view>期望送达：{{moment(forward.deal.expect_delivery_earliest).format('YYYY-MM-DD HH:mm:ss')}}</view>
			<scroll-view class="items-preview" scroll-x>
				<image v-for="item in forward.deal.items" :key="item.product_id+item.sku_name" :src="item.image" :title="item.title" mode="aspectFill" />
			</scroll-view>
			<template v-slot:actions>
				<view style="display: flex; padding: 15rpx 0">
					<button type="primary" size="mini" plain @click="accept(forward)" style="width: 40%">接单</button>
					<button type="warn" size="mini" plain @click="reject(forward)" style="width: 40%">谢绝</button>
				</view>
				<uni-notice-bar v-if="forward.remark" show-icon :text="forward.remark" />
			</template>
		</uni-card>
		<uni-swipe-action>
			<uni-swipe-action-item v-for="deal in deals" :key="deal.id" :right-options="itemActions" @click="actionClick($event, deal.id)">
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
					<template v-slot:actions>
						<uni-notice-bar v-if="deal.waiting_forward" show-icon text="已向骑友发出转单邀请，等待回复~" />
						<uni-notice-bar v-if="deal.rejected_forward" show-icon :text="`骑友 ${deal.rejected_forward.to_man.name} 拒绝了你的转单请求！`" :show-get-more="!!deal.rejected_forward.reject_reason" @getmore="showRejectReason(deal.rejected_forward.reject_reason)" />
						<uni-notice-bar v-if="deal.accepted_forward" :text="`骑友 ${deal.accepted_forward.from_man.name} 贡献的单子`" />
					</template>
				</uni-card>
			</uni-swipe-action-item>
		</uni-swipe-action>
		<navigator v-if="!props.history" url="deal-history" class="history-entry">
			<text>查看历史配送单</text>
		</navigator>
		<uni-popup ref="forwardPopup" type="dialog">
			<uni-popup-dialog type="warn" cancelText="取消" confirmText="转单" title="转单给骑友" content="欢迎使用 uni-popup!" @confirm="forwardDeal">
				<picker v-if="store.state.$men_nearby" :range="store.state.$men_nearby" range-key="name" @change="e => manIndex = e.detail.value">
					<view class="uni-input">{{store.state.$men_nearby[manIndex].name}}</view>
				</picker>
				<text v-else>加载附近的骑友ing..</text>
			</uni-popup-dialog>
		</uni-popup>
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
	<uni-popup ref="rejectPopup" type="dialog">
		<uni-popup-dialog ref="inputClose" mode="input" title="拒绝此转单" placeholder="输入拒绝原因" confirmText="拒绝" @confirm="confirmRejection"></uni-popup-dialog>
	</uni-popup>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useStore, mapState } from 'vuex'
import {get, post, request} from '@/common/request';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import moment from 'moment/min/moment-with-locales'
moment.locale('zh-cn');

const store = useStore()
let deals = reactive([])
let forwards = reactive([])
const isLoading = ref(false)
const forwardDealId = ref(0)
const forwardPopup = ref(null)
const rejectPopup = ref(null)
const manIndex = ref(0)
let men = reactive([])
const stopGoto = ref(false)
const props = defineProps({
	history: Boolean,
})

let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})

onShow(() => {
	if (isLogin.value) {
		uni.startPullDownRefresh({});
	}
})

onPullDownRefresh(async () => {
	isLoading.value = true;
	const res = await get('auth/deals' + (props.history?'?is_history=1':''));
	uni.stopPullDownRefresh();
	deals.length = 0;
	deals.push(...res.data);
	if (props.history) return isLoading.value = false;

	const forward = await get('forwards');
	forwards.length = 0;
	forwards.push(...forward.data);
	isLoading.value = false;
})

const goto = (url:string) => {
	if (stopGoto.value) return;
	uni.navigateTo({url})
}

/* 配送单操作 */
const itemActions = [{
	text: '转单',
	style: {
		backgroundColor: 'orange'
	}
}];
const actionClick = async (e, id) => {
	if (e.text = '转单') {
		forwardDealId.value = id;
		forwardPopup.value.open();
	}
}
const forwardDeal = async () => {
	if (!forwardDealId.value) return;
	if (!store.state.$men_nearby || !store.state.$men_nearby[manIndex.value]) return;
	const forwardManId = store.state.$men_nearby[manIndex.value].id
	post(`deals/${forwardDealId.value}/forward`, {to_man_id: forwardManId}).then(() => {
		uni.showToast({title: '已发出请求  等待对方接受..', icon: 'success'});
	})
}
const showRejectReason = reason => {
	stopGoto.value = true
	uni.showModal({title: reason, showCancel:false, complete: () => {
		stopGoto.value = false
	}})
}
const accept = async forward => {
	stopGoto.value = true
	await post(`forwards/${forward.id}/accept`)
	uni.showToast({title: '已成功接受转单', icon: 'success'});
	uni.startPullDownRefresh({});
}
const reject = async forward => {
	stopGoto.value = true
	let reason = await getRejectConfirmation()
	await post(`forwards/${forward.id}/reject`, {reason})
	uni.showToast({title: '已拒绝此转单！', icon: 'error'});
	uni.startPullDownRefresh({});
}

const getRejectConfirmation = () => new Promise((resolve, reject) => {
	confirmRejection.value = reason => resolve(reason)
	rejectPopup.value.open()
})
let confirmRejection = ref(reason => {})

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
