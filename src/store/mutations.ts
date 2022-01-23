export default {
	setToken(state:any, token:string) {
		state._token = token;
		try {
			uni.setStorageSync('token', token);
		} catch (e) {}
	},
	setUniLogin(state:any) {
		state.callUniLogin = true;
	},
	setLogin(state:any, provider:string) {
		state.hasLogin = true;
		state.loginProvider = provider;
		try {
			uni.setStorageSync('hasLogin', true);
		} catch (e) {}
	},
	setLogout(state:any) {
		state._userinfo = null;
		state._token = '';
		state.$bills = null;
		state.$payto = null;
		state.unpayTotal = 0;

		try {
			uni.removeStorageSync("token");
			uni.removeStorageSync("$bills");
			uni.removeStorageSync("$payto");
			uni.removeStorageSync("stateExpires");
		} catch (e) {}
	},
	setLoginProvider(state:any) {
		uni.getProvider({
			service: 'oauth',
			success: result => {
				state.loginProviderList = result.provider ? result.provider.map(value => {
					let providerName = '';
					switch (value) {
						case 'weixin':
							providerName = '微信登录'
							break;
						case 'qq':
							providerName = 'QQ登录'
							break;
						case 'sinaweibo':
							providerName = '新浪微博登录'
							break;
						case 'xiaomi':
							providerName = '小米登录'
							break;
						case 'alipay':
							providerName = '支付宝登录'
							break;
						case 'baidu':
							providerName = '百度登录'
							break;
						case 'toutiao':
							providerName = '头条登录'
							break;
						case 'apple':
							providerName = '苹果登录'
							break;
					}
					return {
						name: providerName,
						id: value
					}
				}) : [{
					name: '微信登录',
					id: 'weixin'
				}];
				state.loginProvider = state.loginProviderList[0].id;
			},
			fail: (error) => {
				console.log('获取登录通道失败', error);
			}
		});
	},
	setVerify(state:any, userinfo:{realname:string, id_number:string}) {
		state._userinfo.realname = userinfo.realname
		state._userinfo.id_number = userinfo.id_number
	},
	setUserinfo(state:any, info:any) {
		state._userinfo = state._userinfo || {};
		for (const key in info) {
			state._userinfo[key] = info[key];
		}
		try {
			uni.setStorageSync('userinfo', state._userinfo);
		} catch (e) {}
	},
	setState(state:any, playload:{key:string, value:any, expireIn:number}) {	// 只能接收2个参数
		state[playload.key] = playload.value;
		
		if (playload.key.substr(0,1) !== '$' && !playload.expireIn) return;
		try {
			uni.setStorageSync(playload.key, playload.value);

			let stateExpires = uni.getStorageSync('stateExpires') || {};
			stateExpires[playload.key] = new Date().getTime() + (playload.expireIn||24*3600)*1000;
			uni.setStorageSync('stateExpires', stateExpires);
		} catch (e) {}
	},
}