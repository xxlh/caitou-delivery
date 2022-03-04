import state from '@/store/state'

function request(options:any) {
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			url: /^https?:\/\//.test(options.url) ? options.url : (options.microService=='user'?state.UserBaseUrl:state.baseUrl) + options.url,
			header: {
				Authorization: state._token,
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else if (res.statusCode === 401) {
					let pages= getCurrentPages();
					let currentPage:any = pages[pages.length - 1];
					let currentQuery = null;
					// #ifndef APP-PLUS
					let currentParam = currentPage.options || currentPage.$route.query;	// 安卓下 currentPage.$route 为空
					currentQuery = Object.keys(currentParam).map(key => key+'='+currentParam[key]).join('&');
					// #endif
					if(currentPage.route == 'pages/my/login' ) {reject(res.data); return}
					uni.redirectTo({
						url: '/pages/my/login?referenceURL=' + encodeURIComponent('/' + currentPage.route + (currentQuery?'?'+currentQuery:''))
					});
				} else {
					reject(res.data);
				}
			},
			fail: (err) => {
				reject(err);
			},
		});
	})
}

function get(uri:string, options = {}) {
	return request({
		...options,
		url: uri,
		method: 'get',
	});
}

function post(uri:string, data:any, options = {}) {
	return request({
		...options,
		url: uri,
		data,
		method: 'post',
	});
}

export default request;
export {get, post, request};