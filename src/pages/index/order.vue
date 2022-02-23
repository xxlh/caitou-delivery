<template>
	<view v-if="list.length" class="content">
		<uni-card class="order-card" v-for="item in list" :key="item.id" title="基础卡片" extra="额外信息">
			<text>这是一个基础卡片示例，此示例展示了一个标题加标题额外信息的标准卡片。</text>
			<view class="actions">
				<button type="primary" size="mini" @tap="toOrderDetail">送达</button>
				<button type="primary" size="mini" plain="true" @tap="aa">原生</button>
			</view>
		</uni-card>
	</view>
	<view v-else mode="order" icon="http://cdn.uviewui.com/uview/empty/car.png">
		<uni-icons type="paperplane" size="30"></uni-icons>
		<uni-badge text="2" type="success" @click="bindClick"></uni-badge>
		<text>目前没有配送单</text>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
const title = ref('Hello2')
const list = reactive([{
	id: 1,
	title: "asf",
}])
function toOrderDetail() {
	uni.navigateTo({url: "/pages/index/index"});
}
function aa() {
	uni.navigateTo({url: "/pages/index/native"});
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
