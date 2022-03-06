<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import Tracking from '@/common/tracking'
import permision from "@/common/permission.js"
import {get, post, request} from '@/common/request';
import { computed } from "vue";
import { useStore } from 'vuex'

const store = useStore()
let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})

onLaunch(() => {
  console.log("App Launch");

	/* 推送消息处理 */
	// #ifdef APP-PLUS
	// 推送消息点击响应
	plus.push.addEventListener(
		'click',
		function(msg) {
			console.log(msg);
			uni.showModal({
				title: msg.title,
				content: msg.content,
				showCancel: false,
			})
		},
		false
	);
	// 透传消息接收响应
	plus.push.addEventListener(
		'receive',
		function(msg) {
			console.log(msg);
			uni.showModal({
				title: '^_^ ' + msg.title,
				content: msg.content,
				showCancel: false,
			})
		},
		false
	);
	// #endif

	/* 追踪实时定位 */
	if (isLogin.value) {
		let cid = '';
		// #ifdef APP-PLUS
		cid = plus.push.getClientInfo().clientid; //客户端标识
		// 权限判断, Deprecated: 交给获取不到位置的错误弹窗
		// (async () => {
		// 	if (await permision.requestAndroidPermission('android.permission.ACCESS_FINE_LOCATION') != 1) permision.gotoAppPermissionSetting();
		// })()
		// #endif
		console.log('cid: ' + cid);
		const tracking = new Tracking({
			interval: 300,
			onChange(res) {
				request({
					url: 'auth/location',
					data: {...res, cid},
					method: 'patch',
				});
			}
		});
		tracking.init();
	}
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
// @import "uview-ui/index.scss";

.loading{
	width: 100vw;
	height: 100vh;
	background-color: #f6f6f6;
	image {
		width: 100%;
	}
}

.empty{
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
