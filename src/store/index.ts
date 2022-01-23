import { createStore } from 'vuex'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'
import {get, post, request} from '@/common/request';

const store = createStore({
	state,
	mutations,
    getters,
	actions
})

// 扩展自动过期state  Todo: 封装到插件
let stateSet = (target:any, key:string, value:any) => {
	if (key.substr(0,1) !== '$') return Reflect.set(target, key, value);

	try {
		uni.setStorageSync(key, value);

		let stateExpires = uni.getStorageSync('stateExpires') || {};
		stateExpires[key] = new Date().getTime() + 24*3600*1000;	// this.$store.state.$xx=?赋值方式 默认缓存一天
		uni.setStorageSync('stateExpires', stateExpires);
	} catch (e) {}
	
	return Reflect.set(target, key, value);
}
let stateGet = (target:any, key:string, receiver:any) => {
	try {
		/* 从Storage读取数据 */
		let stateExpires = uni.getStorageSync('stateExpires') || {};
		let stateValue = Reflect.get(target, key, receiver);
		let isEmptyStateValue = !stateValue || JSON.stringify(stateValue)=='{}' || JSON.stringify(stateValue)=='[]';
		if (stateExpires[key] && new Date().getTime() > stateExpires[key]) {
			// 缓存过期
			if (!isEmptyStateValue) Reflect.set(target, key, null);
		} else {
			// 永久存储或未过期
			if (isEmptyStateValue) {
				let storageValue = uni.getStorageSync(key);
				if (storageValue && JSON.stringify(storageValue) != JSON.stringify(stateValue)) Reflect.set(target, key, storageValue);
			}
		}

		/* 从接口读取数据（get不支持同步async） */
		if (Reflect.get(target, key, receiver) === null && target._stateInit[key]) {
			request({
				url: target._stateInit[key].uri,
				data: target._stateInit[key].data,
				method: target._stateInit[key].method||'get',
				microService: target._stateInit[key].microService,
			}).then((res:any) => {
				let value = target._stateInit[key].subKey&&typeof res=='object' ? res[ target._stateInit[key].subKey ] : res;
				stateSet(target, key, value);
			});
		}

		return Reflect.get(target, key, receiver);
	} catch (e) {
		return Reflect.get(target, key, receiver);
	}
};
store.replaceState(
	new Proxy(store.state, {
		get: stateGet,
		set: stateSet
	})
)

export default store
