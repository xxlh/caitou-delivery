export default {
	isLogin(state:any) {
		return state._token && state._userinfo;
	},
}