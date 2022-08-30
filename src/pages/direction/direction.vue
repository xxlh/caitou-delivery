<template>
	<view v-if="directions.data.length" class="page">
		<view class="uni-padding-wrap uni-common-mt" style="width: 60%">
			<uni-segmented-control :current="currentTab" :values="['按超时', '按距离']" @clickItem="switchTab" />
		</view>
		<view v-for="direction in directions.data" :key="direction.id">
			<!-- 仓储点 -->
			<uni-card v-if="direction.type == 'store'" class="deal-card" :title="'取货: '+direction.packing.name" :extra="direction.distance ? `距离 ${direction.distance} 米` : ''" @tap="goto(`/pages/direction/packing-detail?id=${direction.store_id}`)">
				<template v-slot:title v-if="moment(direction.expect_delivery_latest) < moment() && currentTab === 0">
					<view class="deal-title">
						<text>取货: {{direction.packing.name}}</text>
						<view class="extra">
							<uni-icons type="warning" size="20"></uni-icons> <text>超时: </text>{{moment(direction.expect_delivery_latest).fromNow()}}
						</view>
					</view>
				</template>
				<template v-slot:title v-else-if="currentTab === 0">
					<view class="deal-title">
						<text>取货: {{direction.packing.name}}</text>
						<view class="extra">{{moment(direction.expect_delivery_latest)>moment() ? '还剩: '+moment(direction.expect_delivery_latest).fromNow() : '超时: '+moment(direction.expect_delivery_latest).fromNow()}}</view>
					</view>
				</template>
				<view class="deal-content">
					<view class="deal-info">
						<view v-for="deal in direction.deals" style="display:flex">
							<view class="info-status" style="width: 50upx"></view>
							<text style="width: 60upx; overflow:hidden; white-space: nowrap;">#{{deal.id}}</text>：{{deal.items.map(item => item.title.substr(0,6)).join(',').substr(0,30)}}...
						</view>
					</view>
					<view>
						<button type="primary" plain @click="fetch(direction)">取</button>
					</view>
				</view>
			</uni-card>
			<!-- 目的地 -->
			<uni-card v-if="direction.type == 'destination'" class="deal-card" :title="'#'+direction.deal_id+': '+direction.address.address" :extra="direction.distance ? `距离 ${direction.distance} 米` : ''" @tap="goto(`/pages/index/deal-detail?id=${direction.deal_id}`)">
				<template v-slot:title v-if="moment(direction.expect_delivery_latest) < moment() && currentTab === 0">
					<view class="deal-title">
						<text>#{{direction.deal_id}}: {{direction.address.address}}</text>
						<view class="extra">
							<uni-icons type="warning" size="20"></uni-icons> <text>超时: </text>{{moment(direction.expect_delivery_latest).fromNow()}}
						</view>
					</view>
				</template>
				<template v-slot:title v-else-if="currentTab === 0">
					<view class="deal-title">
						<text>#{{direction.deal_id}}: {{direction.address.address}}</text>
						<view class="extra">{{moment(direction.expect_delivery_latest)>moment() ? '还剩: '+moment(direction.expect_delivery_latest).fromNow() : '超时: '+moment(direction.expect_delivery_latest).fromNow()}}</view>
					</view>
				</template>
				<view class="deal-content">
					<view class="deal-info">
						<view v-for="packing in direction.deal.packings" style="display:flex">
							<view class="info-status" style="width: 50upx">
								<icon v-if="packing.man_status == 'fetched'" type="success" size="20"></icon>
								<icon v-else type="cancel" size="20"></icon>
							</view>
							<text style="width: 60upx; overflow:hidden; white-space: nowrap;">{{packing.name}}</text>：{{packing.items.map(item => item.title.substr(0,6)).join(',').substr(0,30)}}...
						</view>
					</view>
					<view>
						<button type="primary" plain :disabled="!direction.deal.packings.reduce((t,c) => t * (c.man_status == 'fetched'), true)" @click="delivered(direction)">送</button>
					</view>
				</view>
			</uni-card>
		</view>
		<uni-popup ref="fetchPopup" type="dialog">
			<uni-popup-dialog type="warn" cancelText="等等先核对" confirmText="取货" title="确认所取货单" @confirm="fetched" @close="stopGoto=false; goto(`/pages/direction/packing-detail?id=${fetchDirection.data.store_id}`)">
				<checkbox-group @change="fetchCheck">
					<view v-for="deal in fetchDirection.data.deals">
						<!-- Todo: 根据是否已打包好状态来默认选中，但仓储打包标记功能未建立 -->
						<label class="radio"><checkbox :value="deal.id" checked />#{{deal.id}}：{{deal.items.map(item => item.title.substr(0,6)).join(',').substr(0,30)}}...</label>
					</view>
					<view style="color: #999; font-size: 28upx; margin-top: 30upx;">请确认订单中的每个商品及数量，被客户发现数量错误将承担责任！</view>
				</checkbox-group>
			</uni-popup-dialog>
		</uni-popup>
	</view>
	<view v-else-if="isLoading" class="loading">
		<image src="@/static/img/loading.gif"></image>
	</view>
	<view v-else-if="!store.getters.isLogin" mode="order" class="empty" @tap="goto('/pages/my/login')">
		<image src="@/static/img/noorder.png"></image>
		<text>请先登陆！</text>
	</view>
	<view v-else mode="order" class="empty">
		<image src="@/static/img/noorder.png"></image>
		<text>目前没有配送单</text>
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
let directions = reactive({data:[], dataByDue:[], dataByDistance:[]})
let fetchDirection = reactive({data:[]})
let fetchCheckedIds = reactive({data:[]})
const isLoading = ref(true)
const currentTab = ref(0)
const fetchPopup = ref(null)
const rejectPopup = ref(null)
const stopGoto = ref(false)

onMounted(() => {
	if (store.getters.isLogin) {
		setTimeout(() => {
			uni.startPullDownRefresh({});
		}, 1);
	} else isLoading.value = false
})

onPullDownRefresh(async () => {
	isLoading.value = true;
	if (currentTab.value == 0) {
		directions.dataByDue = (await get(`auth/directions?lng=${store.state.currentLocation.lng}&lat=${store.state.currentLocation.lat}`)).data;
		directions.data = directions.dataByDue;
	} else if (currentTab.value == 1) {
		directions.dataByDistance = (await get(`auth/directions?sort=distance&lng=${store.state.currentLocation.lng}&lat=${store.state.currentLocation.lat}`)).data;
		directions.data = directions.dataByDistance;
	}
	uni.stopPullDownRefresh();
	isLoading.value = false;
})

const switchTab = async (e:any) => {
	if (currentTab.value === e.currentIndex) return;
	currentTab.value = e.currentIndex

	if (currentTab.value == 0) {
		directions.data = directions.dataByDue;
		if (directions.dataByDue.length) return;
		uni.startPullDownRefresh({});
	} else if (currentTab.value == 1) {
		directions.data = directions.dataByDistance;
		if (directions.dataByDistance.length) return;
		uni.startPullDownRefresh({});
	}
}

const goto = (url:string) => {
	if (stopGoto.value) return;
	uni.navigateTo({url})
}

/* 配送单操作 */
const fetch = async (direction) => {
	stopGoto.value = true
	fetchDirection.data = direction;
	fetchCheckedIds.data = direction.deals.map(deal => deal.id);
	fetchPopup.value.open();
}
const fetched = async () => {
	let fetchPromises = fetchCheckedIds.data.map(id => (async () => await post(`deals/${id}/stores/${fetchDirection.data.store_id}/fetched`))());
	if (fetchPromises.length) Promise.all(fetchPromises).then(dataArr => {
		uni.showToast({title: '已取货', icon: 'success'})
		uni.startPullDownRefresh({});
	});
	stopGoto.value = false
}
const fetchCheck = e => {
	fetchCheckedIds.data = e.detail.value
}

const delivered = direction => {
	stopGoto.value = true
	uni.showModal({
		title: '确认已经送达客户手上',
		content: '(除非客户同意放某处)\n注意：提前结单会影响绩效！',
		confirmText: '确认送达',
		success: res => {
			if (res.confirm) {
				post(`deals/${direction.deal_id}/delivered`).then(() => {
					uni.showToast({title: '已送达', icon: 'success'})
					uni.startPullDownRefresh({});
				})
			}
		},
		complete: () => {
			stopGoto.value = false
		},
	})
}

</script>


<style lang="scss">
.page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #fafafa;
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
	.deal-content {
		display: flex;
		justify-content: space-between;
		.deal-info {
			.info-status {
				width: 20upx;
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
