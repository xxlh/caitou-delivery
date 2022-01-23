import {get, post} from '@/common/request'

type param = { commit: any, state: any }

export default {
	// lazy loading openid
	
	wechatLogin: async function ({
		commit,
		state
	}:param) {
		return await new Promise((resolve, reject) => {
			commit('setLoginProvider');
			uni.login({
				provider: state.loginProvider,
				success: (res) => {
					commit('setUniLogin');
					// 将用户登录code传递到后台置换用户SessionKey、OpenId等信息
					get('auth/token?code='+res.code+(state.$referred_by?'&referred_by='+state.$referred_by:''), {microService: 'user'}).then((tokenRes:any) => {
						// 更新保存在 store 中的登录状态
						commit('setToken', tokenRes.token_type+' '+tokenRes.token)
						commit('setUserinfo', tokenRes.userinfo)
						resolve(tokenRes.token);
					}).catch((error)=>{
						console.log('code换取openid失败', error);
						reject(error);
					});
				},
				fail: (err) => {
					console.log('uni.login 接口调用失败，将无法正常使用开放接口等服务', err);
					reject(err);
				}
			})
		})
	},
	getUserinfo({commit, state}:param, payload:any) {
		return new Promise((resolve, reject) => {
			if (state._userinfo && state._token) {
				resolve(state._userinfo)
			} else {
				get('user/info').then((userinfo:any) => {
					commit('setUserinfo', userinfo);
					resolve(userinfo);
				}).catch((err:any) => {
					reject(err);
				})
			}
		})
	},
	addToCart({commit, state}:param, payload:any) {
		return new Promise(async (resolve, reject) => {
			if (!state.$cart) {
				state.$cart = await get('cart').catch((err:any) => {
					reject(err);
				})
				commit('setState', {key:'$cart', value:state.$cart});
			}
			post('cart', {sku_id: payload.product_sku.id, count:payload.count, consume_date:payload.consume_date, referred_by:payload.referred_by})
			state.$cart.push(payload);
			resolve(true)
		})
	},
}