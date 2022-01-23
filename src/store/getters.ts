export default {
	$payto(state:any) {
		if (state['$payto'].expireTime > new Date().getTime()) {
			return state['$payto'].data
		} else {
			return state['$payto'].data = null;
		}
	},
}