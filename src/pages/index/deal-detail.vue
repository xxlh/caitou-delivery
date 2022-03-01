<template>
	<view v-if="deal.data.packings" class="page">
		<!-- 取货点 -->
		<uni-card class="packing" v-for="packing in deal.data.packings" :key="packing.id" :title="'取货: '+packing.name" extra="导航前往">
			<template v-slot:title>
				<view class="packing-title">
					<text>取货点: {{packing.name}}</text>
					<view class="extra" @tap="openMap(packing.store.longitude, packing.store.latitude)" v-if="packing.store.longitude && packing.store.latitude">
						<uni-icons type="navigate" size="20"></uni-icons> 导航前往
					</view>
				</view>
			</template>
			<view class="actions">
				<button type="primary" size="mini" :disabled="packing.man_status!='pending'" :plain="packing.man_status!='pending'" @tap="arrived(packing.store_id)">已到店</button>
				<button type="primary" size="mini" :disabled="packing.man_status=='fetched'" :plain="packing.man_status!='arrived'" @tap="fetched(packing.store_id)">已取货</button>
			</view>
			<uni-swipe-action>
				<uni-swipe-action-item class="items" v-for="item in deal.data.items.slice(0,3)" :key="item.id" :right-options="itemActions" @click="actionClick(item)">
					<view class="item-title">{{item.title}}</view>
					<view class="item-info">
						<view class="item-sku">{{item.sku_name}}</view>
						<view>{{item.count}}</view>
					</view>
				</uni-swipe-action-item>
				<uni-collapse v-if="deal.data.items.length > 3">
					<uni-collapse-item title-border="none" :border="false">
						<template v-slot:title>
							<text class="more">展开更多商品...</text>
						</template>
						<uni-swipe-action-item class="items" v-for="item in deal.data.items.slice(3)" :key="item.id" :right-options="itemActions" @click="actionClick(item)">
							<view class="item-title">{{item.title}}</view>
							<view class="item-info">
								<view class="item-sku">{{item.sku_name}}</view>
								<view>{{item.count}}</view>
							</view>
						</uni-swipe-action-item>
					</uni-collapse-item>
				</uni-collapse>
			</uni-swipe-action>
		</uni-card>
		<!-- 送达点 -->
		<view class="destination" :class="isAllFetched?'focus':''">
			<view style="display:flex; justify-content:space-between;">
				<view class="address" @tap="openMap(deal.data.address.longitude, deal.data.address.latitude)">
					<image src="@/static/img/addricon.png" mode="aspectFit"></image>
					<view>
						<view class="tel-name">
							<view class="name">
								{{deal.data.address.contact_name}}
							</view>
							<view class="tel">
								{{deal.data.address.contact_phone}}
							</view>
						</view>
						<view class="addres">{{deal.data.address.address}}</view>
					</view>
				</view>
				<view>
					<uni-icons type="phone" size="40" style="color:#007aff" v-if="deal.data.address.contact_phone" @tap="makeCall(deal.data.address.contact_phone)"></uni-icons>
					<uni-icons type="navigate" size="40" style="color:#007aff" v-if="deal.data.address.longitude && deal.data.address.latitude" @tap="openMap(deal.data.address.longitude, deal.data.address.latitude)"></uni-icons>
				</view>
			</view>
			<button v-if="deal.data.man_status!='delivered'" type="primary" :disabled="!isAllFetched" @tap="delivered">确认送达</button>
			<button v-else type="primary" disabled plain>已送达</button>
		</view>
	</view>
	<view v-else-if="isLoading" class="loading">
		<image src="@/static/img/loading.gif"></image>
	</view>
	<view v-else class="onorder">
		<image src="@/static/img/noorder.png"></image>
		<text>找不到配货点! 请联系客服~</text>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useStore, mapState } from 'vuex'
import {get, post, request} from '@/common/request';
import { onLoad } from '@dcloudio/uni-app';
import _ from 'lodash';

const store = useStore()
const deal = reactive({data: {}})
const isLoading = ref(true)

let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})
let isAllFetched = computed(() => {
	return _.every(deal.data.packings, {'man_status': 'fetched'});
})

onLoad(async (params) => {
	if (!params.id) return;
	isLoading.value = true;
	deal.data = await get('deals/' + params.id);
	isLoading.value = false;
})

/* 拨打电话 */
const makeCall = (phone:string) => {
	// #ifndef APP-PLUS
	uni.makePhoneCall({phoneNumber: phone})
	// #endif
	// #ifdef APP-PLUS
	plus.device.dial(phone,false);
	// #endif
}
/* 打开导航 */
const openMap = (lng:number, lat:number) => {
	if (!lng || !lat) return;
	uni.openLocation({
		latitude: lat,
		longitude: lng,
		fail: function (e) {
			uni.showToast({title: e.message})
		}
	});
}

/* 订单状态操作 */
const arrived = (store_id:number) => {
	post(`deals/${deal.data.id}/stores/${store_id}/arrived`).then(() => {
		deal.data.packings.forEach((packing, i) => {
			if (packing.store_id == store_id) deal.data.packings[i].man_status = 'arrived';
		});
	});
}
const fetched = (store_id:number) => {
	post(`deals/${deal.data.id}/stores/${store_id}/fetched`).then(() => {
		deal.data.packings.forEach((packing, i) => {
			if (packing.store_id == store_id) deal.data.packings[i].man_status = 'fetched';
		});
	});
}
const delivered = () => {
	post(`deals/${deal.data.id}/delivered`).then(() => {
		deal.data.man_status = 'delivered';
		deal.data.status = 'delivered';
	});
}

/* 商品操作 */
const itemActions = [{
	text: '退款',
	style: {
		backgroundColor: '#dd524d'
	}
}];
const actionClick = (item) => {
	uni.showModal({
		title: "退款功能尚未支持",
		showCancel: false,
	});
}

</script>

<style lang="scss">
.page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #eee;
}
.packing {
	width: 90%;
	.packing-title {
		display: flex;
		justify-content: space-between;
		padding: 20upx;
		color: #3a3a3a;
		border-bottom: 1px #EBEEF5 solid;
		.extra {
			font-size: 28upx;
			color: #999;
		}
	}
	.actions {
		display: flex;
	}
	.items {
		display: flex;
		flex-direction: column;
		border-bottom: 3upx dashed #ccc;
		.item-title {
			font-size: 36upx;
		}
		.item-info {
			font-size: 24upx;
			display: flex;
			justify-content: space-between;
			view {
				margin: 8upx 30upx;
				padding: 2upx 10upx;
			}
		}
		.item-sku {
			background-color: #ddd;
			border-radius: 10upx;
		}
	}
	.more {
		display: block;
		text-align: center;
		padding: 5upx 0;
	}
}

.destination {
	width: 90%;
	padding: 20upx 3%;
	margin: 30upx auto 20upx auto;
	box-shadow: 0upx 5upx 20upx rgba(0,0,0,0.1);
	border-radius: 20upx;
	&.focus {
		position: fixed;
		bottom: 0;
	}
	.address{
		display: flex;
		align-items: center;
		image{
			width: 60upx;
			height: 60upx;
			margin: 20upx;
		}
		.tel-name{
			width: 100%;
			display: flex;
			font-size: 32upx;
			.tel{
				margin-left: 40upx;
			}
		}
		.addres{
			width: 100%;
			font-size: 26upx;
			color: #999;
		}
		uni-icons {
			padding: 10upx;
		}
	}
}

.onorder{
	width: 100%;
	height: 50vw;
	display: flex;
	justify-content: center;
	align-content: center;
	flex-wrap: wrap;
	image{
		width: 20vw;
		height: 20vw;
		border-radius: 100%;
	}
	text{
		width: 100%;
		height: 60upx;
		font-size: 28upx;
		color: #444;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

</style>
