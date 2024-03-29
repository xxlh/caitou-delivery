let token = '';
let userinfo = null;
try {
	// 重启小程序 保持数据
	token = uni.getStorageSync('token');
	userinfo = uni.getStorageSync('userinfo');
} catch (e) {}

// _开头的state是存储localStorage
// $开头的state是会自动过期，需用this.setState({key:$xx, value:?, expireIn:24*3600}) 或 this.$store.state.$xx=?赋值(缓存一天)
export default {
	_token: token,
	callUniLogin: false,
	loginProvider: "",
	loginProviderList: [],
	_userinfo: userinfo,
	currentLocation: {lng:"", lat:""},
	$men_nearby: null,
	$referred_by: null,
	baseUrl: process.env.NODE_ENV === 'development' ? "http://delivery-api-dev.caitou.ieexx.com/" : 'https://delivery-api.caitou.ieexx.com/',
	UserBaseUrl: process.env.NODE_ENV === 'development' ? "http://user-api-dev.caitou.ieexx.com/	" : 'https://user-api.caitou.ieexx.com/',
	MainBaseUrl: process.env.NODE_ENV === 'development' ? "http://api-dev.caitou.ieexx.com/	" : 'https://api.caitou.ieexx.com/',
	shareParams: {
		title: '查看物业费用明细',
		content: '您好业主，查看物业费用明细，小区公告，生鲜配送上门！',
		imageUrl: '/static/share.jpg',
		path: 'pages/index/index?from=share'
	},
	_stateInit: {	// 当页面读取数据null值的时候，可自动远程抓取
		$men_nearby: {uri:'men'},
	}
}