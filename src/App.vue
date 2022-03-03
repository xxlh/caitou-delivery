<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import Tracking from '@/common/tracking'
import {get, post, request} from '@/common/request';
import { computed } from "vue";
import { useStore } from 'vuex'

const store = useStore()
let isLogin = computed(() => {
	return store.state._token && store.state._userinfo;
})

onLaunch(() => {
  console.log("App Launch");

	if (isLogin.value) {
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
